// apps/web/components/QuestionPicker.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X, Check, Loader2, BookOpen, ChevronDown } from "lucide-react";

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

interface QuestionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (questionId: string) => Promise<void>;
  currentQuestionId?: string | null;
  roomId: string;
}

export function QuestionPicker({
  isOpen,
  onClose,
  onSelect,
  currentQuestionId,
  roomId,
}: QuestionPickerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedPattern, setSelectedPattern] = useState<string>("All");
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(currentQuestionId || null);
  const [error, setError] = useState<string | null>(null);

  const difficulties = ["All", "EASY", "MEDIUM", "HARD"];
  const patterns = ["All", "Algorithms", "System Design"];

  useEffect(() => {
    if (!isOpen) return;

    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);
        if (selectedPattern !== "All") params.append("pattern", selectedPattern);

        console.log("🔍 Fetching questions with params:", params.toString());
        
        const response = await fetch(`/api/questions?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ API Error:", errorData);
          throw new Error(errorData.error || `Failed to fetch questions: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Questions fetched:", data.length);
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [isOpen, searchQuery, selectedDifficulty, selectedPattern]);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MEDIUM": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "HARD": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const handleSelect = async (questionId: string) => {
    setIsSelecting(questionId);
    try {
      await onSelect(questionId);
      setSelectedId(questionId);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error selecting question:", error);
      setError(error instanceof Error ? error.message : "Failed to select question");
    } finally {
      setIsSelecting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Pick a Question</h2>
            {currentQuestionId && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Current: {questions.find(q => q.id === currentQuestionId)?.title || "Unknown"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:border-foreground focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-2 p-2 border border-red-500/20 bg-red-500/10 rounded text-xs text-red-500">
            {error}
          </div>
        )}

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No questions found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question) => {
                const isSelected = selectedId === question.id;
                const isCurrent = currentQuestionId === question.id;
                const isSelectingThis = isSelecting === question.id;

                return (
                  <button
                    key={question.id}
                    onClick={() => handleSelect(question.id)}
                    disabled={isSelectingThis}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isCurrent
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:border-foreground hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {question.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                        {isSelected && !isCurrent && (
                          <span className="text-[10px] font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className={`font-medium px-1.5 py-0.5 rounded-full border ${getDifficultyBadge(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span>{question.pattern}</span>
                        <span>·</span>
                        <span>{question.tags.slice(0, 3).join(", ")}</span>
                        {question.tags.length > 3 && (
                          <span>+{question.tags.length - 3}</span>
                        )}
                        <span>·</span>
                        <span>{question._count.testCases} tests</span>
                      </div>
                    </div>
                    <div className="ml-3 shrink-0">
                      {isSelectingThis ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : isSelected ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {questions.length} questions
          </span>
          {selectedId && selectedId !== currentQuestionId && (
            <button
              onClick={() => {
                if (selectedId) {
                  handleSelect(selectedId);
                }
              }}
              disabled={isSelecting === selectedId}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors disabled:opacity-50"
            >
              {isSelecting === selectedId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirm Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}