// apps/web/hooks/useRoom.ts
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface RoomUser {
  socketId: string;
  userId: string;
  name: string;
  email: string;
  color: string;
}

interface UseRoomOptions {
  roomId: string;
  userId: string;
  name: string;
  email: string;
  serverUrl?: string;
}

interface UseRoomReturn {
  socket: Socket | null;
  users: RoomUser[];
  code: string;
  canvasElements: any[];
  cursors: Record<string, { x: number; y: number; name: string; color: string }>;
  isConnected: boolean;
  error: string | null;
  currentSocketId: string;
  handleCodeChange: (code: string) => void;
  handleCanvasChange: (elements: any[]) => void;
  handleCursorMove: (x: number, y: number) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
  emit: (event: string, data: any) => void;
  cleanup: () => void;
}

export function useRoom({
  roomId,
  userId,
  name,
  email,
  serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
}: UseRoomOptions): UseRoomReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [code, setCode] = useState<string>("");
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; name: string; color: string }>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSocketId, setCurrentSocketId] = useState<string>("");

  // Refs for cleanup and preventing duplicate events
  const eventHandlers = useRef<Map<string, (...args: any[]) => void>>(new Map());
  const isMounted = useRef(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    isMounted.current = true;

    // Connect to Socket.io server
    const socketInstance = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    setSocket(socketInstance);

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("🟢 Connected to socket server");
      setIsConnected(true);
      setCurrentSocketId(socketInstance.id || "");
      setError(null);
      reconnectAttempts.current = 0;

      // Join the room
      socketInstance.emit("join-room", {
        roomId,
        userId,
        name,
        email,
      });
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 Socket connection error:", err);
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError("Failed to connect to real-time server after multiple attempts");
        setIsConnected(false);
      } else {
        setError(`Connection attempt ${reconnectAttempts.current}/${maxReconnectAttempts} failed`);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`🔴 Disconnected from socket server: ${reason}`);
      setIsConnected(false);
      
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect manually
        socketInstance.connect();
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`🟢 Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setError(null);
      
      // Rejoin the room
      socketInstance.emit("join-room", {
        roomId,
        userId,
        name,
        email,
      });
    });

    socketInstance.on("reconnect_failed", () => {
      setError("Unable to reconnect to real-time server. Please refresh the page.");
    });

    // Listen for room users
    socketInstance.on("room-users", (usersList: RoomUser[]) => {
      setUsers(usersList);
    });

    // Listen for code initialization
    socketInstance.on("code-init", ({ code: initialCode }: { code: string }) => {
      if (initialCode) {
        setCode(initialCode);
      }
    });

    // Listen for canvas initialization
    socketInstance.on("canvas-init", ({ elements }: { elements: any[] }) => {
      if (elements && Array.isArray(elements)) {
        setCanvasElements(elements);
      }
    });

    // Listen for code changes from other users
    socketInstance.on("code-change", ({ code: newCode, fromSocketId }: { code: string; fromSocketId: string }) => {
      // Ignore if we sent the change
      if (fromSocketId !== socketInstance.id) {
        setCode(newCode);
      }
    });

    // Listen for canvas changes from other users
    socketInstance.on("canvas-change", ({ elements, fromSocketId }: { elements: any[]; fromSocketId: string }) => {
      // Ignore if we sent the change
      if (fromSocketId !== socketInstance.id) {
        setCanvasElements(elements);
      }
    });

    // Listen for cursor updates
    socketInstance.on("cursor-update", ({ socketId, userId, name, color, x, y }) => {
      setCursors((prev) => ({
        ...prev,
        [socketId]: { x, y, name, color },
      }));
    });

    // Listen for user leaving
    socketInstance.on("user-left", ({ socketId }: { socketId: string }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    });

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      
      if (socketInstance) {
        // Leave the room before disconnecting
        socketInstance.emit("leave-room", { roomId });
        
        // Remove all event listeners
        eventHandlers.current.forEach((handler, event) => {
          socketInstance.off(event, handler);
        });
        eventHandlers.current.clear();
        
        // Disconnect
        socketInstance.disconnect();
      }
    };
  }, [roomId, userId, name, email, serverUrl]);

  // Emit code changes
  const handleCodeChange = useCallback((newCode: string) => {
    if (!socket || !isConnected) {
      // Store locally if not connected
      setCode(newCode);
      return;
    }
    
    setCode(newCode);
    socket.emit("code-change", {
      roomId,
      code: newCode,
    });
  }, [socket, roomId, isConnected]);

  // Emit canvas changes
  const handleCanvasChange = useCallback((elements: any[]) => {
    if (!socket || !isConnected) return;
    
    setCanvasElements(elements);
    socket.emit("canvas-change", {
      roomId,
      elements,
    });
  }, [socket, roomId, isConnected]);

  // Emit cursor movement
  const handleCursorMove = useCallback((x: number, y: number) => {
    if (!socket || !isConnected) return;
    
    socket.emit("cursor-move", {
      roomId,
      x,
      y,
    });
  }, [socket, roomId, isConnected]);

  // Subscribe to events
  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!socket) {
      console.warn(`Cannot subscribe to ${event}: socket not connected`);
      return () => {};
    }
    
    // Wrap handler to only execute if mounted
    const wrappedHandler = (data: any) => {
      if (isMounted.current) {
        handler(data);
      }
    };
    
    socket.on(event, wrappedHandler);
    eventHandlers.current.set(event, wrappedHandler);
    
    return () => {
      socket.off(event, wrappedHandler);
      eventHandlers.current.delete(event);
    };
  }, [socket]);

  // Emit events
  const emit = useCallback((event: string, data: any) => {
    if (!socket || !isConnected) {
      console.warn(`Cannot emit ${event}: socket not connected`);
      return;
    }
    socket.emit(event, data);
  }, [socket, isConnected]);

  // Cleanup all connections
  const cleanup = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("leave-room", { roomId });
    }
    
    // Clear all registered event handlers
    if (socket) {
      eventHandlers.current.forEach((handler, event) => {
        socket.off(event, handler);
      });
      eventHandlers.current.clear();
    }
    
    // Clear local state
    setUsers([]);
    setCursors({});
    setError(null);
  }, [socket, roomId, isConnected]);

  return {
    socket,
    users,
    code,
    canvasElements,
    cursors,
    isConnected,
    error,
    currentSocketId,
    handleCodeChange,
    handleCanvasChange,
    handleCursorMove,
    on,
    emit,
    cleanup,
  };
}