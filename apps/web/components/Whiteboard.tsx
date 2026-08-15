// apps/web/components/Whiteboard.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  RotateCcw,
  Trash2,
  Square,
  Circle,
  Type,
} from "lucide-react";

// Custom Eraser SVG icon
const EraserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 21h10" />
    <path d="M5 17l10-10 4 4-10 10z" />
    <path d="M5 17l-2-2 10-10 2 2z" />
  </svg>
);

interface Stroke {
  id: string;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  tool: "pen" | "eraser" | "rectangle" | "circle" | "text";
  text?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
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
  const [tool, setTool] = useState<"pen" | "eraser" | "rectangle" | "circle" | "text">("pen");
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

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
      if (s.points.length < 2 && s.tool !== "text") continue;
      
      ctx.beginPath();
      
      switch (s.tool) {
        case "pen":
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
          s.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          break;
          
        case "eraser":
          ctx.strokeStyle = "#f7f6f3";
          ctx.lineWidth = 20;
          s.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          break;
          
        case "rectangle":
          if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            const width = s.endX - s.startX;
            const height = s.endY - s.startY;
            ctx.strokeRect(s.startX, s.startY, width, height);
          }
          break;
          
        case "circle":
          if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            const radius = Math.sqrt(
              Math.pow(s.endX - s.startX, 2) + Math.pow(s.endY - s.startY, 2)
            );
            ctx.beginPath();
            ctx.arc(s.startX, s.startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
          
        case "text":
          if (s.text) {
            ctx.fillStyle = s.color;
            ctx.font = `${s.size * 4}px sans-serif`;
            ctx.fillText(s.text, s.points[0]?.x || 0, s.points[0]?.y || 0);
          }
          break;
      }
    }

    // Draw current stroke
    if (currentStroke) {
      const s = currentStroke;
      ctx.beginPath();
      
      switch (s.tool) {
        case "pen":
          if (s.points.length < 2) break;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
          s.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          break;
          
        case "eraser":
          if (s.points.length < 2) break;
          ctx.strokeStyle = "#f7f6f3";
          ctx.lineWidth = 20;
          s.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          break;
          
        case "rectangle":
          if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            const width = s.endX - s.startX;
            const height = s.endY - s.startY;
            ctx.strokeRect(s.startX, s.startY, width, height);
          }
          break;
          
        case "circle":
          if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            const radius = Math.sqrt(
              Math.pow(s.endX - s.startX, 2) + Math.pow(s.endY - s.startY, 2)
            );
            ctx.beginPath();
            ctx.arc(s.startX, s.startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
          
        case "text":
          if (s.text) {
            ctx.fillStyle = s.color;
            ctx.font = `${s.size * 4}px sans-serif`;
            ctx.fillText(s.text, s.points[0]?.x || 0, s.points[0]?.y || 0);
          }
          break;
      }
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

  // Handle text input
  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        color: color,
        size: size,
        points: [textPosition],
        tool: "text",
        text: textInput.trim(),
      };
      setStrokes((prev) => [...prev, newStroke]);
      if (onChange) {
        onChange([...strokes, newStroke]);
      }
      setTextInput("");
      setShowTextInput(false);
      setTextPosition(null);
      setTool("pen");
    }
  };

  // Start drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const pos = getPos(e);

    if (tool === "text") {
      setTextPosition(pos);
      setShowTextInput(true);
      setIsDrawing(false);
      return;
    }

    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      color: tool === "eraser" ? "#f7f6f3" : color,
      size: tool === "eraser" ? 20 : size,
      points: [pos],
      tool: tool as any,
      startX: pos.x,
      startY: pos.y,
      endX: pos.x,
      endY: pos.y,
    };

    setCurrentStroke(newStroke);
  };

  // Draw
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || readOnly) return;

    const pos = getPos(e);
    
    if (tool === "rectangle" || tool === "circle") {
      const updatedStroke = {
        ...currentStroke,
        endX: pos.x,
        endY: pos.y,
      };
      setCurrentStroke(updatedStroke);
      redraw();
    } else {
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, pos],
      };
      setCurrentStroke(updatedStroke);
      redraw();
    }
  };

  // End drawing
  const handlePointerUp = () => {
    if (!isDrawing || !currentStroke || readOnly) {
      setIsDrawing(false);
      return;
    }

    // Don't save empty strokes
    if (
      (tool === "rectangle" || tool === "circle") &&
      currentStroke.startX === currentStroke.endX &&
      currentStroke.startY === currentStroke.endY
    ) {
      setCurrentStroke(null);
      setIsDrawing(false);
      return;
    }

    setStrokes((prev) => [...prev, currentStroke]);
    if (onChange) {
      onChange([...strokes, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
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

      {/* Text Input Overlay */}
      {showTextInput && (
        <div 
          className="absolute z-10"
          style={{ left: textPosition?.x, top: textPosition?.y }}
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTextSubmit();
              }
              if (e.key === "Escape") {
                setShowTextInput(false);
                setTextInput("");
                setTextPosition(null);
                setTool("pen");
              }
            }}
            onBlur={() => {
              if (textInput.trim()) {
                handleTextSubmit();
              } else {
                setShowTextInput(false);
                setTextInput("");
                setTextPosition(null);
                setTool("pen");
              }
            }}
            className="bg-transparent border border-primary outline-none text-foreground font-sans min-w-[100px] p-1"
            style={{ 
              fontSize: `${size * 4}px`,
              color: color,
            }}
            autoFocus
            placeholder="Type text..."
          />
        </div>
      )}

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

          {/* Eraser */}
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded transition-colors ${
              tool === "eraser" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Eraser"
          >
            <EraserIcon />
          </button>

          {/* Rectangle */}
          <button
            onClick={() => setTool("rectangle")}
            className={`p-1.5 rounded transition-colors ${
              tool === "rectangle" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>

          {/* Circle */}
          <button
            onClick={() => setTool("circle")}
            className={`p-1.5 rounded transition-colors ${
              tool === "circle" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </button>

          {/* Text */}
          <button
            onClick={() => setTool("text")}
            className={`p-1.5 rounded transition-colors ${
              tool === "text" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Text"
          >
            <Type className="h-4 w-4" />
          </button>

          <span className="w-px h-6 bg-border" />

          {/* Colors */}
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (tool === "eraser") setTool("pen");
              }}
              className={`h-5 w-5 rounded-full border-2 transition-all ${
                color === c && tool !== "eraser"
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