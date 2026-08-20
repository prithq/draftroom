// apps/web/components/SessionSummary.tsx
"use client";

import { useState } from "react";
import { 
  X, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Code2, 
  Users,
  Download,
  Copy,
  Check
} from "lucide-react";

interface SessionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    duration: number;
    questionCount: number;
    codeChanges: number;
    participants: { name: string; role: string }[];
    notes?: string;
    feedback?: string;
  };
}

export function SessionSummary({ isOpen, onClose, data }: SessionSummaryProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleCopy = () => {
    const summary = `
Session Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: ${formatDuration(data.duration)}
Questions Attempted: ${data.questionCount}
Code Changes: ${data.codeChanges}

Participants:
${data.participants.map(p => `  • ${p.name} (${p.role})`).join('\n')}

${data.notes ? `\nNotes:\n${data.notes}` : ''}
${data.feedback ? `\nFeedback:\n${data.feedback}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Session Summary</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <p className="text-lg font-bold mt-1">{formatDuration(data.duration)}</p>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <FileText className="h-4 w-4" />
                Questions
              </div>
              <p className="text-lg font-bold mt-1">{data.questionCount}</p>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Code2 className="h-4 w-4" />
                Code Changes
              </div>
              <p className="text-lg font-bold mt-1">{data.codeChanges}</p>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </h3>
            <div className="space-y-1">
              {data.participants.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{p.name}</span>
                  <span className="text-xs text-muted-foreground">({p.role})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Notes</h3>
              <div className="p-3 bg-muted/10 rounded-lg border border-border text-sm whitespace-pre-wrap">
                {data.notes}
              </div>
            </div>
          )}

          {/* Feedback */}
          {data.feedback && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Feedback</h3>
              <div className="p-3 bg-muted/10 rounded-lg border border-border text-sm whitespace-pre-wrap">
                {data.feedback}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-border px-4 py-2 text-sm font-medium rounded hover:border-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Summary
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-sm font-medium text-background rounded hover:bg-primary transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}