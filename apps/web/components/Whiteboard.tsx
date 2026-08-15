// apps/web/components/Whiteboard.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  BrushCleaning,
  RotateCcw,
  Trash2,
  Circle,
  Square,
  Type,
  Move,
} from "lucide-react";

interface Stroke {
  id: string;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  tool: "pen" | "BrushCleaning";
}

interface WhiteboardProps {
  elements?: any[];
  onChange?: (elements: any[]) => void;
  readOnly?: boolean;
}

const COLORS = ["#1f2937", "#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6"];

export function Whiteboard({ elements = [], onChange, readOnly = false }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "BrushCleaning">("pen");

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw all completed strokes
    for (const s of strokes) {
      if (s.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = s.tool === "BrushCleaning" ? "#f7f6f3" : s.color;
      ctx.lineWidth = s.tool === "BrushCleaning" ? 20 : s.size;
      s.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Draw current stroke
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = currentStroke.tool === "BrushCleaning" ? "#f7f6f3" : currentStroke.color;
      ctx.lineWidth = currentStroke.tool === "BrushCleaning" ? 20 : currentStroke.size;
      currentStroke.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  // Handle resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  // Get position relative to canvas
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Start drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const pos = getPos(e);
    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      color: tool === "BrushCleaning" ? "#f7f6f3" : color,
      size: tool === "BrushCleaning" ? 20 : size,
      points: [pos],
      tool,
    };

    setCurrentStroke(newStroke);
  };

  // Draw
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || readOnly) return;

    const pos = getPos(e);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos],
    };
    setCurrentStroke(updatedStroke);
    redraw();
  };

  // End drawing
  const handlePointerUp = () => {
    if (!isDrawing || !currentStroke || readOnly) {
      setIsDrawing(false);
      return;
    }

    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);

    // Notify parent of change
    if (onChange) {
      onChange([...strokes, currentStroke]);
    }
  };

  // Undo
  const undo = () => {
    if (readOnly) return;
    setStrokes((prev) => {
      const newStrokes = prev.slice(0, -1);
      if (onChange) onChange(newStrokes);
      return newStrokes;
    });
  };

  // Clear
  const clear = () => {
    if (readOnly) return;
    setStrokes([]);
    if (onChange) onChange([]);
  };

  return (
    <div ref={wrapRef} className="relative w-full h-full bg-[#f7f6f3] dark:bg-[#1a1a1a]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Toolbar */}
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 shadow-lg">
          {/* Pen */}
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded transition-colors ${
              tool === "pen" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Pen"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* BrushCleaning */}
          <button
            onClick={() => setTool("BrushCleaning")}
            className={`p-1.5 rounded transition-colors ${
              tool === "BrushCleaning" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="BrushCleaning"
          >
            <BrushCleaning className="h-4 w-4" />
          </button>

          <span className="w-px h-6 bg-border" />

          {/* Colors */}
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              className={`h-5 w-5 rounded-full border-2 transition-all ${
                color === c && tool === "pen"
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ background: c }}
              title={`Color ${c}`}
            />
          ))}

          <span className="w-px h-6 bg-border" />

          {/* Size */}
          <input
            type="range"
            min={1}
            max={10}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-16 accent-foreground cursor-pointer"
            title="Brush size"
          />

          <span className="w-px h-6 bg-border" />

          {/* Undo */}
          <button
            onClick={undo}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Clear */}
          <button
            onClick={clear}
            className="p-1.5 rounded text-muted-foreground hover:text-red-500 transition-colors"
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Element count */}
      <div className="absolute top-2 right-2 text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
        {strokes.length} strokes
      </div>
    </div>
  );
}