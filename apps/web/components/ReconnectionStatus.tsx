// apps/web/components/ReconnectionStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ReconnectionStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  maxAttempts: number;
}

export function ReconnectionStatus({ 
  isConnected, 
  isReconnecting, 
  reconnectAttempts, 
  maxAttempts 
}: ReconnectionStatusProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show status when reconnecting or disconnected
    if (isReconnecting || !isConnected) {
      setVisible(true);
    } else {
      // Hide after 2 seconds of being connected
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isReconnecting]);

  if (!visible) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ${
      isConnected 
        ? "bg-green-500/10 border-green-500/20 text-green-500" 
        : isReconnecting 
          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
          : "bg-red-500/10 border-red-500/20 text-red-500"
    }`}>
      <div className="flex items-center gap-3">
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : isReconnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isConnected 
            ? "Reconnected successfully" 
            : isReconnecting 
              ? `Reconnecting... (${reconnectAttempts}/${maxAttempts})`
              : "Connection lost. Attempting to reconnect..."
          }
        </span>
      </div>
    </div>
  );
}