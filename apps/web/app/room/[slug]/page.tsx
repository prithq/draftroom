// apps/web/app/room/[slug]/page.tsx
"use client";

import { use } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  LogOut,
  Users,
  Code2,
  PenTool,
  Video,
  MessageSquare,
  Play,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  X,
  Copy,
  Check,
  Terminal,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  Layout,
  Monitor,
  Phone,
  PhoneOff,
  Share2,
  Settings,
  Sparkles,
  Clock,
  User,
  CheckCircle,
} from "lucide-react";

// Import hooks
import { useRoom } from "@/src/hooks/useRoom";
import { useWebRTC } from "@/src/hooks/useWebRTC";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
}

interface Participant {
  id: string;
  userId: string;
  role: "INTERVIEWER" | "CANDIDATE" | "OBSERVER";
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
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

interface Room {
  id: string;
  name: string;
  slug: string;
  roomType: "INTERVIEW" | "SOLO";
  language: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string | null;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  questionId?: string | null;
  question?: Question | null;
  participant: Participant[];
  _count?: {
    participant: number;
  };
}

type ViewMode = "lobby" | "interview";

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <RoomClient slug={slug} />;
}

function RoomClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [viewMode, setViewMode] = useState<ViewMode>("lobby");
  const [showInterview, setShowInterview] = useState(false);
  
  // UI State
  const [showParticipants, setShowParticipants] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentSocketId, setCurrentSocketId] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<"grid" | "sidebar">("grid");
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  
  // Editor State
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Use the room hook
  const {
    socket,
    users: roomUsers,
    code: syncedCode,
    canvasElements,
    cursors,
    isConnected,
    error: socketError,
    currentSocketId: socketId,
    handleCodeChange,
    handleCanvasChange,
    handleCursorMove,
    on,
    emit,
    cleanup,
  } = useRoom({
    roomId: room?.id || "",
    userId: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    serverUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  });

  // Use WebRTC hook
  const {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    cleanup: cleanupWebRTC,
  } = useWebRTC({
    roomId: room?.id || "",
    enabled: showVideo,
    emit,
    on,
    currentUser: {
      socketId: socketId || "",
      name: user?.name || "",
    },
    roomUsers: roomUsers.map(u => ({
      socketId: u.socketId,
      userId: u.userId,
      name: u.name,
      color: u.color,
    })),
  });

  // Set current socket ID
  useEffect(() => {
    if (socketId) {
      setCurrentSocketId(socketId);
    }
  }, [socketId]);

  // Update code when synced code changes
  useEffect(() => {
    if (syncedCode) {
      setCode(syncedCode);
    }
  }, [syncedCode]);

  // Set language from room
  useEffect(() => {
    if (room?.language) {
      setSelectedLanguage(room.language);
    }
  }, [room]);

  // Handle local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle remote video streams
  useEffect(() => {
    peers.forEach((peer) => {
      const videoEl = remoteVideoRefs.current.get(peer.socketId);
      if (videoEl && peer.stream) {
        videoEl.srcObject = peer.stream;
      }
    });
  }, [peers]);

  // Auto-enter interview mode after a delay or when ready
  useEffect(() => {
    if (viewMode === "lobby" && room && user) {
      // Check if we should auto-enter interview mode
      const shouldEnterInterview = room.participant?.length >= 1 || room.roomType === "SOLO";
      if (shouldEnterInterview && showInterview) {
        setViewMode("interview");
      }
    }
  }, [room, user, viewMode, showInterview]);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.error || !session?.data?.user) {
          router.push("/signin");
          return;
        }
        setUser(session.data.user);

        const response = await fetch(`/api/rooms/${slug}`);
        
        if (response.status === 404) {
          setError("Room not found");
          setIsLoading(false);
          return;
        }
        
        if (response.status === 403) {
          setError("You don't have access to this room");
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch room: ${response.status}`);
        }

        const roomData = await response.json();
        setRoom(roomData);
        
        if (roomData.question?.starterCode) {
          const starter = roomData.question.starterCode[roomData.language] || "";
          setCode(starter);
        }

        // Auto-show interview for solo mode
        if (roomData.roomType === "SOLO") {
          setViewMode("interview");
          setShowVideo(false);
        }

      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();

    return () => {
      cleanup();
      cleanupWebRTC();
    };
  }, [router, slug]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRunCode = async () => {
    if (!room?.question) return;
    
    setIsRunning(true);
    setOutput("Running tests...\n");
    
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          questionId: room.questionId,
          roomId: room.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to run code");
      }

      const result = await response.json();
      
      let outputText = "";
      if (result.stdout) {
        outputText += result.stdout;
      }
      if (result.stderr) {
        outputText += `\n\n❌ Error:\n${result.stderr}`;
      }
      if (result.compile_output) {
        outputText += `\n\n⚠️ Compile Output:\n${result.compile_output}`;
      }
      
      setOutput(outputText || "No output");
      
    } catch (error) {
      console.error("Run error:", error);
      setOutput(`Error: ${error instanceof Error ? error.message : "Failed to run code"}`);
    } finally {
      setIsRunning(false);
    }
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

  const copyInviteLink = () => {
    const link = `${window.location.origin}/room/${slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleStartInterview = () => {
    setViewMode("interview");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="text-red-500 text-5xl mb-2">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">Unable to load room</h2>
        <p className="text-muted-foreground text-sm max-w-md text-center">
          {error || "Room not found"}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-foreground transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isInterviewer = user?.id === room.ownerId;
  const participantCount = room.participant?.length || 0;
  const isSolo = room.roomType === "SOLO";

  // ============================================
  // LOBBY VIEW - Google Meet Style
  // ============================================
  if (viewMode === "lobby") {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="border-b border-border px-4 py-3 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
              <span className="text-[16px] font-bold tracking-tight">draftroom</span>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">/</span>
            <span className="text-sm font-medium hidden sm:inline truncate max-w-[150px]">{room.name}</span>
            {room.isActive && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyInviteLink}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Invite"}</span>
            </button>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{participantCount}</span>
            </button>
            {user?.image && (
              <img src={user.image} alt={user.name || "User"} className="h-7 w-7 rounded-full" />
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </nav>

        {/* Lobby Content - Google Meet Style */}
        <div className="h-[calc(100vh-53px)] flex flex-col">
          {/* Video Grid - Full Screen */}
          <div className="flex-1 bg-black/90 relative p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {/* Local Video */}
              <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white/80 bg-black/50 px-2.5 py-1 rounded-full">
                  <span>{user?.name || "You"}</span>
                  {!audioEnabled && <MicOff className="h-3 w-3 text-red-400" />}
                  {!videoEnabled && <VideoOff className="h-3 w-3 text-red-400" />}
                </div>
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl mx-auto">
                        {user?.name?.charAt(0) || "?"}
                      </div>
                      <p className="text-sm text-white/60 mt-2">{user?.name || "You"}</p>
                      <p className="text-xs text-white/40">Camera off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remote Videos */}
              {peers.map((peer) => (
                <div key={peer.socketId} className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <video
                    ref={(el) => {
                      if (el) remoteVideoRefs.current.set(peer.socketId, el);
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/50 px-2.5 py-1 rounded-full">
                    {peer.name}
                  </div>
                </div>
              ))}

              {/* Waiting for others */}
              {!isSolo && peers.length === 0 && localStream && (
                <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl mx-auto">
                      👥
                    </div>
                    <p className="text-white/60 text-sm mt-3">Waiting for others to join...</p>
                    <p className="text-white/40 text-xs">Share the invite link</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls - Floating */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 rounded-full px-3 py-2 backdrop-blur-sm border border-white/10">
              <button
                onClick={toggleAudio}
                className={`p-2.5 rounded-full transition-colors ${
                  audioEnabled ? "text-white hover:bg-white/10" : "text-red-400 hover:bg-red-500/20"
                }`}
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2.5 rounded-full transition-colors ${
                  videoEnabled ? "text-white hover:bg-white/10" : "text-red-400 hover:bg-red-500/20"
                }`}
              >
                {videoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
              <div className="w-px h-6 bg-white/20" />
              <button
                onClick={() => {}}
                className="p-2.5 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                <Monitor className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLayoutMode(layoutMode === "grid" ? "sidebar" : "grid")}
                className="p-2.5 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                {layoutMode === "grid" ? <Layout className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              <div className="w-px h-6 bg-white/20" />
              <button
                onClick={handleStartInterview}
                className="p-2.5 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors flex items-center gap-2 px-4"
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">Go to Question</span>
              </button>
            </div>
          </div>

          {/* Room Info Bar */}
          <div className="border-t border-border bg-card/50 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{participantCount} participant{participantCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {room.name}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-green-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                Connected
              </span>
              <button
                onClick={toggleFullscreen}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-lg z-20 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Participants ({participantCount})</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {room.participant?.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {p.user.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.user.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                  </div>
                  {p.userId === user?.id && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                  {p.userId === room.ownerId && (
                    <span className="text-xs text-primary">Host</span>
                  )}
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // INTERVIEW VIEW - Full Coding Environment
  // ============================================
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="border-b border-border px-4 py-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
            <span className="text-[16px] font-bold tracking-tight">draftroom</span>
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">/</span>
          <span className="text-sm font-medium hidden sm:inline truncate max-w-[150px]">{room.name}</span>
          <button
            onClick={() => setViewMode("lobby")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to Call
          </button>
          {room.isActive && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-red-500 font-medium shrink-0">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          )}
          {!isConnected && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-yellow-500 font-medium shrink-0">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              Reconnecting...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={copyInviteLink}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Invite"}</span>
          </button>
          <button
            onClick={() => setShowVideo(!showVideo)}
            className={`inline-flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded border ${
              showVideo 
                ? "text-primary border-primary hover:border-primary/80" 
                : "text-muted-foreground border-border hover:border-foreground"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{showVideo ? "Video On" : "Video Off"}</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <div className="w-px h-6 bg-border" />
          {user?.image && (
            <img src={user.image} alt={user.name || "User"} className="h-7 w-7 rounded-full" />
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Interview Content */}
      <div className="h-[calc(100vh-53px)] flex flex-col">
        {/* Video Bar - Small floating bar when in interview mode */}
        {showVideo && (
          <div className="bg-black/90 border-b border-border p-2 flex items-center gap-3 overflow-x-auto">
            {/* Local Video - Small */}
            <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-black/50 shrink-0">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1.5 text-[8px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                {user?.name || "You"}
              </div>
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm mx-auto">
                      {user?.name?.charAt(0) || "?"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Videos - Small */}
            {peers.map((peer) => (
              <div key={peer.socketId} className="relative w-32 h-20 rounded-lg overflow-hidden bg-black/50 shrink-0">
                <video
                  ref={(el) => {
                    if (el) remoteVideoRefs.current.set(peer.socketId, el);
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1.5 text-[8px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                  {peer.name}
                </div>
              </div>
            ))}

            {/* Video Controls - Small */}
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <button
                onClick={toggleAudio}
                className={`p-1.5 rounded-full transition-colors ${
                  audioEnabled ? "text-white hover:bg-white/10" : "text-red-400 hover:bg-red-500/20"
                }`}
              >
                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-1.5 rounded-full transition-colors ${
                  videoEnabled ? "text-white hover:bg-white/10" : "text-red-400 hover:bg-red-500/20"
                }`}
              >
                {videoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setShowVideo(false)}
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Interview Layout */}
        <div className="flex-1 border-t border-border bg-card">
          <div className="flex h-full">
            {/* Left Panel - Question */}
            {showQuestion && room.question && (
              <div className="w-full md:w-96 border-r border-border p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Question
                  </h3>
                  <button
                    onClick={() => setShowQuestion(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getDifficultyBadge(room.question.difficulty)}`}>
                      {room.question.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{room.question.pattern}</span>
                  </div>
                  <h4 className="text-lg font-semibold">{room.question.title}</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {room.question.description}
                  </div>
                  {/* Test Cases Preview */}
                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Examples
                    </h5>
                    {room.question.testCases?.slice(0, 2).map((tc, idx) => (
                      <div key={tc.id} className="text-xs font-mono bg-muted/20 p-2 rounded border border-border mb-1.5">
                        <div className="text-muted-foreground">Example {idx + 1}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                          <span>Input: {JSON.stringify(tc.input)}</span>
                          <span>→ Expected: {JSON.stringify(tc.expected)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isInterviewer && (
                    <button className="text-xs text-primary hover:underline mt-2">
                      Change Question →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Middle Panel - Code Editor */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Editor</span>
                  <span className="text-xs text-muted-foreground">
                    {getLanguageLabel(selectedLanguage)}
                  </span>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-500">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                      Live
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!showQuestion && room.question && (
                    <button
                      onClick={() => setShowQuestion(true)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground"
                    >
                      Show Question
                    </button>
                  )}
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 text-xs bg-foreground text-background px-3 py-1 rounded hover:bg-primary transition-colors disabled:opacity-50"
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
              <div className="flex-1 bg-muted/20 font-mono text-sm p-4 overflow-auto relative">
                <textarea
                  value={code}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setCode(newCode);
                    handleCodeChange(newCode);
                  }}
                  className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-sm leading-6 text-foreground/90 pl-6"
                  spellCheck={false}
                  style={{ tabSize: 2 }}
                  placeholder="Write your solution here..."
                />
                <div className="absolute left-0 top-0 bottom-0 w-6 text-right text-muted-foreground/20 font-mono text-xs pt-4 select-none">
                  {code.split('\n').map((_, i) => (
                    <div key={i} className="h-6">{i + 1}</div>
                  ))}
                </div>
              </div>
              {output && (
                <div className="border-t border-border bg-muted/10 shrink-0 max-h-48">
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Output</span>
                    </div>
                    <button
                      onClick={() => setOutput("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3 font-mono text-xs overflow-auto whitespace-pre-wrap max-h-40">
                    {output}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Whiteboard/Chat */}
            <div className="hidden lg:flex w-80 border-l border-border flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Whiteboard</span>
                </div>
                <button
                  onClick={() => setShowWhiteboard(!showWhiteboard)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showWhiteboard ? "rotate-0" : "-rotate-90"}`} />
                </button>
              </div>
              {showWhiteboard && (
                <div className="flex-1 bg-muted/10 flex items-center justify-center relative">
                  <div className="text-center text-muted-foreground">
                    <PenTool className="h-8 w-8 mx-auto opacity-20" />
                    <p className="text-sm mt-2">Excalidraw</p>
                    <p className="text-xs">Draw system designs or algorithms</p>
                    {canvasElements.length > 0 && (
                      <p className="text-xs mt-1 text-primary">({canvasElements.length} elements)</p>
                    )}
                  </div>
                  {Object.entries(cursors).map(([socketId, cursor]) => (
                    socketId !== currentSocketId && (
                      <div
                        key={socketId}
                        className="absolute pointer-events-none"
                        style={{
                          left: cursor.x,
                          top: cursor.y,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cursor.color }}
                        />
                        <span
                          className="text-[10px] font-medium ml-2"
                          style={{ color: cursor.color }}
                        >
                          {cursor.name}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
              {/* Chat */}
              <div className="border-t border-border flex-1 flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Chat</span>
                  </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                  <div className="text-center text-sm text-muted-foreground">
                    <p>No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation</p>
                  </div>
                </div>
                <div className="p-2 border-t border-border">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full text-sm bg-transparent border border-border rounded px-3 py-1.5 focus:border-foreground focus:outline-none"
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}