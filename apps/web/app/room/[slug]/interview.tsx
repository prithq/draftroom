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
  isConnected: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  participantCount: number;
  copyInviteLink: () => void;
  copied: boolean;
}

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
  isConnected,
  toggleAudio,
  toggleVideo,
  participantCount,
  copyInviteLink,
  copied,
}: InterviewProps) {
  const [showQuestion, setShowQuestion] = useState(true);
  const [showWhiteboard, setShowWhiteboard] = useState(true);
  const [showVideoBar, setShowVideoBar] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

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
    try {
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
      
      // Update the question in the parent component
      if (onQuestionUpdate && data.question) {
        onQuestionUpdate(data.question);
      }
      
      // Update the code editor with new starter code
      if (data.question?.starterCode) {
        const starter = data.question.starterCode[selectedLanguage] || "";
        onCodeChange(starter);
      }
    } catch (error) {
      console.error("Error selecting question:", error);
      throw error;
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
            onClick={() => setShowVideoBar(!showVideoBar)}
            className={`p-1 rounded transition-colors ${
              showVideoBar ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <VideoIcon className="h-4 w-4" />
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

      {/* Video Bar */}
      {showVideoBar && (localStream || peers.length > 0) && (
        <div className="bg-black/90 border-b border-border p-1.5 flex items-center gap-2 overflow-x-auto shrink-0">
          {localStream && (
            <div className="relative w-24 h-14 rounded overflow-hidden bg-black/50 shrink-0">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-0.5 left-1 text-[8px] text-white/80 bg-black/50 px-1 rounded">
                {user?.name || "You"}
              </div>
              <div className="absolute bottom-0.5 right-1 flex gap-0.5">
                {!audioEnabled && <MicOff className="h-2.5 w-2.5 text-red-400" />}
                {!videoEnabled && <VideoOff className="h-2.5 w-2.5 text-red-400" />}
              </div>
            </div>
          )}
          {peers.map((peer) => (
            <div key={peer.socketId} className="relative w-24 h-14 rounded overflow-hidden bg-black/50 shrink-0">
              <video
                ref={(el) => {
                  if (el) remoteVideoRefs.current.set(peer.socketId, el);
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0.5 left-1 text-[8px] text-white/80 bg-black/50 px-1 rounded">
                {peer.name}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              onClick={toggleAudio}
              className={`p-1 rounded transition-colors ${
                audioEnabled ? "text-white hover:bg-white/10" : "text-red-400 hover:bg-red-500/20"
              }`}
            >
              {audioEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-1 rounded transition-colors ${
                videoEnabled ? "text-white hover:bg-white/10" : "text-red-400 hover:bg-red-500/20"
              }`}
            >
              {videoEnabled ? <VideoIcon className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setShowVideoBar(false)}
              className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question */}
        {showQuestion && (
          <div className="w-80 border-r border-border bg-card/30 overflow-y-auto shrink-0">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problem</h3>
                <button
                  onClick={() => setShowQuestion(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {question ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${getDifficultyBadge(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{question.pattern}</span>
                    </div>
                    <h4 className="text-sm font-bold">{question.title}</h4>
                  </div>

                  <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {question.description}
                  </div>

                  {question.testCases && question.testCases.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Examples
                      </h5>
                      {question.testCases.filter(tc => !tc.isHidden).slice(0, 2).map((tc, idx) => (
                        <div key={tc.id} className="text-[10px] font-mono bg-muted/20 p-2 rounded border border-border mb-1.5">
                          <div className="text-muted-foreground">Input: {JSON.stringify(tc.input)}</div>
                          <div className="text-primary">Output: {JSON.stringify(tc.expected)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isInterviewer && (
                    <div className="border border-yellow-500/20 bg-yellow-500/5 rounded p-2">
                      <h5 className="text-[10px] font-semibold text-yellow-500 uppercase tracking-wider">Notes</h5>
                      <p className="text-[10px] text-muted-foreground">Only you can see these</p>
                    </div>
                  )}

                  {isInterviewer && (
                    <button
                      onClick={() => setShowQuestionPicker(true)}
                      className="w-full text-[10px] text-primary hover:underline py-1 border-t border-border mt-2"
                    >
                      Change Question →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No question selected</p>
                  {isInterviewer && (
                    <button
                      onClick={() => setShowQuestionPicker(true)}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Pick a question →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Editor</span>
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
            </div>
            <div className="flex items-center gap-1.5">
              {!showQuestion && question && (
                <button
                  onClick={() => setShowQuestion(true)}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border border-border hover:border-foreground"
                >
                  Show Question
                </button>
              )}
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
          </div>

          {/* Code Editor */}
          <div className="flex-1 bg-muted/20 font-mono text-xs p-3 overflow-auto relative">
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-xs leading-5 text-foreground/90 pl-5"
              spellCheck={false}
              style={{ tabSize: 2 }}
              placeholder="Write your solution here..."
            />
            <div className="absolute left-0 top-0 bottom-0 w-5 text-right text-muted-foreground/20 font-mono text-[10px] pt-3 select-none">
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-5">{i + 1}</div>
              ))}
            </div>
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

        {/* Right Panel - Whiteboard */}
        <div className="hidden lg:flex w-64 border-l border-border flex-col shrink-0">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Whiteboard</span>
              <span className="text-[10px] text-muted-foreground">({canvasElements?.length || 0})</span>
            </div>
            <button
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showWhiteboard ? "rotate-0" : "-rotate-90"}`} />
            </button>
          </div>
          {showWhiteboard && (
            <div className="flex-1 bg-muted/10 relative">
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
          <div className="border-t border-border p-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium">Chat</span>
              <span className="text-[10px] text-muted-foreground ml-auto">0 messages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="fixed inset-y-0 right-0 w-64 bg-background border-l border-border shadow-lg z-20 p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">In Room</h3>
            <button onClick={() => setShowParticipants(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                {user?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.name || "You"}</p>
                <p className="text-[10px] text-muted-foreground">{isInterviewer ? "Host" : "Participant"}</p>
              </div>
              {user?.id === room.ownerId && <span className="text-[10px] text-primary">Host</span>}
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>

            {roomUsers.filter(u => u.userId !== user?.id).map((u) => {
              const isPeerConnected = peers.some(p => p.socketId === u.socketId);
              return (
                <div key={u.socketId || u.userId} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30">
                  <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-medium">
                    {u.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground">Participant</p>
                  </div>
                  {!isPeerConnected && <span className="text-[9px] text-yellow-500">Connecting...</span>}
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${isPeerConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

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