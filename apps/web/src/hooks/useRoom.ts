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

  const eventHandlers = useRef<Map<string, (...args: any[]) => void>>(new Map());
  const isMounted = useRef(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const socketRef = useRef<Socket | null>(null);

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

    socketRef.current = socketInstance;
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
        socketInstance.connect();
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`🟢 Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setError(null);
      
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

    // 🔧 FIX: Code change from server - the server sends just the code string
    socketInstance.on("code-change", (newCode: string) => {
      setCode(newCode);
    });

    // 🔧 FIX: Canvas change from server - the server sends just the elements array
    socketInstance.on("canvas-change", (elements: any[]) => {
      setCanvasElements(elements);
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
        socketInstance.emit("leave-room", { roomId });
        
        eventHandlers.current.forEach((handler, event) => {
          socketInstance.off(event, handler);
        });
        eventHandlers.current.clear();
        
        socketInstance.disconnect();
      }
    };
  }, [roomId, userId, name, email, serverUrl]);

  // Emit code changes
  const handleCodeChange = useCallback((newCode: string) => {
    if (!socketRef.current || !isConnected) {
      setCode(newCode);
      return;
    }
    
    setCode(newCode);
    socketRef.current.emit("code-change", {
      roomId,
      code: newCode,
    });
  }, [roomId, isConnected]);

  // Emit canvas changes
  const handleCanvasChange = useCallback((elements: any[]) => {
    if (!socketRef.current || !isConnected) return;
    
    setCanvasElements(elements);
    socketRef.current.emit("canvas-change", {
      roomId,
      elements,
    });
  }, [roomId, isConnected]);

  // Emit cursor movement
  const handleCursorMove = useCallback((x: number, y: number) => {
    if (!socketRef.current || !isConnected) return;
    
    socketRef.current.emit("cursor-move", {
      roomId,
      x,
      y,
    });
  }, [roomId, isConnected]);

  // Subscribe to events
  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!socketRef.current) {
      console.warn(`Cannot subscribe to ${event}: socket not connected`);
      return () => {};
    }
    
    const wrappedHandler = (data: any) => {
      if (isMounted.current) {
        handler(data);
      }
    };
    
    socketRef.current.on(event, wrappedHandler);
    eventHandlers.current.set(event, wrappedHandler);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, wrappedHandler);
      }
      eventHandlers.current.delete(event);
    };
  }, []);

  // Emit events
  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn(`Cannot emit ${event}: socket not connected`);
      return;
    }
    socketRef.current.emit(event, data);
  }, [isConnected]);

  // Cleanup all connections
  const cleanup = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-room", { roomId });
    }
    
    if (socketRef.current) {
      eventHandlers.current.forEach((handler, event) => {
        socketRef.current?.off(event, handler);
      });
      eventHandlers.current.clear();
    }
    
    setUsers([]);
    setCursors({});
    setError(null);
  }, [roomId, isConnected]);

  return {
    socket: socketRef.current,
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