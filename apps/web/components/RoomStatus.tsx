// apps/web/components/RoomStatus.tsx
"use client";

import { Circle, AlertCircle, Wifi, WifiOff } from "lucide-react";

interface RoomStatusProps {
  isActive: boolean;
  isConnected: boolean;
  participantCount: number;
  className?: string;
}

export function RoomStatus({ isActive, isConnected, participantCount, className = "" }: RoomStatusProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Connection Status */}
      <div className="inline-flex items-center gap-1.5">
        {isConnected ? (
          <Wifi className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-red-500" />
        )}
        <span className={`text-xs ${isConnected ? "text-green-500" : "text-red-500"}`}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Room Status */}
      <div className="inline-flex items-center gap-1.5">
        {isActive ? (
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
        )}
        <span className={`text-xs ${isActive ? "text-green-500" : "text-yellow-500"}`}>
          {isActive ? "Live" : "Inactive"}
        </span>
      </div>

      {/* Participant Count */}
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>•</span>
        <span>{participantCount} participant{participantCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}