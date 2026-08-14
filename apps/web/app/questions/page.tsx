// apps/web/app/questions/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  LogOut,
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string|null;
}

interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  tags: string[];
  _count: {
    testCases: number;
  };
}

export default function QuestionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (error || !data?.user) {
          router.push("/signin");
          return;
        }
        setUser(data.user);
        await fetchQuestions();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedPattern !== "All") params.append("pattern", selectedPattern);
      if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);

      const response = await fetch(`/api/questions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedPattern, selectedDifficulty]);

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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MEDIUM": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "HARD": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "text-green-500";
      case "MEDIUM": return "text-yellow-500";
      case "HARD": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const patterns = ["All", "Algorithms", "System Design"];
  const difficulties = ["All", "EASY", "MEDIUM", "HARD"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading problems...</p>
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
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-primary" />
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
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Problems</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse our curated collection of coding problems
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:border-foreground focus:outline-none"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 p-1 border border-border rounded-lg">
              {patterns.map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => setSelectedPattern(pattern)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedPattern === pattern
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pattern}
                </button>
              ))}
            </div>

            <div className="flex gap-1 p-1 border border-border rounded-lg">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedDifficulty === diff
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Problem</div>
            <div className="col-span-2 hidden sm:block">Type</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 hidden sm:block">Tests</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No problems found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.slug}`}
                  className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* # - Sequential number */}
                  <div className="col-span-1 text-sm text-muted-foreground font-mono text-center">
                    {index + 1}
                  </div>
                  
                  {/* Problem Title + Tags */}
                  <div className="col-span-5 min-w-0">
                    <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {question.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {question.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{question.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Type */}
                  <div className="col-span-2 hidden sm:flex items-center text-sm text-muted-foreground truncate">
                    {question.pattern}
                  </div>
                  
                  {/* Difficulty */}
                  <div className="col-span-2 flex items-center">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </div>
                  
                  {/* Test Cases */}
                  <div className="col-span-2 hidden sm:flex items-center text-sm text-muted-foreground">
                    {question._count.testCases}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing {questions.length} problems
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Easy ({questions.filter(q => q.difficulty === "EASY").length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
              Medium ({questions.filter(q => q.difficulty === "MEDIUM").length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Hard ({questions.filter(q => q.difficulty === "HARD").length})
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}