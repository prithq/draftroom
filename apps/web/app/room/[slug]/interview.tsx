// apps/web/app/room/[slug]/interview.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Users,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  LogOut,
  ArrowLeft,
  ChevronDown,
  Play,
  Code2,
  PenTool,
  MessageSquare,
  X,
  Terminal,
  BookOpen,
  Loader2,
} from "lucide-react";

import { Whiteboard } from "@/components/Whiteboard";
import { QuestionPicker } from "@/components/QuestionPicker";
import { CodeEditor } from "@/components/CodeEditor";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
}

interface Peer {
  socketId: string;
  stream: MediaStream;
  name: string;
  color: string;
}

interface RoomUser {
  socketId: string;
  userId: string;
  name: string;
  email: string;
  color: string;
}

interface Question {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  tags: string[];
  starterCode: Record<string, string>;
  testCases: {
    id: string;
    input: any;
    expected: any;
    isHidden: boolean;
    weight: number;
  }[];
}

interface InterviewProps {
  room: {
    id: string;
    name: string;
    slug: string;
    roomType: "INTERVIEW" | "SOLO";
    language: string;
    isActive: boolean;
    ownerId: string;
  };
  user: User;
  isInterviewer: boolean;
  question?: Question | null;
  code: string;
  selectedLanguage: string;
  languages: string[];
  output: string;
  isRunning: boolean;
  canvasElements: any[];
  cursors: Record<string, { x: number; y: number; name: string; color: string }>;
  currentSocketId: string;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onRunCode: () => void;
  onCanvasChange: (elements: any[]) => void;
  onQuestionUpdate?: (question: Question) => void;
  onBackToLobby: () => void;
  onLeave: () => void;
  localStream: MediaStream | null;
  peers: Peer[];
  roomUsers: RoomUser[];
  audioEnabled: boolean;
  videoEnabled: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  participantCount: number;
  copyInviteLink: () => void;
  copied: boolean;
}

type CenterTab = "code" | "whiteboard";

export function InterviewView({
  room,
  user,
  isInterviewer,
  question,
  code,
  selectedLanguage,
  languages,
  output,
  isRunning,
  canvasElements,
  cursors,
  currentSocketId,
  isConnected,
  emit,
  onCodeChange,
  onLanguageChange,
  onRunCode,
  onCanvasChange,
  onQuestionUpdate,
  onBackToLobby,
  onLeave,
  localStream,
  peers,
  roomUsers,
  audioEnabled,
  videoEnabled,
  toggleAudio,
  toggleVideo,
  participantCount,
  copyInviteLink,
  copied,
}: InterviewProps) {
  const [showQuestion, setShowQuestion] = useState(true);
  const [centerTab, setCenterTab] = useState<CenterTab>("code");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Handle video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    peers.forEach((peer) => {
      const videoEl = remoteVideoRefs.current.get(peer.socketId);
      if (videoEl && peer.stream) {
        videoEl.srcObject = peer.stream;
      }
    });
  }, [peers]);

  // Check for permission denied
  useEffect(() => {
    if (!localStream && videoEnabled) {
      const timer = setTimeout(() => {
        setPermissionDenied(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setPermissionDenied(false);
    }
  }, [localStream, videoEnabled]);

  const handleSelectQuestion = async (questionId: string) => {
    setIsUpdatingQuestion(true);
    setQuestionError(null);
    try {
      // 1. Update the database
      const response = await fetch(`/api/rooms/${room.id}/question`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update question");
      }

      const data = await response.json();
      
      // 2. Update local state
      if (onQuestionUpdate && data.question) {
        onQuestionUpdate(data.question);
      }
      
      // 3. 🔥 BROADCAST TO OTHER USERS via Socket.io
      if (isConnected && emit) {
        emit("question-change", {
          roomId: room.id,
          question: data.question
        });
      }
      
      // 4. Update the code editor with new starter code
      if (data.question?.starterCode) {
        const starter = data.question.starterCode[selectedLanguage] || "";
        onCodeChange(starter);
      }
    } catch (error) {
      console.error("Error selecting question:", error);
      setQuestionError(error instanceof Error ? error.message : "Failed to select question");
      throw error;
    } finally {
      setIsUpdatingQuestion(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MEDIUM": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "HARD": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      javascript: "JavaScript",
      python: "Python",
      go: "Go",
      typescript: "TypeScript",
      java: "Java",
      cpp: "C++",
      rust: "Rust",
    };
    return labels[lang] || lang;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const isSolo = room.roomType === "SOLO";

  // Get language for Monaco
  const getMonacoLanguage = (lang: string) => {
    const map: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      go: "go",
      java: "java",
      cpp: "cpp",
      rust: "rust",
    };
    return map[lang] || "javascript";
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <nav className="border-b border-border px-4 py-2 bg-background/50 backdrop-blur-sm shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="inline-block h-2 w-2 rounded-[2px] bg-primary" />
            <span className="text-[15px] font-bold tracking-tight">draftroom</span>
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">/</span>
          <span className="text-xs font-medium hidden sm:inline truncate max-w-[120px]">{room.name}</span>
          <button
            onClick={onBackToLobby}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
          {room.isActive && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-green-500 font-medium shrink-0">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyInviteLink}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {user?.image && (
            <img src={user.image} alt={user.name || "User"} className="h-6 w-6 rounded-full" />
          )}
          <button onClick={onLeave} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question (30%) */}
        {showQuestion && (
          <div className="w-[30%] min-w-[280px] max-w-[400px] border-r border-border bg-card/30 overflow-y-auto shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {question ? "Problem" : "No Question Selected"}
                </h3>
                <button
                  onClick={() => setShowQuestion(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {question ? (
                <div className="space-y-4">
                  {/* Title & Difficulty */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getDifficultyBadge(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{question.pattern}</span>
                    </div>
                    <h4 className="text-base font-bold">{question.title}</h4>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {question.description}
                  </div>

                  {/* Examples */}
                  {question.testCases && question.testCases.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Examples
                      </h5>
                      {question.testCases.filter(tc => !tc.isHidden).slice(0, 2).map((tc, idx) => (
                        <div key={tc.id} className="text-[10px] font-mono bg-muted/20 p-2 rounded border border-border mb-2">
                          <div className="text-muted-foreground">Input: {JSON.stringify(tc.input)}</div>
                          <div className="text-primary">Output: {JSON.stringify(tc.expected)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  <div>
                    <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Constraints
                    </h5>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-muted-foreground">
                      <li>2 ≤ prices.length ≤ 10⁴</li>
                      <li>1 ≤ prices[i] ≤ 10⁵</li>
                      <li>Prices is sorted in ascending order</li>
                    </ul>
                  </div>

                  {/* Interviewer Notes */}
                  {isInterviewer && (
                    <div className="border border-yellow-500/20 bg-yellow-500/5 rounded p-3">
                      <h5 className="text-[10px] font-semibold text-yellow-500 uppercase tracking-wider">Notes</h5>
                      <p className="text-[10px] text-muted-foreground">Only you can see these</p>
                    </div>
                  )}

                  {/* Change Question (Interviewer only) */}
                  {isInterviewer && (
                    <button
                      onClick={() => setShowQuestionPicker(true)}
                      disabled={isUpdatingQuestion}
                      className="w-full text-[10px] text-primary hover:underline py-2 border-t border-border mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingQuestion ? "Updating..." : "Change Question →"}
                    </button>
                  )}

                  {/* Error message */}
                  {questionError && (
                    <div className="text-[10px] text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
                      {questionError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm">No question selected</p>
                  {isInterviewer && (
                    <button
                      onClick={() => setShowQuestionPicker(true)}
                      className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1"
                    >
                      Pick a question →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Panel - Code Editor / Whiteboard (50%) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Center Tabs */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCenterTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  centerTab === "code"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Editor
              </button>
              <button
                onClick={() => setCenterTab("whiteboard")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  centerTab === "whiteboard"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                Whiteboard
              </button>
            </div>
            {centerTab === "code" && (
              <div className="flex items-center gap-2">
                {!showQuestion && question && (
                  <button
                    onClick={() => setShowQuestion(true)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border hover:border-foreground"
                  >
                    Show Question
                  </button>
                )}
                <select
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="text-[10px] bg-transparent border border-border rounded px-1.5 py-0.5 focus:border-foreground focus:outline-none"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageLabel(lang)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onRunCode}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1 text-[10px] bg-foreground text-background px-2.5 py-0.5 rounded hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {isRunning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  {isRunning ? "Running..." : "Run"}
                </button>
              </div>
            )}
          </div>

          {/* Center Content */}
          <div className="flex-1 overflow-hidden">
            {centerTab === "code" ? (
              <div className="h-full flex flex-col">
                {/* Code Editor */}
                <div className="flex-1 bg-muted/20 overflow-hidden">
                  <CodeEditor
                    language={getMonacoLanguage(selectedLanguage)}
                    value={code}
                    onChange={onCodeChange}
                    readOnly={false}
                  />
                </div>
                {/* Output Panel */}
                {output && (
                  <div className="border-t border-border bg-muted/10 shrink-0 max-h-32">
                    <div className="flex items-center justify-between px-3 py-1 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium">Output</span>
                      </div>
                      <button
                        onClick={() => onCodeChange(code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="p-2 font-mono text-[10px] overflow-auto whitespace-pre-wrap max-h-28">
                      {output}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-muted/10 relative">
                <Whiteboard
                  elements={canvasElements}
                  onChange={onCanvasChange}
                  readOnly={!isInterviewer}
                />
                {/* Cursor overlay for collaboration */}
                {Object.entries(cursors).map(([socketId, cursor]) => {
                  if (socketId === currentSocketId) return null;
                  return (
                    <div
                      key={socketId}
                      className="absolute pointer-events-none"
                      style={{
                        left: cursor.x,
                        top: cursor.y,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cursor.color }} />
                      <span className="text-[8px] font-medium ml-1" style={{ color: cursor.color }}>
                        {cursor.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Video Calls / Participants (20%) */}
        <div className="w-[20%] min-w-[180px] max-w-[280px] border-l border-border flex flex-col shrink-0">
          {/* Video Grid */}
          <div className="p-2 space-y-2">
            {/* Local Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/90 border border-border">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
                <span className="text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                  {user?.name || "You"}
                </span>
                {isInterviewer && (
                  <span className="text-[8px] text-primary bg-primary/20 px-1 py-0.5 rounded">Host</span>
                )}
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                {!audioEnabled && <MicOff className="h-3 w-3 text-red-400" />}
                {!videoEnabled && <VideoOff className="h-3 w-3 text-red-400" />}
              </div>
              {(!localStream || permissionDenied) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm mx-auto">
                      {user?.name?.charAt(0) || "?"}
                    </div>
                    <p className="text-[8px] text-white/40 mt-0.5">
                      {permissionDenied ? "Camera blocked" : "Camera off"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {peers.map((peer) => (
              <div key={peer.socketId} className="relative aspect-video rounded-lg overflow-hidden bg-black/90 border border-border">
                <video
                  ref={(el) => {
                    if (el) remoteVideoRefs.current.set(peer.socketId, el);
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1.5 left-2">
                  <span className="text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                    {peer.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Waiting for others */}
            {!isSolo && peers.length === 0 && localStream && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black/50 border border-border flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-6 w-6 text-white/40 mx-auto" />
                  <p className="text-[10px] text-white/40 mt-1">Waiting for others...</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="border-t border-border p-2 flex items-center justify-center gap-2 shrink-0">
            <button
              onClick={toggleAudio}
              className={`p-1.5 rounded-full transition-colors ${
                audioEnabled ? "text-muted-foreground hover:text-foreground" : "text-red-500 bg-red-500/10"
              }`}
              title={audioEnabled ? "Mute" : "Unmute"}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-1.5 rounded-full transition-colors ${
                videoEnabled ? "text-muted-foreground hover:text-foreground" : "text-red-500 bg-red-500/10"
              }`}
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </button>
            <button
              onClick={onLeave}
              className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Leave room"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Participants list */}
          <div className="border-t border-border p-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium">In Room</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{participantCount}</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {roomUsers.map((u) => {
                const isPeerConnected = peers.some(p => p.socketId === u.socketId);
                return (
                  <div key={u.socketId || u.userId} className="flex items-center gap-1.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${isPeerConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-[10px] text-muted-foreground truncate flex-1">
                      {u.name}
                      {u.userId === room.ownerId && " (Host)"}
                      {u.userId === user?.id && " (You)"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Question Picker Modal */}
      <QuestionPicker
        isOpen={showQuestionPicker}
        onClose={() => setShowQuestionPicker(false)}
        onSelect={handleSelectQuestion}
        currentQuestionId={question?.id}
        roomId={room.id}
      />
    </div>
  );
}