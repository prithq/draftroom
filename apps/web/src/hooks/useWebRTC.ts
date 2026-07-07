"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Peer {
  socketId: string
  stream: MediaStream
  name: string
  color: string
}

interface UseWebRTCOptions {
  roomId: string
  enabled: boolean  // only start when user opens video panel
  emit: (event: string, data: any) => void
  on: (event: string, handler: (data: any) => void) => () => void
  currentUser: {
    socketId: string
    name: string
  }
  roomUsers: {
    socketId: string
    userId: string
    name: string
    color: string
  }[]
}

export function useWebRTC({
  roomId,
  enabled,
  emit,
  on,
  currentUser,
  roomUsers,
}: UseWebRTCOptions) {
  // our own camera/mic stream
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  // other people's streams
  const [peers, setPeers] = useState<Peer[]>([])

  // mute/camera state
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)

  // store peer connections — useRef so they survive re-renders
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  // ICE servers — STUN helps peers discover their public IP
  // free Google STUN servers — fine for development
  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ]
  }

  // step 1 — get camera and mic when video is enabled
  useEffect(() => {
    if (!enabled) return

    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
      } catch (err) {
        console.error("Failed to get media:", err)
      }
    }

    getMedia()

    // stop tracks when video panel is closed
    return () => {
      localStream?.getTracks().forEach(track => track.stop())
    }
  }, [enabled])

  // step 2 — once we have our stream, call everyone else in the room
  useEffect(() => {
    if (!localStream || !enabled) return

    // call each user who is already in the room
    roomUsers.forEach(user => {
      if (user.socketId === currentUser.socketId) return // don't call yourself
      initiateCall(user.socketId, localStream)
    })
  }, [localStream])

  // step 3 — listen for incoming calls
  useEffect(() => {
    if (!enabled) return

    // someone is calling us — we received their offer
    const offOffer = on("webrtc-offer", async ({ offer, fromSocketId }) => {
      if (!localStream) return

      const pc = createPeerConnection(fromSocketId)

      // set their offer as remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      // create our answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      // send answer back
      emit("webrtc-answer", {
        roomId,
        answer,
        targetSocketId: fromSocketId
      })
    })

    // we got an answer to our offer
    const offAnswer = on("webrtc-answer", async ({ answer, fromSocketId }) => {
      const pc = peerConnections.current.get(fromSocketId)
      if (!pc) return
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    })

    // exchange ICE candidates
    const offIce = on("webrtc-ice", async ({ candidate, fromSocketId }) => {
      const pc = peerConnections.current.get(fromSocketId)
      if (!pc) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error("ICE candidate error:", err)
      }
    })

    return () => {
      offOffer()
      offAnswer()
      offIce()
    }
  }, [enabled, localStream, on, emit])

  // create a peer connection for a specific user
  function createPeerConnection(targetSocketId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    // add our tracks to the connection
    localStream?.getTracks().forEach(track => {
      pc.addTrack(track, localStream!)
    })

    // when we get ICE candidates, send them to the other peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit("webrtc-ice", {
          roomId,
          candidate: event.candidate,
          targetSocketId
        })
      }
    }

    // when we receive their stream, add them to peers list
    pc.ontrack = (event) => {
      const user = roomUsers.find(u => u.socketId === targetSocketId)
      setPeers(prev => {
        const exists = prev.find(p => p.socketId === targetSocketId)
        if (exists) return prev
        return [...prev, {
          socketId: targetSocketId,
          stream: event.streams[0]!,
          name: user?.name ?? "Unknown",
          color: user?.color ?? "#46CEE6"
        }]
      })
    }

    // connection state logging
    pc.onconnectionstatechange = () => {
      console.log(`WebRTC ${targetSocketId}: ${pc.connectionState}`)

      // clean up if connection drops
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeers(prev => prev.filter(p => p.socketId !== targetSocketId))
        peerConnections.current.delete(targetSocketId)
      }
    }

    peerConnections.current.set(targetSocketId, pc)
    return pc
  }

  // initiate a call to a specific user
  async function initiateCall(targetSocketId: string, stream: MediaStream) {
    const pc = createPeerConnection(targetSocketId)

    // create offer
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    // send offer to target via server
    emit("webrtc-offer", {
      roomId,
      offer,
      targetSocketId
    })
  }

  // toggle mic
  const toggleAudio = useCallback(() => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setAudioEnabled(prev => !prev)
  }, [localStream])

  // toggle camera
  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setVideoEnabled(prev => !prev)
  }, [localStream])

  // cleanup — close all connections when leaving room
  const cleanup = useCallback(() => {
    peerConnections.current.forEach(pc => pc.close())
    peerConnections.current.clear()
    localStream?.getTracks().forEach(track => track.stop())
    setLocalStream(null)
    setPeers([])
  }, [localStream])

  return {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    cleanup
  }
}