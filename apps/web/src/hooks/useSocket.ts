// apps/web/hooks/useSocket.ts
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
  off: (event: string, handler?: (data: any) => void) => void;
}

export function useSocket({
  serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  autoConnect = true,
}: UseSocketOptions = {}): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const eventHandlers = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());
  const isMounted = useRef(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    console.log("🔌 Connecting to socket server...");
    
    const socketInstance = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected successfully");
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 Socket connection error:", err.message);
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError("Failed to connect to real-time server after multiple attempts");
        setIsConnected(false);
      } else {
        setError(`Connection attempt ${reconnectAttempts.current}/${maxReconnectAttempts} failed`);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${reason}`);
      setIsConnected(false);
      
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect manually
        socketInstance.connect();
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`🟢 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("reconnect_failed", () => {
      setError("Unable to reconnect to real-time server. Please refresh the page.");
    });

    // Restore event handlers on reconnect
    socketInstance.on("connect", () => {
      // Re-register all event handlers
      eventHandlers.current.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          socketInstance.on(event, handler);
        });
      });
    });

    return socketInstance;
  }, [serverUrl]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    isMounted.current = true;

    if (autoConnect) {
      connect();
    }

    return () => {
      isMounted.current = false;
      disconnect();
      // Clear all event handlers
      eventHandlers.current.clear();
    };
  }, [autoConnect, connect, disconnect]);

  // Emit event
  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn(`⚠️ Cannot emit "${event}": socket not connected`);
      return;
    }
    socketRef.current.emit(event, data);
  }, [isConnected]);

  // Subscribe to event
  const on = useCallback((event: string, handler: (data: any) => void): () => void => {
    if (!socketRef.current) {
      console.warn(`⚠️ Cannot subscribe to "${event}": socket not initialized`);
      return () => {};
    }

    // Store handler for reconnection
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }
    eventHandlers.current.get(event)?.add(handler);

    // Register with socket
    socketRef.current.on(event, handler);

    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
      eventHandlers.current.get(event)?.delete(handler);
      if (eventHandlers.current.get(event)?.size === 0) {
        eventHandlers.current.delete(event);
      }
    };
  }, []);

  // Unsubscribe from event
  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (!socketRef.current) return;

    if (handler) {
      socketRef.current.off(event, handler);
      eventHandlers.current.get(event)?.delete(handler);
    } else {
      // Remove all handlers for this event
      socketRef.current.off(event);
      eventHandlers.current.delete(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}