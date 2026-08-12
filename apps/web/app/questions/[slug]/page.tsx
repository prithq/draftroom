// apps/web/app/questions/[slug]/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut,
  ArrowLeft,
  ChevronDown,
  Code2,
  Play,
} from "lucide-react";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

interface TestCase {
  id: string;
  input: any;
  expected: any;
  isHidden: boolean;
  weight: number;
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
  testCases: TestCase[];
}

// Mock data - replace with real API call
const mockQuestion: Question = {
  id: "1",
  title: "Budget Pair",
  slug: "budget-pair",
  description: `You are given a list of product prices sorted in ascending order, and a budget. Find two products whose prices sum up to exactly the budget.

Return the indices (1-based) of the two products. If no such pair exists, return an empty array.

**Note:** The array is 1-indexed.`,
  difficulty: "EASY",
  pattern: "two-pointers",
  tags: ["array", "two-pointers"],
  starterCode: {
    javascript: `function budgetPair(prices, budget) {\n  // your code here\n}`,
    python: `def budget_pair(prices, budget):\n    # your code here\n    pass`,
    go: `func budgetPair(prices []int, budget int) []int {\n    // your code here\n    return []int{}\n}`,
  },
  testCases: [
    {
      id: "1",
      input: { prices: [5, 11, 15, 20, 35], budget: 26 },
      expected: [2, 4],
      isHidden: false,
      weight: 1,
    },
    {
      id: "2",
      input: { prices: [3, 7, 9, 14], budget: 20 },
      expected: [],
      isHidden: false,
      weight: 1,
    },
    {
      id: "3",
      input: { prices: [1, 2, 3, 4, 5], budget: 10 },
      expected: [4, 5],
      isHidden: true,
      weight: 2,
    },
  ],
};

export default function QuestionDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isUsingRoom, setIsUsingRoom] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (error || !data?.user) {
          router.push("/signin");
          return;
        }
        setUser(data.user);
        
        // TODO: Fetch real question from /api/questions/:slug
        // For now, use mock data
        setQuestion(mockQuestion);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, params.slug]);

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

  const handleUseInRoom = async () => {
    setIsUsingRoom(true);
    try {
      router.push(`/rooms/create?question=${question?.slug}`);
    } catch (error) {
      console.error("Error using question:", error);
    } finally {
      setIsUsingRoom(false);
    }
  };

  const formatTestCaseInput = (input: any) => {
    return JSON.stringify(input, null, 2);
  };

  const formatExpectedOutput = (output: any) => {
    return JSON.stringify(output);
  };

  if (isLoading || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading problem...</p>
        </div>
      </div>
    );
  }

  const languages = Object.keys(question.starterCode);

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

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-5 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Problems
        </button>

        {/* Header Card */}
        <div className="border border-border rounded-lg p-5 sm:p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getDifficultyBadge(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{question.pattern}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{question.tags.join(", ")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{question.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                  >
                    [{tag}]
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Problem Statement
          </h2>
          <div className="prose prose-sm prose-invert max-w-none">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {question.description}
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Examples
          </h2>
          <div className="space-y-3">
            {question.testCases.filter(tc => !tc.isHidden).slice(0, 2).map((tc, index) => (
              <div key={tc.id} className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
                  Example {index + 1}
                </div>
                <div className="p-4 space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Input:  </span>
                    <span>{formatTestCaseInput(tc.input)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Output: </span>
                    <span className="text-primary">{formatExpectedOutput(tc.expected)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Constraints
          </h2>
          <div className="border border-border rounded-lg p-4">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>2 ≤ prices.length ≤ 10⁴</li>
              <li>1 ≤ prices[i] ≤ 10⁵</li>
              <li>prices is sorted in ascending order</li>
            </ul>
          </div>
        </div>

        {/* Starter Code */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Starter Code
          </h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs bg-transparent border border-border rounded px-2 py-1 focus:border-foreground focus:outline-none appearance-none pr-6"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <pre className="p-4 font-mono text-sm leading-6 overflow-x-auto bg-muted/20">
              <code>{question.starterCode[selectedLanguage] || "// Starter code not available"}</code>
            </pre>
          </div>
        </div>

        {/* Test Cases */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Test Cases <span className="font-normal text-muted-foreground/70">(visible only)</span>
          </h2>
          <div className="space-y-2">
            {question.testCases.filter(tc => !tc.isHidden).map((tc, index) => (
              <div key={tc.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Case {index + 1}:</span>
                </div>
                <div className="space-y-1 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Input:    </span>
                    <span>{formatTestCaseInput(tc.input)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected: </span>
                    <span className="text-primary">{formatExpectedOutput(tc.expected)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <button
            onClick={handleUseInRoom}
            disabled={isUsingRoom}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            {isUsingRoom ? "Loading..." : "Use in Room →"}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-foreground transition-colors"
          >
            ← Back
          </button>
        </div>
      </main>
    </div>
  );
}