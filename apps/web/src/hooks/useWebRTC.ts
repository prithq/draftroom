// apps/web/hooks/useWebRTC.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Peer {
  socketId: string;
  stream: MediaStream;
  name: string;
  color: string;
}

interface UseWebRTCOptions {
  roomId: string;
  enabled: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
  currentUser: {
    socketId: string;
    name: string;
  };
  roomUsers: {
    socketId: string;
    userId: string;
    name: string;
    color: string;
  }[];
}

export function useWebRTC({
  roomId,
  enabled,
  emit,
  on,
  currentUser,
  roomUsers,
}: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const isMounted = useRef(true);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ]
  };

  // Cleanup function
  const cleanupPeerConnections = useCallback(() => {
    peerConnections.current.forEach((pc) => {
      try {
        pc.close();
      } catch (e) {
        console.error("Error closing peer connection:", e);
      }
    });
    peerConnections.current.clear();
    setPeers([]);
  }, []);

  // Step 1: Get media
  useEffect(() => {
    if (!enabled) return;

    let stream: MediaStream | null = null;

    async function getMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (isMounted.current) {
          setLocalStream(stream);
        }
      } catch (err) {
        console.error("Failed to get media:", err);
      }
    }

    getMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cleanupPeerConnections();
    };
  }, [enabled, cleanupPeerConnections]);

  // Step 2: Call existing users
  useEffect(() => {
    if (!localStream || !enabled || !isMounted.current) return;

    const existingUsers = roomUsers.filter(
      (user) => user.socketId !== currentUser.socketId
    );

    existingUsers.forEach((user) => {
      // Only call if we don't already have a connection
      if (!peerConnections.current.has(user.socketId)) {
        initiateCall(user.socketId, localStream);
      }
    });
  }, [localStream, enabled, roomUsers, currentUser.socketId]);

  // Step 3: Listen for incoming calls
  useEffect(() => {
    if (!enabled || !isMounted.current) return;

    // Someone is calling us
    const offOffer = on("webrtc-offer", async ({ offer, fromSocketId }) => {
      if (!localStream) return;

      // Check if we already have a connection to this peer
      if (peerConnections.current.has(fromSocketId)) {
        console.log(`Already have connection to ${fromSocketId}, ignoring offer`);
        return;
      }

      const pc = createPeerConnection(fromSocketId);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        emit("webrtc-answer", {
          roomId,
          answer,
          targetSocketId: fromSocketId,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    // We got an answer
    const offAnswer = on("webrtc-answer", async ({ answer, fromSocketId }) => {
      const pc = peerConnections.current.get(fromSocketId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error setting answer:", err);
      }
    });

    // Exchange ICE candidates
    const offIce = on("webrtc-ice", async ({ candidate, fromSocketId }) => {
      const pc = peerConnections.current.get(fromSocketId);
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    });

    return () => {
      offOffer();
      offAnswer();
      offIce();
    };
  }, [enabled, localStream, on, emit, roomId]);

  // Create peer connection
  function createPeerConnection(targetSocketId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit("webrtc-ice", {
          roomId,
          candidate: event.candidate,
          targetSocketId,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const user = roomUsers.find((u) => u.socketId === targetSocketId);
      setPeers((prev) => {
        const exists = prev.find((p) => p.socketId === targetSocketId);
        if (exists) return prev;
        return [
          ...prev,
          {
            socketId: targetSocketId,
            stream: event.streams[0],
            name: user?.name ?? "Unknown",
            color: user?.color ?? "#46CEE6",
          },
        ];
      });
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log(`WebRTC ${targetSocketId}: ${pc.connectionState}`);

      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeers((prev) => prev.filter((p) => p.socketId !== targetSocketId));
        peerConnections.current.delete(targetSocketId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE ${targetSocketId}: ${pc.iceConnectionState}`);
    };

    peerConnections.current.set(targetSocketId, pc);
    return pc;
  }

  // Initiate a call
  async function initiateCall(targetSocketId: string, stream: MediaStream) {
    const pc = createPeerConnection(targetSocketId);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      emit("webrtc-offer", {
        roomId,
        offer,
        targetSocketId,
      });
    } catch (err) {
      console.error("Error creating offer:", err);
      peerConnections.current.delete(targetSocketId);
      pc.close();
    }
  }

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled((prev) => !prev);
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled((prev) => !prev);
    }
  }, [localStream]);

  // Cleanup
  const cleanup = useCallback(() => {
    cleanupPeerConnections();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream, cleanupPeerConnections]);

  return {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
}