// apps/web/components/EndInterviewModal.tsx
"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";

interface EndInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { saveNotes: boolean; sendFeedback: boolean }) => void;
  duration: number;
  questionCount: number;
  isInterviewer: boolean;
}

export function EndInterviewModal({
  isOpen,
  onClose,
  onConfirm,
  duration,
  questionCount,
  isInterviewer,
}: EndInterviewModalProps) {
  const [saveNotes, setSaveNotes] = useState(true);
  const [sendFeedback, setSendFeedback] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm({ saveNotes, sendFeedback });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {isInterviewer ? "End Interview" : "Leave Interview"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-xs text-muted-foreground">{formatDuration(duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Questions Attempted</p>
              <p className="text-xs text-muted-foreground">{questionCount} questions</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {isInterviewer && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Save interview notes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendFeedback}
                  onChange={(e) => setSendFeedback(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Send feedback to candidate</span>
              </label>
            </>
          )}
          {!isInterviewer && (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to leave the interview?
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border px-4 py-2 text-sm font-medium rounded hover:border-foreground transition-colors"
          >
            {isInterviewer ? "Cancel" : "Stay"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${
              isInterviewer
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-foreground text-background hover:bg-primary"
            } disabled:opacity-50`}
          >
            {isLoading ? "Processing..." : isInterviewer ? "End Interview" : "Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}