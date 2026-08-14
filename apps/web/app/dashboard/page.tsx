// apps/web/app/dashboard/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Copy,
  Trash2,
  X,
  LogOut,
  ArrowRight,
  Clock,
  Users,
  Search,
  User,
  Code2,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
}

interface Participant {
  id: string;
  userId: string;
  role: "INTERVIEWER" | "CANDIDATE";
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
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
  questionId?: string | null;
  question?: {
    id: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  } | null;
  participant: Participant[];
  _count?: {
    participant: number;
  };
}

interface JoinedRoom {
  id: string;
  name: string;
  slug: string;
  roomType: "INTERVIEW" | "SOLO";
  language: string;
  isActive: boolean;
  createdAt: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  participant: Participant[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<JoinedRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // UI State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinLink, setJoinLink] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "INTERVIEW" | "SOLO">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Create room form
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"INTERVIEW" | "SOLO">("INTERVIEW");
  const [newRoomLanguage, setNewRoomLanguage] = useState("javascript");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch user and rooms
  useEffect(() => {
    const init = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.error || !session?.data?.user) {
          router.push("/signin");
          return;
        }
        setUser(session.data.user);
        await Promise.all([fetchRooms(), fetchJoinedRooms()]);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/signin");
      } finally {
        setIsLoading(false);
        setIsLoadingRooms(false);
      }
    };
    init();
  }, [router]);

  // Fetch rooms the user owns
  const fetchRooms = async () => {
    try {
      setFetchError(null);
      const response = await fetch("/api/rooms");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch rooms: ${response.status}`);
      }
      
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to fetch rooms");
    }
  };

  // Fetch rooms the user joined as candidate
  const fetchJoinedRooms = async () => {
    try {
      // Try to fetch joined rooms - if the endpoint doesn't exist, just set empty array
      const response = await fetch("/api/rooms/joined");
      
      if (response.status === 404) {
        // Endpoint doesn't exist yet - that's fine
        setJoinedRooms([]);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch joined rooms: ${response.status}`);
      }
      
      const data = await response.json();
      setJoinedRooms(data);
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
      // Don't show error for joined rooms - it's optional
      setJoinedRooms([]);
    }
  };

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

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setCreateError("Room name is required");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          language: newRoomLanguage,
          roomType: newRoomType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create room");
      }

      const newRoom = await response.json();
      setRooms([newRoom, ...rooms]);
      setIsCreateModalOpen(false);
      setNewRoomName("");
      
      // Navigate to the new room
      router.push(`/room/${newRoom.slug}`);
    } catch (error) {
      console.error("Create room error:", error);
      setCreateError(error instanceof Error ? error.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinLink.trim()) {
      setJoinError("Please enter a room link or ID");
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      // Extract room ID from link or use directly
      const roomId = joinLink.split("/").pop() || joinLink;
      
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join room");
      }

      const data = await response.json();
      setIsJoinModalOpen(false);
      setJoinLink("");
      
      // Navigate to the room
      router.push(`/room/${data.room.slug}`);
    } catch (error) {
      console.error("Join room error:", error);
      setJoinError(error instanceof Error ? error.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = async (slug: string, id: string) => {
    const link = `${window.location.origin}/room/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete room");
      }

      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (error) {
      console.error("Delete room error:", error);
      alert(error instanceof Error ? error.message : "Failed to delete room");
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "text-green-500";
      case "MEDIUM": return "text-yellow-500";
      case "HARD": return "text-red-500";
      default: return "text-muted-foreground";
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

  const filteredRooms = rooms
    .filter((room) => filterType === "all" || room.roomType === filterType)
    .filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.question?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border px-4 sm:px-6 py-3 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
            <span className="text-[16px] sm:text-[18px] font-bold tracking-tight">draftroom</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {user?.image && (
              <img src={user.image} alt={user.name || "User"} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            )}
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name || "Developer"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Room
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-foreground transition-colors"
            >
              <Users className="h-4 w-4" />
              Join Room
            </button>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group border border-border rounded-lg p-4 sm:p-5 hover:border-foreground transition-all text-left hover:shadow-sm"
          >
            <div className="font-semibold text-[10px] sm:text-xs tracking-wider text-muted-foreground uppercase mb-1.5">
              New Interview
            </div>
            <div className="font-medium text-base sm:text-lg mb-1">Create a room</div>
            <div className="text-sm text-muted-foreground mb-3">
              Pick a language and question, then share the link with your candidate.
            </div>
            <div className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Go →
            </div>
          </button>

          <Link
            href="/rooms/create?mode=solo"
            className="group border border-border rounded-lg p-4 sm:p-5 hover:border-foreground transition-all text-left hover:shadow-sm block"
          >
            <div className="font-semibold text-[10px] sm:text-xs tracking-wider text-muted-foreground uppercase mb-1.5">
              Solo Practice
            </div>
            <div className="font-medium text-base sm:text-lg mb-1">Practice alone</div>
            <div className="text-sm text-muted-foreground mb-3">
              Open a private room with the editor, whiteboard and problem bank.
            </div>
            <div className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Go →
            </div>
          </Link>

          <Link
            href="/questions"
            className="group border border-border rounded-lg p-4 sm:p-5 hover:border-foreground transition-all text-left hover:shadow-sm block"
          >
            <div className="font-semibold text-[10px] sm:text-xs tracking-wider text-muted-foreground uppercase mb-1.5">
              Library
            </div>
            <div className="font-medium text-base sm:text-lg mb-1">Browse problems</div>
            <div className="text-sm text-muted-foreground mb-3">
              Pick from original questions tagged by difficulty and pattern.
            </div>
            <div className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Go →
            </div>
          </Link>
        </div>

        {/* My Rooms Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">Your Rooms</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 p-1 border border-border rounded-lg">
                {["all", "INTERVIEW", "SOLO"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as typeof filterType)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      filterType === type
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-40 pl-8 pr-3 py-1 text-sm border border-border rounded-lg bg-transparent focus:border-foreground focus:outline-none"
                />
              </div>
              {fetchError && (
                <button
                  onClick={fetchRooms}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          </div>

          {fetchError ? (
            <div className="text-center py-12 border border-red-500/20 bg-red-500/5 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-500">{fetchError}</p>
              <button
                onClick={fetchRooms}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-500/30 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : isLoadingRooms ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-base font-semibold text-foreground mb-1">No rooms yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first room to get started
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Room
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 border border-border rounded-lg hover:border-foreground transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm truncate">{room.name}</span>
                      {room.isActive && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          Live
                        </span>
                      )}
                      {room.roomType === "SOLO" && (
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                          Solo
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                        /{room.slug}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      {room.question && (
                        <>
                          <span className={getDifficultyColor(room.question.difficulty)}>
                            {room.question.difficulty}
                          </span>
                          <span className="truncate max-w-[100px] sm:max-w-[150px]">
                            {room.question.title}
                          </span>
                          <span className="hidden sm:inline">·</span>
                        </>
                      )}
                      <span>{getLanguageLabel(room.language)}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room._count?.participant || 0}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(room.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Link
                      href={`/room/${room.slug}`}
                      className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                    >
                      Open
                    </Link>
                    {room.roomType === "INTERVIEW" && (
                      <button
                        onClick={() => handleCopyLink(room.slug, room.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy invite link"
                      >
                        {copiedId === room.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete room"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Joined Rooms Section */}
        {joinedRooms.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Rooms I Joined</h2>
            <div className="space-y-2">
              {joinedRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 border border-border rounded-lg hover:border-foreground transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm truncate">{room.name}</span>
                      {room.isActive && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          Live
                        </span>
                      )}
                      <span className="text-[10px] text-yellow-500 font-medium bg-yellow-500/10 px-1.5 py-0.5 rounded">
                        Candidate
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                        /{room.slug}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      <span>{getLanguageLabel(room.language)}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {room.owner.name}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(room.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Link
                      href={`/room/${room.slug}`}
                      className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Create a Room</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 border border-red-500/20 bg-red-500/10 rounded-lg text-sm text-red-500 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Frontend Engineer — Round 2"
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      value="INTERVIEW"
                      checked={newRoomType === "INTERVIEW"}
                      onChange={() => setNewRoomType("INTERVIEW")}
                      className="text-primary"
                    />
                    Interview
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      value="SOLO"
                      checked={newRoomType === "SOLO"}
                      onChange={() => setNewRoomType("SOLO")}
                      className="text-primary"
                    />
                    Solo Practice
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select
                  value={newRoomLanguage}
                  onChange={(e) => setNewRoomLanguage(e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div className="text-xs text-muted-foreground">
                {newRoomType === "INTERVIEW" 
                  ? "You can pick a question from the library after creating the room."
                  : "Practice alone with editor, whiteboard, and problem bank."}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError(null);
                }}
                className="flex-1 border border-border px-4 py-2 text-sm font-medium hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim() || isCreating}
                className="flex-1 bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Join a Room</h2>
              <button
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setJoinError(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {joinError && (
              <div className="mb-4 p-3 border border-red-500/20 bg-red-500/10 rounded-lg text-sm text-red-500 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {joinError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Paste room link or room ID</label>
              <input
                type="text"
                value={joinLink}
                onChange={(e) => setJoinLink(e.target.value)}
                placeholder="https://draftroom.com/room/abc123"
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Paste the full link or just the room ID
              </p>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <button
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setJoinError(null);
                }}
                className="flex-1 border border-border px-4 py-2 text-sm font-medium hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!joinLink.trim() || isJoining}
                className="flex-1 bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}