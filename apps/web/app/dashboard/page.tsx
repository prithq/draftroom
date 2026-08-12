// app/dashboard/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

interface Room {
  id: string;
  name: string;
  slug: string;
  roomType: "INTERVIEW" | "SOLO";
  language: string;
  isActive: boolean;
  createdAt: string;
  ownerId: string;
  questionId?: string;
  question?: {
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  };
  participants: { id: string; userId: string; role: "INTERVIEWER" | "CANDIDATE" }[];
}

// Mock data
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Frontend Engineer — Round 2",
    slug: "frontend-round-2",
    roomType: "INTERVIEW",
    language: "javascript",
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ownerId: "current-user",
    questionId: "q1",
    question: {
      title: "Two Sum",
      difficulty: "EASY",
    },
    participants: [
      { id: "p1", userId: "current-user", role: "INTERVIEWER" },
      { id: "p2", userId: "user1", role: "CANDIDATE" },
    ],
  },
  {
    id: "2",
    name: "Backend Engineer — Systems",
    slug: "backend-systems",
    roomType: "INTERVIEW",
    language: "python",
    isActive: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    ownerId: "current-user",
    questionId: "q2",
    question: {
      title: "LRU Cache",
      difficulty: "MEDIUM",
    },
    participants: [
      { id: "p3", userId: "current-user", role: "INTERVIEWER" },
    ],
  },
  {
    id: "3",
    name: "Daily Practice",
    slug: "daily-practice",
    roomType: "SOLO",
    language: "go",
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    ownerId: "current-user",
    questionId: "q3",
    question: {
      title: "Valid Parentheses",
      difficulty: "EASY",
    },
    participants: [
      { id: "p4", userId: "current-user", role: "INTERVIEWER" },
    ],
  },
  {
    id: "6",
    name: "System Design — Twitter",
    slug: "system-design-twitter",
    roomType: "INTERVIEW",
    language: "python",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ownerId: "current-user",
    questionId: "q4",
    question: {
      title: "Design Twitter",
      difficulty: "HARD",
    },
    participants: [
      { id: "p9", userId: "current-user", role: "INTERVIEWER" },
      { id: "p10", userId: "user4", role: "CANDIDATE" },
      { id: "p11", userId: "user5", role: "CANDIDATE" },
    ],
  },
];

const mockJoinedRooms: Room[] = [
  {
    id: "4",
    name: "Google Interview Prep",
    slug: "google-prep",
    roomType: "INTERVIEW",
    language: "javascript",
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: "other-user",
    participants: [
      { id: "p5", userId: "other-user", role: "INTERVIEWER" },
      { id: "p6", userId: "current-user", role: "CANDIDATE" },
    ],
  },
  {
    id: "5",
    name: "Meta System Design",
    slug: "meta-system-design",
    roomType: "INTERVIEW",
    language: "python",
    isActive: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: "other-user",
    participants: [
      { id: "p7", userId: "other-user", role: "INTERVIEWER" },
      { id: "p8", userId: "current-user", role: "CANDIDATE" },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>(mockJoinedRooms);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"INTERVIEW" | "SOLO">("INTERVIEW");
  const [newRoomLanguage, setNewRoomLanguage] = useState("javascript");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (error || !data?.user) {
          router.push("/signin");
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

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
    setIsCreating(true);
    try {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: newRoomName,
        slug: newRoomName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        roomType: newRoomType,
        language: newRoomLanguage,
        isActive: true,
        createdAt: new Date().toISOString(),
        ownerId: "current-user",
        participants: [{ id: "p-new", userId: "current-user", role: "INTERVIEWER" }],
      };
      setRooms([newRoom, ...rooms]);
      setIsCreateModalOpen(false);
      setNewRoomName("");
      router.push(`/room/${newRoom.slug}`);
    } catch (error) {
      console.error("Create room error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/room/${slug}`;
    navigator.clipboard.writeText(link);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;
    setRooms(rooms.filter((r) => r.id !== roomId));
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Live now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const filteredRooms = rooms.filter(room =>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name || "Developer"}</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            New Room
          </button>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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

        {/* My Rooms & Joined Rooms - Side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Rooms */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
              <h2 className="text-base font-semibold">Your interviews</h2>
              {rooms.length > 0 && (
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-40 pl-8 pr-3 py-1 text-sm border border-border rounded bg-transparent focus:border-foreground focus:outline-none"
                  />
                </div>
              )}
            </div>
            
            {filteredRooms.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">No interviews yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first room to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3.5 border border-border rounded-lg hover:border-foreground transition-colors group">
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
                        <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">/{room.slug}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                        {room.question && (
                          <>
                            <span className={getDifficultyColor(room.question.difficulty)}>
                              {room.question.difficulty}
                            </span>
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">{room.question.title}</span>
                            <span className="hidden sm:inline">·</span>
                          </>
                        )}
                        <span>{getLanguageLabel(room.language)}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {room.participants.length}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(room.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-3">
                      <Link
                        href={`/room/${room.slug}`}
                        className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                      >
                        Open
                      </Link>
                      {room.roomType === "INTERVIEW" && (
                        <button
                          onClick={() => handleCopyLink(room.slug)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy invite link"
                        >
                          <Copy className="h-4 w-4" />
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

          {/* Joined Rooms */}
          {joinedRooms.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3">Joined as candidate</h2>
              <div className="space-y-2">
                {joinedRooms.map((room) => (
                  <div key={room.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3.5 border border-border rounded-lg hover:border-foreground transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm truncate">{room.name}</span>
                        {room.isActive && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            Live
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">/{room.slug}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                        <span>{getLanguageLabel(room.language)}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(room.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 ml-0 sm:ml-3">
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
        </div>
      </main>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Create a room</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Room name</label>
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
                  ? "Pick a question from the library after creating the room."
                  : "Practice alone with editor, whiteboard, and problem bank."}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <button
                onClick={() => setIsCreateModalOpen(false)}
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
    </div>
  );
}