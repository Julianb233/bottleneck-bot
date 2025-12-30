"use client";

import React, { useState } from "react";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Zap, Activity, Settings, Play, Pause, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

interface AIAgent {
  id: string;
  name: string;
  status: "active" | "idle" | "processing";
  type: string;
  description: string;
}

export default function RobotTest() {
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents: AIAgent[] = [
    {
      id: "1",
      name: "Data Processor",
      status: "active",
      type: "Automation",
      description: "Processes and analyzes large datasets efficiently"
    },
    {
      id: "2",
      name: "Content Generator",
      status: "idle",
      type: "Content",
      description: "Creates engaging content based on your specifications"
    },
    {
      id: "3",
      name: "Task Scheduler",
      status: "processing",
      type: "Scheduling",
      description: "Manages and schedules automated tasks"
    },
    {
      id: "4",
      name: "Response Handler",
      status: "active",
      type: "Communication",
      description: "Handles customer inquiries and responses"
    }
  ];

  const getStatusColor = (status: AIAgent["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "idle":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => setLocation("/wizard-of-ai")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wizard of AI
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                Robot Test
              </h1>
              <p className="text-muted-foreground mt-1">
                Test and manage your AI agents
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Agents List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  AI Agents
                </CardTitle>
                <CardDescription>
                  Select an agent to view details and test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedAgent === agent.id
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {agent.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(
                              agent.status
                            )} animate-pulse`}
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {agent.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {agent.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">
                  <Play className="mr-2 h-4 w-4" />
                  Start Test
                </Button>
                <Button className="w-full" variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button className="w-full" variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 3D Visualization */}
          <div className="lg:col-span-2">
            <Card className="w-full h-[600px] md:h-[700px] bg-gradient-to-br from-card via-card/95 to-card/90 relative overflow-hidden border-2 shadow-2xl">
              <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="rgb(37, 99, 235)"
              />
              
              <div className="flex flex-col h-full">
                {/* Header in 3D view */}
                <div className="p-6 relative z-10 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                        {selectedAgent
                          ? agents.find((a) => a.id === selectedAgent)?.name
                          : "Select an Agent"}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {selectedAgent
                          ? agents.find((a) => a.id === selectedAgent)?.description
                          : "Choose an AI agent from the list to begin testing"}
                      </p>
                    </div>
                    {selectedAgent && (
                      <Badge
                        variant={
                          agents.find((a) => a.id === selectedAgent)?.status ===
                          "active"
                            ? "default"
                            : "secondary"
                        }
                        className="flex items-center gap-2"
                      >
                        <Zap className="h-3 w-3" />
                        {agents.find((a) => a.id === selectedAgent)?.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Spline Scene */}
                <div className="flex-1 relative min-h-[400px]">
                  <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

