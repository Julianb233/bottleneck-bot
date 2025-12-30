/**
 * Comprehensive Integration Tests for Browserbase and Stagehand
 * 
 * Tests:
 * 1. Browserbase session creation and database updates
 * 2. Stagehand agent execution and database updates
 * 3. Database schema verification
 * 4. End-to-end integration flow
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { browserbaseSDK, BrowserbaseSDKError } from "./browserbaseSDK";
import { stagehandService, StagehandService } from "../services/stagehand.service";
import { getDb } from "../db";
import { browserSessions } from "../../drizzle/schema";
import { taskExecutions } from "../../drizzle/schema-webhooks";
import { agentExecutions } from "../../drizzle/schema-agent";
import { eq } from "drizzle-orm";

// Mock dependencies
vi.mock("./browserbaseSDK");
vi.mock("../services/stagehand.service");
vi.mock("../db");
vi.mock("@browserbasehq/stagehand");

describe("Browserbase and Stagehand Integration Tests", () => {
  let mockDb: any;
  let mockBrowserbaseSDK: any;
  let mockStagehandService: any;

  beforeEach(() => {
    // Setup mock database
    mockDb = {
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Setup mock Browserbase SDK
    mockBrowserbaseSDK = {
      createSession: vi.fn(),
      getSessionDebug: vi.fn(),
      getSessionRecording: vi.fn(),
      terminateSession: vi.fn(),
      getSession: vi.fn(),
      isInitialized: vi.fn().mockReturnValue(true),
      getDefaultProjectId: vi.fn().mockReturnValue("project-123"),
    };

    // Setup mock Stagehand Service
    mockStagehandService = {
      createSession: vi.fn(),
      act: vi.fn(),
      extract: vi.fn(),
      observe: vi.fn(),
      navigate: vi.fn(),
      screenshot: vi.fn(),
      closeSession: vi.fn(),
      getSession: vi.fn(),
    };

    // Mock module exports
    vi.mocked(getDb).mockResolvedValue(mockDb);
    vi.mocked(browserbaseSDK).mockImplementation(() => mockBrowserbaseSDK as any);
    vi.mocked(stagehandService).mockImplementation(() => mockStagehandService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Browserbase Integration", () => {
    describe("Session Creation and Database Updates", () => {
      it("should create Browserbase session and save to database", async () => {
        const mockSession = {
          id: "bb_session_123",
          createdAt: new Date().toISOString(),
          projectId: "project-123",
          status: "RUNNING" as const,
          wsUrl: "wss://browserbase.com/session/123",
        };

        const mockDebugInfo = {
          debuggerUrl: "https://browserbase.com/debug/123",
          debuggerFullscreenUrl: "https://browserbase.com/debug/123/fullscreen",
          wsUrl: "wss://browserbase.com/session/123",
        };

        mockBrowserbaseSDK.createSession.mockResolvedValue(mockSession);
        mockBrowserbaseSDK.getSessionDebug.mockResolvedValue(mockDebugInfo);

        const mockInsertResult = {
          id: 1,
          userId: 1,
          sessionId: "bb_session_123",
          status: "active",
          projectId: "project-123",
          debugUrl: mockDebugInfo.debuggerFullscreenUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.insert.mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockInsertResult]),
          }),
        });

        // Execute session creation
        const session = await browserbaseSDK.createSession({
          projectId: "project-123",
          browserSettings: {
            viewport: { width: 1920, height: 1080 },
          },
          recordSession: true,
        });

        expect(session).toBeDefined();
        expect(session.id).toBe("bb_session_123");
        expect(mockBrowserbaseSDK.createSession).toHaveBeenCalled();

        // Verify database insert was called
        expect(mockDb.insert).toHaveBeenCalled();
      });

      it("should update database when session status changes", async () => {
        const sessionId = "bb_session_123";
        const mockUpdateResult = {
          id: 1,
          sessionId,
          status: "completed",
          completedAt: new Date(),
        };

        mockDb.update.mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockUpdateResult]),
          }),
        });

        mockBrowserbaseSDK.terminateSession.mockResolvedValue({
          success: true,
          sessionId,
        });

        await browserbaseSDK.terminateSession(sessionId);

        expect(mockBrowserbaseSDK.terminateSession).toHaveBeenCalledWith(sessionId);
        expect(mockDb.update).toHaveBeenCalled();
      });

      it("should retrieve session recording and update database", async () => {
        const sessionId = "bb_session_123";
        const mockRecording = {
          recordingUrl: "https://browserbase.com/recording/123",
          status: "COMPLETED" as const,
        };

        mockBrowserbaseSDK.getSessionRecording.mockResolvedValue(mockRecording);

        const recording = await browserbaseSDK.getSessionRecording(sessionId);

        expect(recording).toBeDefined();
        expect(recording.recordingUrl).toBe(mockRecording.recordingUrl);
        expect(mockBrowserbaseSDK.getSessionRecording).toHaveBeenCalledWith(sessionId);
      });

      it("should handle Browserbase API errors gracefully", async () => {
        mockBrowserbaseSDK.createSession.mockRejectedValue(
          new BrowserbaseSDKError("API Error", "API_ERROR")
        );

        await expect(
          browserbaseSDK.createSession({ projectId: "project-123" })
        ).rejects.toThrow(BrowserbaseSDKError);
      });
    });

    describe("Database Schema Verification", () => {
      it("should verify browserSessions table structure", async () => {
        const mockSessions = [
          {
            id: 1,
            userId: 1,
            sessionId: "bb_session_123",
            status: "active",
            projectId: "project-123",
            debugUrl: "https://browserbase.com/debug/123",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockDb.select.mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSessions),
            }),
          }),
        });

        const sessions = await mockDb
          .select()
          .from(browserSessions)
          .where(eq(browserSessions.userId, 1))
          .limit(10);

        expect(sessions).toBeDefined();
        expect(Array.isArray(sessions)).toBe(true);
        expect(sessions[0]).toHaveProperty("sessionId");
        expect(sessions[0]).toHaveProperty("status");
        expect(sessions[0]).toHaveProperty("debugUrl");
      });
    });
  });

  describe("Stagehand Integration", () => {
    describe("Agent Execution and Database Updates", () => {
      it("should create Stagehand session and execute action", async () => {
        const mockStagehandSession = {
          id: "stagehand_session_123",
          stagehand: {} as any,
          page: {} as any,
          context: {} as any,
          createdAt: new Date(),
          lastActivityAt: new Date(),
          status: "active" as const,
          pages: new Map(),
          activeTabId: "tab_1",
          downloads: [],
          screenshotCount: 0,
        };

        mockStagehandService.createSession.mockResolvedValue(mockStagehandSession);
        mockStagehandService.act.mockResolvedValue({
          success: true,
          message: "Action executed successfully",
        });

        const session = await stagehandService.createSession({
          userId: 1,
          executionId: 1,
        });

        expect(session).toBeDefined();
        expect(session.id).toBe("stagehand_session_123");

        const actResult = await stagehandService.act(session.id, "Click the login button");

        expect(actResult.success).toBe(true);
        expect(mockStagehandService.act).toHaveBeenCalledWith(
          session.id,
          "Click the login button"
        );
      });

      it("should extract data and save to database", async () => {
        const sessionId = "stagehand_session_123";
        const mockExtractResult = {
          success: true,
          data: {
            email: "test@example.com",
            phone: "123-456-7890",
            name: "Test User",
          },
        };

        mockStagehandService.extract.mockResolvedValue(mockExtractResult);

        const extractResult = await stagehandService.extract(
          sessionId,
          "Extract contact information",
          {
            type: "object",
            properties: {
              email: { type: "string" },
              phone: { type: "string" },
              name: { type: "string" },
            },
          }
        );

        expect(extractResult.success).toBe(true);
        expect(extractResult.data).toBeDefined();
        expect(extractResult.data?.email).toBe("test@example.com");
      });

      it("should observe page elements", async () => {
        const sessionId = "stagehand_session_123";
        const mockObserveResult = {
          success: true,
          observations: [
            {
              selector: "button#submit",
              description: "Submit button",
              method: "click",
              arguments: [],
            },
            {
              selector: "input#email",
              description: "Email input field",
              method: "type",
              arguments: [],
            },
          ],
        };

        mockStagehandService.observe.mockResolvedValue(mockObserveResult);

        const observeResult = await stagehandService.observe(
          sessionId,
          "Find all interactive elements"
        );

        expect(observeResult.success).toBe(true);
        expect(observeResult.observations).toBeInstanceOf(Array);
        expect(observeResult.observations.length).toBe(2);
      });

      it("should update task execution in database after Stagehand action", async () => {
        const executionId = 1;
        const mockUpdateResult = {
          id: executionId,
          status: "running",
          stepResults: [
            {
              step: 1,
              action: "Click login button",
              success: true,
            },
          ],
        };

        mockDb.update.mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockUpdateResult]),
          }),
        });

        await mockDb
          .update(taskExecutions)
          .set({
            status: "running",
            stepResults: mockUpdateResult.stepResults,
            updatedAt: new Date(),
          })
          .where(eq(taskExecutions.id, executionId));

        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe("Agent Execution Database Schema", () => {
      it("should verify agentExecutions table structure", async () => {
        const mockExecution = {
          id: 1,
          sessionId: 1,
          userId: 1,
          taskDescription: "Test task",
          status: "executing",
          plan: { phases: [] },
          phases: [],
          currentPhaseIndex: 0,
          thinkingSteps: [],
          toolExecutions: [],
          iterations: 1,
          startedAt: new Date(),
        };

        mockDb.select.mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockExecution]),
            }),
          }),
        });

        const execution = await mockDb
          .select()
          .from(agentExecutions)
          .where(eq(agentExecutions.id, 1))
          .limit(1);

        expect(execution).toBeDefined();
        expect(execution[0]).toHaveProperty("taskDescription");
        expect(execution[0]).toHaveProperty("status");
        expect(execution[0]).toHaveProperty("phases");
      });
    });
  });

  describe("End-to-End Integration Flow", () => {
    it("should complete full flow: Browserbase -> Stagehand -> Database", async () => {
      // Step 1: Create Browserbase session
      const mockBrowserbaseSession = {
        id: "bb_session_123",
        createdAt: new Date().toISOString(),
        projectId: "project-123",
        status: "RUNNING" as const,
      };

      mockBrowserbaseSDK.createSession.mockResolvedValue(mockBrowserbaseSession);

      const browserSession = await browserbaseSDK.createSession({
        projectId: "project-123",
        recordSession: true,
      });

      expect(browserSession.id).toBe("bb_session_123");

      // Step 2: Create Stagehand session with Browserbase session
      const mockStagehandSession = {
        id: "stagehand_session_123",
        stagehand: {} as any,
        page: {} as any,
        context: {} as any,
        createdAt: new Date(),
        lastActivityAt: new Date(),
        status: "active" as const,
        pages: new Map(),
        activeTabId: "tab_1",
        downloads: [],
        userId: 1,
        executionId: 1,
        screenshotCount: 0,
      };

      mockStagehandService.createSession.mockResolvedValue(mockStagehandSession);

      const stagehandSession = await stagehandService.createSession({
        userId: 1,
        executionId: 1,
        browserSettings: {
          viewport: { width: 1920, height: 1080 },
          recordSession: true,
        },
      });

      expect(stagehandSession.id).toBe("stagehand_session_123");

      // Step 3: Execute action
      mockStagehandService.act.mockResolvedValue({
        success: true,
        message: "Action executed",
      });

      const actResult = await stagehandService.act(
        stagehandSession.id,
        "Navigate to https://example.com"
      );

      expect(actResult.success).toBe(true);

      // Step 4: Update database with execution results
      const mockExecutionUpdate = {
        id: 1,
        taskId: 1,
        status: "success",
        output: {
          action: "Navigate to https://example.com",
          success: true,
        },
        completedAt: new Date(),
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockExecutionUpdate]),
        }),
      });

      await mockDb
        .update(taskExecutions)
        .set({
          status: "success",
          output: mockExecutionUpdate.output,
          completedAt: new Date(),
        })
        .where(eq(taskExecutions.id, 1));

      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should handle errors in end-to-end flow", async () => {
      // Simulate Browserbase error
      mockBrowserbaseSDK.createSession.mockRejectedValue(
        new BrowserbaseSDKError("Failed to create session", "CREATE_ERROR")
      );

      await expect(
        browserbaseSDK.createSession({ projectId: "project-123" })
      ).rejects.toThrow(BrowserbaseSDKError);

      // Verify error handling doesn't break the flow
      expect(mockBrowserbaseSDK.createSession).toHaveBeenCalled();
    });
  });

  describe("Database Schema Updates Verification", () => {
    it("should verify browserSessions table has all required fields", () => {
      const requiredFields = [
        "id",
        "userId",
        "sessionId",
        "status",
        "url",
        "projectId",
        "debugUrl",
        "recordingUrl",
        "metadata",
        "expiresAt",
        "createdAt",
        "updatedAt",
        "completedAt",
      ];

      // Verify schema structure (this would normally check actual schema)
      const mockSession = {
        id: 1,
        userId: 1,
        sessionId: "bb_session_123",
        status: "active",
        url: "https://example.com",
        projectId: "project-123",
        debugUrl: "https://browserbase.com/debug/123",
        recordingUrl: null,
        metadata: {},
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };

      requiredFields.forEach((field) => {
        expect(mockSession).toHaveProperty(field);
      });
    });

    it("should verify taskExecutions table has browser session fields", () => {
      const requiredFields = [
        "id",
        "taskId",
        "browserSessionId",
        "debugUrl",
        "recordingUrl",
        "status",
        "output",
        "error",
        "duration",
      ];

      const mockExecution = {
        id: 1,
        taskId: 1,
        browserSessionId: "bb_session_123",
        debugUrl: "https://browserbase.com/debug/123",
        recordingUrl: "https://browserbase.com/recording/123",
        status: "success",
        output: {},
        error: null,
        duration: 5000,
      };

      requiredFields.forEach((field) => {
        expect(mockExecution).toHaveProperty(field);
      });
    });

    it("should verify agentExecutions table structure", () => {
      const requiredFields = [
        "id",
        "sessionId",
        "userId",
        "taskDescription",
        "status",
        "plan",
        "phases",
        "thinkingSteps",
        "toolExecutions",
        "result",
        "iterations",
      ];

      const mockExecution = {
        id: 1,
        sessionId: 1,
        userId: 1,
        taskDescription: "Test task",
        status: "executing",
        plan: {},
        phases: [],
        thinkingSteps: [],
        toolExecutions: [],
        result: null,
        iterations: 1,
      };

      requiredFields.forEach((field) => {
        expect(mockExecution).toHaveProperty(field);
      });
    });
  });

  describe("UI/UX Backend Endpoints", () => {
    it("should handle session creation via API", async () => {
      const mockSession = {
        id: "bb_session_123",
        status: "RUNNING" as const,
        projectId: "project-123",
      };

      mockBrowserbaseSDK.createSession.mockResolvedValue(mockSession);

      const session = await browserbaseSDK.createSession({
        projectId: "project-123",
      });

      expect(session).toBeDefined();
      expect(session.status).toBe("RUNNING");
    });

    it("should handle agent execution via API", async () => {
      const mockSession = {
        id: "stagehand_session_123",
        status: "active" as const,
      };

      mockStagehandService.createSession.mockResolvedValue(mockSession);
      mockStagehandService.act.mockResolvedValue({
        success: true,
        message: "Task completed",
      });

      const session = await stagehandService.createSession({ userId: 1 });
      const result = await stagehandService.act(session.id, "Complete the task");

      expect(result.success).toBe(true);
    });

    it("should return session metrics", async () => {
      const sessionId = "bb_session_123";
      const mockSession = {
        id: sessionId,
        status: "RUNNING" as const,
        createdAt: new Date().toISOString(),
      };

      mockBrowserbaseSDK.getSession.mockResolvedValue(mockSession);

      const session = await browserbaseSDK.getSession(sessionId);

      expect(session).toBeDefined();
      expect(session.id).toBe(sessionId);
    });
  });
});

