// apps/web/components/QuickFeedback.tsx
"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Minus, Check } from "lucide-react";

interface QuickFeedbackProps {
  onFeedback: (type: "good" | "bad" | "neutral", note?: string) => void;
  className?: string;
}

export function QuickFeedback({ onFeedback, className = "" }: QuickFeedbackProps) {
  const [selected, setSelected] = useState<"good" | "bad" | "neutral" | null>(null);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleFeedback = (type: "good" | "bad" | "neutral") => {
    setSelected(type);
    if (type === "good" || type === "bad") {
      setShowNoteInput(true);
    } else {
      onFeedback(type);
      setSelected(null);
    }
  };

  const handleSubmitNote = () => {
    if (selected) {
      onFeedback(selected, note.trim() || undefined);
      setSelected(null);
      setShowNoteInput(false);
      setNote("");
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground mr-1">Feedback:</span>
      
      <button
        onClick={() => handleFeedback("good")}
        className={`p-1.5 rounded transition-colors ${
          selected === "good" 
            ? "bg-green-500/20 text-green-500" 
            : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
        }`}
        title="Good"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleFeedback("neutral")}
        className={`p-1.5 rounded transition-colors ${
          selected === "neutral" 
            ? "bg-yellow-500/20 text-yellow-500" 
            : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
        }`}
        title="Neutral"
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleFeedback("bad")}
        className={`p-1.5 rounded transition-colors ${
          selected === "bad" 
            ? "bg-red-500/20 text-red-500" 
            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        }`}
        title="Bad"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>

      {/* Note input */}
      {showNoteInput && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="text-xs bg-transparent border border-border rounded px-2 py-1 focus:border-foreground focus:outline-none w-32"
            autoFocus
          />
          <button
            onClick={handleSubmitNote}
            className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setShowNoteInput(false);
              setSelected(null);
              setNote("");
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}