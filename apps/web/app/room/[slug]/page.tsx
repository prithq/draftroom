// apps/web/app/room/[slug]/page.tsx
"use client";

import { use } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { LobbyView } from "./lobby";
import { InterviewView } from "./interview";

// Import hooks
import { useRoom } from "@/src/hooks/useRoom";
import { useWebRTC } from "@/src/hooks/useWebRTC";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
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
  question?: any;
  participant: any[];
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
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<ViewMode>("lobby");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  
  // Editor State
  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  // Room data for hooks
  const [roomId, setRoomId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

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
    roomId,
    userId,
    name: userName,
    email: userEmail,
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
    roomId,
    enabled: showVideo,
    emit,
    on,
    currentUser: {
      socketId: socketId || "",
      name: userName,
    },
    roomUsers: roomUsers.map(u => ({
      socketId: u.socketId,
      userId: u.userId,
      name: u.name,
      color: u.color,
    })),
  });

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

  // Fetch room data and auto-join
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        // Check auth first
        const session = await authClient.getSession();
        if (session?.error || !session?.data?.user) {
          console.log("No session, redirecting to signin");
          router.push("/signin");
          return;
        }
        
        const userData = session.data.user;
        setUser(userData);
        setUserId(userData.id);
        setUserName(userData.name || "");
        setUserEmail(userData.email || "");

        console.log(`🔍 Fetching room with slug: ${slug}`);
        
        // Fetch room by slug
        const response = await fetch(`/api/rooms/${slug}`);
        
        console.log(`📡 Response status: ${response.status}`);
        
        if (response.status === 404) {
          console.log("❌ Room not found");
          setError("Room not found. The room may have been deleted or the link is incorrect.");
          setIsLoading(false);
          return;
        }
        
        if (response.status === 403) {
          console.log("❌ Access denied");
          setError("You don't have access to this room.");
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ API error:", errorData);
          throw new Error(errorData.error || `Failed to fetch room: ${response.status}`);
        }

        const roomData = await response.json();
        console.log("✅ Room fetched:", roomData.name);
        console.log("📊 Room owner:", roomData.ownerId);
        console.log("👤 Current user:", userData.id);
        
        setRoom(roomData);
        setRoomId(roomData.id);

        // Set initial code from question starter
        if (roomData.question?.starterCode) {
          const starter = roomData.question.starterCode[roomData.language] || "";
          setCode(starter);
        }

        // Check if user is owner or participant
        const isOwner = roomData.ownerId === userData.id;
        const isParticipant = roomData.participant?.some(p => p.userId === userData.id);

        console.log("📊 Is owner:", isOwner);
        console.log("📊 Is participant:", isParticipant);

        // If the user is the owner, they don't need to join
        if (isOwner) {
          console.log("👑 User is the owner, no need to join");
          setIsJoining(false);
          // For solo mode, auto-start interview
          if (roomData.roomType === "SOLO") {
            setViewMode("interview");
            setShowVideo(false);
          }
          setIsLoading(false);
          return;
        }

        // If not owner and not participant, auto-join
        if (!isParticipant) {
          console.log("🔄 User is not a participant, auto-joining as CANDIDATE...");
          setIsJoining(true);
          
          try {
            const joinResponse = await fetch(`/api/rooms/${roomData.id}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

            if (joinResponse.ok) {
              const joinData = await joinResponse.json();
              console.log("✅ Auto-joined successfully as:", joinData.role);
              
              // Refresh room data to get updated participant list
              const updatedResponse = await fetch(`/api/rooms/${slug}`);
              if (updatedResponse.ok) {
                const updatedRoom = await updatedResponse.json();
                setRoom(updatedRoom);
              }
            } else {
              const errorData = await joinResponse.json();
              console.warn("⚠️ Auto-join failed:", errorData.error);
              // Show error but don't block
              setError("Could not join room. You may already be a participant.");
            }
          } catch (joinError) {
            console.warn("⚠️ Auto-join error:", joinError);
          } finally {
            setIsJoining(false);
          }
        } else {
          console.log("✅ User is already a participant");
        }

        // Auto-show interview for solo mode
        if (roomData.roomType === "SOLO") {
          setViewMode("interview");
          setShowVideo(false);
        }

      } catch (error) {
        console.error("🔴 Error fetching room:", error);
        setError(error instanceof Error ? error.message : "Failed to load room");
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

  const handleStartInterview = useCallback(() => {
    setViewMode("interview");
  }, []);

  const handleLeave = useCallback(() => {
    if (confirm("Are you sure you want to leave this room?")) {
      // Cleanup before leaving
      cleanup();
      cleanupWebRTC();
      router.push("/dashboard");
    }
  }, [router, cleanup, cleanupWebRTC]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-white/60 text-sm">Loading room...</p>
          {isJoining && (
            <p className="text-white/40 text-xs">Joining room...</p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-black">
        <div className="text-5xl mb-2">⚠️</div>
        <h2 className="text-2xl font-bold text-white">Unable to load room</h2>
        <p className="text-white/60 text-sm max-w-md text-center">
          {error || "Room not found"}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Lobby View
  if (viewMode === "lobby") {
    return (
      <LobbyView
        room={room}
        user={user}
        isInterviewer={user?.id === room.ownerId}
        localStream={localStream}
        peers={peers}
        roomUsers={roomUsers}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isConnected={isConnected}
        isFullscreen={isFullscreen}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        toggleFullscreen={toggleFullscreen}
        onStartInterview={handleStartInterview}
        onLeave={handleLeave}
        copyInviteLink={copyInviteLink}
        copied={copied}
        participantCount={room.participant?.length || 0}
      />
    );
  }

  // Interview View
  const languages = room?.question?.starterCode ? Object.keys(room.question.starterCode) : ["javascript"];
  
  return (
    <InterviewView
      room={room}
      user={user}
      isInterviewer={user?.id === room.ownerId}
      question={room.question}
      code={code}
      selectedLanguage={selectedLanguage}
      languages={languages}
      output={output}
      isRunning={isRunning}
      canvasElements={canvasElements}
      cursors={cursors}
      currentSocketId={socketId || ""}
      onCodeChange={(newCode) => {
        setCode(newCode);
        handleCodeChange(newCode);
      }}
      onLanguageChange={(lang) => {
        setSelectedLanguage(lang);
        if (room.question?.starterCode) {
          setCode(room.question.starterCode[lang] || "");
        }
      }}
      onRunCode={handleRunCode}
      onCanvasChange={handleCanvasChange}
      onBackToLobby={() => setViewMode("lobby")}
      onLeave={handleLeave}
      localStream={localStream}
      peers={peers}
      roomUsers={roomUsers}
      audioEnabled={audioEnabled}
      videoEnabled={videoEnabled}
      isConnected={isConnected}
      toggleAudio={toggleAudio}
      toggleVideo={toggleVideo}
      participantCount={room.participant?.length || 0}
      copyInviteLink={copyInviteLink}
      copied={copied}
    />
  );
}