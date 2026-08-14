// apps/web/app/room/[slug]/lobby.tsx
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
  Zap,
  Grid,
  Layout,
  Monitor,
  Phone,
  PhoneOff,
  X,
  ChevronDown,
  Settings,
  Share2,
  User,
  Circle,
  MoreVertical,
} from "lucide-react";

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

interface LobbyProps {
  room: {
    id: string;
    name: string;
    slug: string;
    roomType: "INTERVIEW" | "SOLO";
    isActive: boolean;
    ownerId: string;
  };
  user: User;
  isInterviewer: boolean;
  localStream: MediaStream | null;
  peers: Peer[];
  roomUsers: RoomUser[];
  audioEnabled: boolean;
  videoEnabled: boolean;
  isConnected: boolean;
  isFullscreen: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleFullscreen: () => void;
  onStartInterview: () => void;
  onLeave: () => void;
  copyInviteLink: () => void;
  copied: boolean;
  participantCount: number;
}

export function LobbyView({
  room,
  user,
  isInterviewer,
  localStream,
  peers,
  roomUsers,
  audioEnabled,
  videoEnabled,
  isConnected,
  isFullscreen,
  toggleAudio,
  toggleVideo,
  toggleFullscreen,
  onStartInterview,
  onLeave,
  copyInviteLink,
  copied,
  participantCount,
}: LobbyProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "sidebar">("grid");
  const [showControls, setShowControls] = useState(true);
  const [showName, setShowName] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimeout();

    // Listen for mouse movement to show controls
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Calculate grid layout based on number of participants
  const totalVideos = 1 + peers.length; // Local + remote
  const getGridClass = () => {
    if (totalVideos <= 2) return "grid-cols-1 md:grid-cols-2";
    if (totalVideos <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
    if (totalVideos <= 6) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  const isSolo = room.roomType === "SOLO";

  return (
    <div className="min-h-screen bg-black/95 flex flex-col">
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
                <span className="text-[16px] font-bold tracking-tight">draftroom</span>
              </Link>
              <span className="text-sm text-white/50 hidden sm:inline">/</span>
              <span className="text-sm text-white/80 hidden sm:inline truncate max-w-[150px]">{room.name}</span>
              {room.isActive && (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-green-400 font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
              {!isConnected && (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-yellow-400 font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  Connecting...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyInviteLink}
                className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{copied ? "Copied!" : "Invite"}</span>
              </button>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{participantCount}</span>
              </button>
              <button
                onClick={onLeave}
                className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full h-full max-w-7xl mx-auto ${getGridClass()} grid gap-2 md:gap-4 auto-rows-[minmax(200px,1fr)]`}>
          {/* Local Video */}
          <div 
            className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 group"
            onMouseEnter={() => setShowName(true)}
            onMouseLeave={() => setShowName(false)}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Fallback avatar when video is off */}
            {(!videoEnabled || !localStream) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl text-white/60 mx-auto">
                    {user?.name?.charAt(0) || "?"}
                  </div>
                  <p className="text-white/40 text-xs mt-2">Camera off</p>
                </div>
              </div>
            )}

            {/* Name badge */}
            <div className={`absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white/90 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full transition-opacity duration-300 ${showName || !videoEnabled ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <span>{user?.name || "You"}</span>
              <span className="text-[10px] text-white/50">(You)</span>
              {!audioEnabled && <MicOff className="h-3 w-3 text-red-400" />}
              {!videoEnabled && <VideoOff className="h-3 w-3 text-red-400" />}
            </div>

            {/* Video indicator */}
            {!videoEnabled && (
              <div className="absolute top-3 right-3 text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded-full">
                Camera off
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {peers.map((peer) => (
            <div
              key={peer.socketId}
              className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 group"
              onMouseEnter={() => setShowName(true)}
              onMouseLeave={() => setShowName(false)}
            >
              <video
                ref={(el) => {
                  if (el) remoteVideoRefs.current.set(peer.socketId, el);
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Fallback avatar */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center text-3xl text-white/60 mx-auto">
                    {peer.name?.charAt(0) || "?"}
                  </div>
                  <p className="text-white/40 text-xs mt-2">Connecting...</p>
                </div>
              </div>

              {/* Name badge */}
              <div className={`absolute bottom-3 left-3 text-xs text-white/90 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full transition-opacity duration-300 ${showName ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                {peer.name}
              </div>
            </div>
          ))}

          {/* Waiting for others */}
          {!isSolo && peers.length === 0 && localStream && (
            <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl text-white/60 mx-auto">
                  👥
                </div>
                <p className="text-white/60 text-sm mt-3">Waiting for others to join...</p>
                <p className="text-white/40 text-xs">Share the invite link</p>
              </div>
            </div>
          )}

          {/* Solo mode empty state */}
          {isSolo && (
            <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl text-white/60 mx-auto">
                  👤
                </div>
                <p className="text-white/60 text-sm mt-3">Solo Practice</p>
                <p className="text-white/40 text-xs">You're practicing alone</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="px-4 py-6 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex flex-col items-center gap-4">
            {/* Main Controls */}
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
              {/* Audio */}
              <button
                onClick={toggleAudio}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  audioEnabled 
                    ? "text-white hover:bg-white/10" 
                    : "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                }`}
                title={audioEnabled ? "Mute" : "Unmute"}
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              {/* Video */}
              <button
                onClick={toggleVideo}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  videoEnabled 
                    ? "text-white hover:bg-white/10" 
                    : "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                }`}
                title={videoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {videoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>

              <div className="w-px h-6 bg-white/20" />

              {/* Screen Share */}
              <button
                className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Share screen"
              >
                <Monitor className="h-5 w-5" />
              </button>

              {/* Layout */}
              <button
                onClick={() => setLayoutMode(layoutMode === "grid" ? "sidebar" : "grid")}
                className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Toggle layout"
              >
                {layoutMode === "grid" ? <Layout className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>

              <div className="w-px h-6 bg-white/20" />

              {/* Participants */}
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  showParticipants 
                    ? "text-primary bg-primary/20" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                title="Participants"
              >
                <Users className="h-5 w-5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>

              {/* More options */}
              <button
                className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              <div className="w-px h-6 bg-white/20" />

              {/* Leave */}
              <button
                onClick={onLeave}
                className="p-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                title="Leave room"
              >
                <PhoneOff className="h-5 w-5" />
              </button>
            </div>

            {/* Go to Interview Button */}
            {!isSolo && (
              <button
                onClick={onStartInterview}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg shadow-primary/20"
              >
                <Zap className="h-4 w-4" />
                Go to Question
                <ChevronDown className="h-4 w-4" />
              </button>
            )}

            {/* Solo mode start button */}
            {isSolo && (
              <button
                onClick={onStartInterview}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg shadow-primary/20"
              >
                <Zap className="h-4 w-4" />
                Start Practice
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="fixed inset-y-0 right-0 w-80 bg-black/95 border-l border-white/10 shadow-2xl z-30 p-4 overflow-y-auto backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Participants ({participantCount})
            </h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Local user */}
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-white">
                  {user?.name?.charAt(0) || "?"}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || "You"}</p>
                <p className="text-xs text-white/50">
                  {isInterviewer ? "Host" : "Participant"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!audioEnabled && <MicOff className="h-3.5 w-3.5 text-red-400" />}
                {!videoEnabled && <VideoOff className="h-3.5 w-3.5 text-red-400" />}
              </div>
            </div>

            {/* Remote users */}
            {roomUsers
              .filter(u => u.userId !== user?.id)
              .map((u) => {
                const isPeerConnected = peers.some(p => p.socketId === u.socketId);
                return (
                  <div key={u.socketId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-medium text-white">
                        {u.name?.charAt(0) || "?"}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black ${isPeerConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-white/50">
                        {u.userId === room.ownerId ? "Host" : "Participant"}
                      </p>
                    </div>
                    {!isPeerConnected && (
                      <span className="text-[10px] text-yellow-400">Connecting...</span>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Room info */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-xs text-white/40 space-y-1">
              <p>Room: {room.name}</p>
              <p>ID: {room.slug}</p>
              <p>Status: {room.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}