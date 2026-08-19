// apps/web/components/ParticipantNotification.tsx
"use client";

import { useEffect, useState } from "react";
import { X, User, UserMinus, UserPlus } from "lucide-react";

interface Notification {
  id: string;
  type: "join" | "leave";
  name: string;
  timestamp: Date;
}

interface ParticipantNotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function ParticipantNotification({ notifications, onDismiss }: ParticipantNotificationProps) {
  const [visible, setVisible] = useState<Notification[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {

      const latest = notifications[notifications.length - 1];

      setVisible((prev) => [...prev, latest]);

      if(!latest)return
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible((prev) => prev.filter((n) => n.id !== latest.id));
        onDismiss(latest.id);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications, onDismiss]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {visible.map((notification) => (
        <div
          key={notification.id}
          className="flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-lg shadow-lg animate-in slide-in-from-right-5"
        >
          {notification.type === "join" ? (
            <UserPlus className="h-4 w-4 text-green-500" />
          ) : (
            <UserMinus className="h-4 w-4 text-red-500" />
          )}
          <div>
            <p className="text-sm font-medium">{notification.name}</p>
            <p className="text-xs text-muted-foreground">
              {notification.type === "join" ? "joined the room" : "left the room"}
            </p>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}