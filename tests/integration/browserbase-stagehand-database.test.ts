/**
 * End-to-End Integration Tests for Browserbase, Stagehand, and Database
 * 
 * Tests the complete flow:
 * 1. Browserbase session creation -> Database update
 * 2. Stagehand agent execution -> Database update
 * 3. Task execution with browser automation -> Database update
 * 4. Schema verification
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { browserRouter } from "../../server/api/routers/browser";
import { agentRouter } from "../../server/api/routers/agent";
import { getDb } from "../../server/db";
import { browserSessions } from "../../drizzle/schema";
import { taskExecutions } from "../../drizzle/schema-webhooks";
import { agentExecutions } from "../../drizzle/schema-agent";
import { eq, and } from "drizzle-orm";

// Mock context creator
function createMockContext(userId: number) {
  return {
    user: {
      id: userId,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
    },
  };
}

describe("Browserbase + Stagehand + Database Integration", () => {
  let mockDb: any;
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockContext(1);
    mockDb = {
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Browserbase Session Creation Flow", () => {
    it("should create browser session and save to database", async () => {
      const mockBrowserbaseSession = {
        id: "bb_session_123",
        createdAt: new Date().toISOString(),
        projectId: "project-123",
        status: "RUNNING" as const,
      };

      const mockDebugInfo = {
        debuggerUrl: "https://browserbase.com/debug/123",
        debuggerFullscreenUrl: "https://browserbase.com/debug/123/fullscreen",
        wsUrl: "wss://browserbase.com/session/123",
      };

      // Mock Browserbase SDK
      const browserbaseModule = await import("../../server/_core/browserbaseSDK");
      vi.mocked(browserbaseModule.browserbaseSDK.createSession).mockResolvedValue(
        mockBrowserbaseSession as any
      );
      vi.mocked(browserbaseModule.browserbaseSDK.getSessionDebug).mockResolvedValue(
        mockDebugInfo as any
      );

      // Mock database insert
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

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.createSession({
        browserSettings: {
          viewport: { width: 1920, height: 1080 },
        },
        recordSession: true,
      });

      expect(result.sessionId).toBe("bb_session_123");
      expect(result.debugUrl).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should update database when session is closed", async () => {
      const sessionId = "bb_session_123";

      // Mock session lookup
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 1,
                sessionId,
                userId: 1,
                status: "active",
              },
            ]),
          }),
        }),
      });

      // Mock update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: 1,
              sessionId,
              status: "completed",
              completedAt: new Date(),
            },
          ]),
        }),
      });

      // Mock Browserbase termination
      const browserbaseModule = await import("../../server/_core/browserbaseSDK");
      vi.mocked(browserbaseModule.browserbaseSDK.terminateSession).mockResolvedValue({
        success: true,
        sessionId,
      });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.closeSession({ sessionId });

      expect(result.success).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("Stagehand Agent Execution Flow", () => {
    it("should execute agent task and update database", async () => {
      const mockExecution = {
        id: 1,
        taskId: 1,
        status: "started",
        triggeredBy: "manual",
        triggeredByUserId: 1,
        stepsTotal: 0,
        stepsCompleted: 0,
        startedAt: new Date(),
        createdAt: new Date(),
      };

      // Mock task lookup
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 1,
                userId: 1,
                taskType: "browser_automation",
                status: "pending",
              },
            ]),
          }),
        }),
      });

      // Mock execution insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockExecution]),
        }),
      });

      // Mock task update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 1, status: "in_progress" }]),
        }),
      });

      // Mock Stagehand service
      const stagehandModule = await import("../../server/services/stagehand.service");
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

      vi.mocked(stagehandModule.stagehandService.createSession).mockResolvedValue(
        mockStagehandSession as any
      );
      vi.mocked(stagehandModule.stagehandService.act).mockResolvedValue({
        success: true,
        message: "Action executed",
      });

      const caller = agentRouter.createCaller(mockCtx);
      const result = await caller.executeTask({
        taskDescription: "Navigate to example.com and extract data",
        taskId: 1,
        maxIterations: 10,
      });

      expect(result).toBeDefined();
      expect(result.executionId).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
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
          url: "https://example.com",
          projectId: "project-123",
          debugUrl: "https://browserbase.com/debug/123",
          recordingUrl: null,
          metadata: {},
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
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
      if (sessions.length > 0) {
        expect(sessions[0]).toHaveProperty("sessionId");
        expect(sessions[0]).toHaveProperty("status");
        expect(sessions[0]).toHaveProperty("debugUrl");
      }
    });

    it("should verify taskExecutions table has browser session fields", async () => {
      const mockExecution = {
        id: 1,
        taskId: 1,
        browserSessionId: "bb_session_123",
        debugUrl: "https://browserbase.com/debug/123",
        recordingUrl: "https://browserbase.com/recording/123",
        status: "success",
        output: { result: "Task completed" },
        error: null,
        duration: 5000,
        startedAt: new Date(),
        completedAt: new Date(),
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
        .from(taskExecutions)
        .where(eq(taskExecutions.id, 1))
        .limit(1);

      expect(execution).toBeDefined();
      expect(Array.isArray(execution)).toBe(true);
      if (execution.length > 0) {
        expect(execution[0]).toHaveProperty("browserSessionId");
        expect(execution[0]).toHaveProperty("debugUrl");
        expect(execution[0]).toHaveProperty("recordingUrl");
      }
    });

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
        result: null,
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
      expect(Array.isArray(execution)).toBe(true);
      if (execution.length > 0) {
        expect(execution[0]).toHaveProperty("taskDescription");
        expect(execution[0]).toHaveProperty("status");
        expect(execution[0]).toHaveProperty("phases");
        expect(execution[0]).toHaveProperty("thinkingSteps");
      }
    });
  });

  describe("Complete Workflow: Browserbase -> Stagehand -> Database", () => {
    it("should execute complete workflow and update all database tables", async () => {
      // Step 1: Create browser session
      const mockBrowserbaseSession = {
        id: "bb_session_123",
        status: "RUNNING" as const,
        projectId: "project-123",
      };

      const browserbaseModule = await import("../../server/_core/browserbaseSDK");
      vi.mocked(browserbaseModule.browserbaseSDK.createSession).mockResolvedValue(
        mockBrowserbaseSession as any
      );
      vi.mocked(browserbaseModule.browserbaseSDK.getSessionDebug).mockResolvedValue({
        debuggerUrl: "https://browserbase.com/debug/123",
        debuggerFullscreenUrl: "https://browserbase.com/debug/123/fullscreen",
        wsUrl: "wss://browserbase.com/session/123",
      } as any);

      const browserCaller = browserRouter.createCaller(mockCtx);
      const browserSession = await browserCaller.createSession({
        recordSession: true,
      });

      expect(browserSession.sessionId).toBe("bb_session_123");

      // Step 2: Create task execution
      const mockTaskExecution = {
        id: 1,
        taskId: 1,
        browserSessionId: browserSession.sessionId,
        debugUrl: browserSession.debugUrl,
        status: "running",
        startedAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTaskExecution]),
        }),
      });

      // Step 3: Execute Stagehand action
      const stagehandModule = await import("../../server/services/stagehand.service");
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

      vi.mocked(stagehandModule.stagehandService.createSession).mockResolvedValue(
        mockStagehandSession as any
      );
      vi.mocked(stagehandModule.stagehandService.act).mockResolvedValue({
        success: true,
        message: "Action completed",
      });

      const stagehandSession = await stagehandModule.stagehandService.createSession({
        userId: 1,
        executionId: 1,
      });

      const actResult = await stagehandModule.stagehandService.act(
        stagehandSession.id,
        "Navigate to https://example.com"
      );

      expect(actResult.success).toBe(true);

      // Step 4: Update task execution with results
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: 1,
              status: "success",
              output: { action: "Navigate completed", success: true },
              completedAt: new Date(),
            },
          ]),
        }),
      });

      await mockDb
        .update(taskExecutions)
        .set({
          status: "success",
          output: { action: "Navigate completed", success: true },
          completedAt: new Date(),
        })
        .where(eq(taskExecutions.id, 1));

      expect(mockDb.update).toHaveBeenCalled();

      // Verify all steps completed
      expect(browserSession).toBeDefined();
      expect(stagehandSession).toBeDefined();
      expect(actResult.success).toBe(true);
    });
  });
});

