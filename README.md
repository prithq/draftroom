# Draftroom

A realtime coding interview platform — shared whiteboard, code editor, and video in one room.

## What it does

- **Realtime code editor** — Monaco editor (same as VS Code) synced between interviewer and candidate
- **Collaborative whiteboard** — Excalidraw canvas for system design and diagrams
- **Built-in video/voice** — WebRTC peer-to-peer, no Zoom needed
- **Question bank** — curated coding problems with hidden test cases
- **Code execution** — run code against test cases via Judge0
- **Interview rooms** — create a room, share the link, start interviewing

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Nova preset)
- Monaco Editor
- Excalidraw
- Socket.io client

### Backend
- Next.js API routes (REST)
- Express + Socket.io (realtime)
- WebRTC (video/voice signaling)
- Judge0 (code execution)

### Data
- PostgreSQL
- Prisma 6.5
- BetterAuth (Google + GitHub OAuth)

### Infrastructure
- Turborepo monorepo
- Vercel (frontend)
- Railway (Socket.io server + DB)

## Project Structure