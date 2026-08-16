// apps/web/components/Whiteboard.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Square,
  Type,
  Move,
  Circle,
  Minus,
} from "lucide-react";

// Eraser SVG icon (your provided SVG)
const EraserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.9995 13L10.9995 6.00004M20.9995 21H7.99955M10.9368 20.0628L19.6054 11.3941C20.7935 10.2061 21.3875 9.61207 21.6101 8.92709C21.8058 8.32456 21.8058 7.67551 21.6101 7.07298C21.3875 6.388 20.7935 5.79397 19.6054 4.60592L19.3937 4.39415C18.2056 3.2061 17.6116 2.61207 16.9266 2.38951C16.3241 2.19373 15.675 2.19373 15.0725 2.38951C14.3875 2.61207 13.7935 3.2061 12.6054 4.39415L4.39366 12.6059C3.20561 13.794 2.61158 14.388 2.38902 15.073C2.19324 15.6755 2.19324 16.3246 2.38902 16.9271C2.61158 17.6121 3.20561 18.2061 4.39366 19.3941L5.06229 20.0628C5.40819 20.4087 5.58114 20.5816 5.78298 20.7053C5.96192 20.815 6.15701 20.8958 6.36108 20.9448C6.59126 21 6.83585 21 7.32503 21H8.67406C9.16324 21 9.40784 21 9.63801 20.9448C9.84208 20.8958 10.0372 20.815 10.2161 20.7053C10.418 20.5816 10.5909 20.4087 10.9368 20.0628Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Stroke {
  id: string;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  tool: "pen" | "rectangle" | "circle" | "line" | "text";
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
  const [tool, setTool] = useState<"pen" | "rectangle" | "circle" | "line" | "text" | "select">("pen");
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [resizeInitialSize, setResizeInitialSize] = useState<number>(0);
  const [pendingTextId, setPendingTextId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const s of strokes) {
      drawStroke(ctx, s);
      if (s.id === selectedId && (s.tool === "text" || s.tool === "rectangle" || s.tool === "circle" || s.tool === "line")) {
        drawSelectionBox(ctx, s);
      }
      if (s.id === hoveredId && s.id !== selectedId && tool === "select") {
        drawHoverBox(ctx, s);
      }
    }

    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke, selectedId, hoveredId, tool]);

  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    ctx.beginPath();
    
    switch (s.tool) {
      case "pen":
        if (s.points.length < 2) return;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        s.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        break;
        
      case "line":
        if (s.startX !== undefined && s.startY !== undefined && 
            s.endX !== undefined && s.endY !== undefined) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
          ctx.moveTo(s.startX, s.startY);
          ctx.lineTo(s.endX, s.endY);
          ctx.stroke();
        }
        break;
        
      case "rectangle":
        if (s.startX !== undefined && s.startY !== undefined && 
            s.endX !== undefined && s.endY !== undefined) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
          const width = s.endX - s.startX;
          const height = s.endY - s.startY;
          ctx.strokeRect(s.startX, s.startY, width, height);
        }
        break;
        
      case "circle":
        if (s.startX !== undefined && s.startY !== undefined && 
            s.endX !== undefined && s.endY !== undefined) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
          const centerX = (s.startX + s.endX) / 2;
          const centerY = (s.startY + s.endY) / 2;
          const radius = Math.min(
            Math.abs(s.endX - s.startX) / 2,
            Math.abs(s.endY - s.startY) / 2
          );
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
        
      case "text":
        if (s.text && s.points.length > 0) {
          ctx.fillStyle = s.color;
          ctx.font = `${s.size * 4}px sans-serif`;
          ctx.textBaseline = "top";
          ctx.fillText(s.text, s.points[0].x, s.points[0].y);
        }
        break;
    }
  };

  const getTextDimensions = (stroke: Stroke): { width: number; height: number; x: number; y: number } => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !stroke.text || stroke.points.length === 0) {
      return { width: 0, height: 0, x: 0, y: 0 };
    }
    
    ctx.font = `${stroke.size * 4}px sans-serif`;
    const metrics = ctx.measureText(stroke.text);
    const textHeight = stroke.size * 4;
    const x = stroke.points[0].x;
    const y = stroke.points[0].y;
    
    return {
      width: metrics.width,
      height: textHeight,
      x: x,
      y: y
    };
  };

  const getShapeBounds = (stroke: Stroke): { x: number; y: number; width: number; height: number } => {
    if (stroke.tool === "line" && stroke.startX !== undefined && 
        stroke.startY !== undefined && stroke.endX !== undefined && stroke.endY !== undefined) {
      const x = Math.min(stroke.startX, stroke.endX);
      const y = Math.min(stroke.startY, stroke.endY);
      const width = Math.abs(stroke.endX - stroke.startX);
      const height = Math.abs(stroke.endY - stroke.startY);
      return { x, y, width, height };
    }
    
    if (stroke.tool === "rectangle" && stroke.startX !== undefined && 
        stroke.startY !== undefined && stroke.endX !== undefined && stroke.endY !== undefined) {
      const x = Math.min(stroke.startX, stroke.endX);
      const y = Math.min(stroke.startY, stroke.endY);
      const width = Math.abs(stroke.endX - stroke.startX);
      const height = Math.abs(stroke.endY - stroke.startY);
      return { x, y, width, height };
    }
    
    if (stroke.tool === "circle" && stroke.startX !== undefined && 
        stroke.startY !== undefined && stroke.endX !== undefined && stroke.endY !== undefined) {
      const x = Math.min(stroke.startX, stroke.endX);
      const y = Math.min(stroke.startY, stroke.endY);
      const width = Math.abs(stroke.endX - stroke.startX);
      const height = Math.abs(stroke.endY - stroke.startY);
      return { x, y, width, height };
    }
    
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  const drawSelectionBox = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    ctx.save();
    
    let boxX: number, boxY: number, boxWidth: number, boxHeight: number;
    
    if (s.tool === "text") {
      const dims = getTextDimensions(s);
      boxX = dims.x - 6;
      boxY = dims.y - 6;
      boxWidth = dims.width + 12;
      boxHeight = dims.height + 12;
    } else {
      const bounds = getShapeBounds(s);
      boxX = bounds.x - 6;
      boxY = bounds.y - 6;
      boxWidth = bounds.width + 12;
      boxHeight = bounds.height + 12;
    }
    
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.setLineDash([]);
    
    const handleSize = 10;
    const handleX = boxX + boxWidth;
    const handleY = boxY + boxHeight;
    
    const gradient = ctx.createRadialGradient(
      handleX, handleY, 2,
      handleX, handleY, handleSize
    );
    gradient.addColorStop(0, "#3b82f6");
    gradient.addColorStop(1, "#1d4ed8");
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(handleX, handleY, handleSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(handleX, handleY, handleSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "6px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("↘", handleX + 1, handleY + 1);
    
    ctx.restore();
  };

  const drawHoverBox = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    ctx.save();
    
    let boxX: number, boxY: number, boxWidth: number, boxHeight: number;
    
    if (s.tool === "text") {
      const dims = getTextDimensions(s);
      boxX = dims.x - 4;
      boxY = dims.y - 4;
      boxWidth = dims.width + 8;
      boxHeight = dims.height + 8;
    } else {
      const bounds = getShapeBounds(s);
      boxX = bounds.x - 4;
      boxY = bounds.y - 4;
      boxWidth = bounds.width + 8;
      boxHeight = bounds.height + 8;
    }
    
    ctx.strokeStyle = "rgba(37, 99, 235, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.setLineDash([]);
    
    ctx.restore();
  };

  const isPointInShape = (point: { x: number; y: number }, stroke: Stroke): boolean => {
    if (stroke.tool === "text") {
      const dims = getTextDimensions(stroke);
      const padding = 10;
      return point.x >= dims.x - padding && point.x <= dims.x + dims.width + padding &&
             point.y >= dims.y - padding && point.y <= dims.y + dims.height + padding;
    }
    
    if (stroke.tool === "line") {
      const bounds = getShapeBounds(stroke);
      const padding = 15;
      return point.x >= bounds.x - padding && point.x <= bounds.x + bounds.width + padding &&
             point.y >= bounds.y - padding && point.y <= bounds.y + bounds.height + padding;
    }
    
    if (stroke.tool === "rectangle") {
      const bounds = getShapeBounds(stroke);
      const padding = 10;
      return point.x >= bounds.x - padding && point.x <= bounds.x + bounds.width + padding &&
             point.y >= bounds.y - padding && point.y <= bounds.y + bounds.height + padding;
    }
    
    if (stroke.tool === "circle") {
      const bounds = getShapeBounds(stroke);
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const radius = Math.min(bounds.width, bounds.height) / 2 + 10;
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      );
      return distance <= radius;
    }
    
    if (stroke.tool === "pen") {
      for (const p of stroke.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2)
        );
        if (distance < 15) return true;
      }
      return false;
    }
    
    return false;
  };

  const isOnResizeHandle = (point: { x: number; y: number }, stroke: Stroke): boolean => {
    let boxX: number, boxY: number, boxWidth: number, boxHeight: number;
    
    if (stroke.tool === "text") {
      const dims = getTextDimensions(stroke);
      boxX = dims.x - 6;
      boxY = dims.y - 6;
      boxWidth = dims.width + 12;
      boxHeight = dims.height + 12;
    } else {
      const bounds = getShapeBounds(stroke);
      boxX = bounds.x - 6;
      boxY = bounds.y - 6;
      boxWidth = bounds.width + 12;
      boxHeight = bounds.height + 12;
    }
    
    const handleX = boxX + boxWidth;
    const handleY = boxY + boxHeight;
    const handleSize = 14;
    
    return point.x >= handleX - handleSize && point.x <= handleX + handleSize &&
           point.y >= handleY - handleSize && point.y <= handleY + handleSize;
  };

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.textBaseline = "top";
      }
      
      redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        color: color,
        size: size,
        points: [{ x: textPosition.x, y: textPosition.y }],
        tool: "text",
        text: textInput.trim(),
      };
      const updatedStrokes = [...strokes, newStroke];
      setStrokes(updatedStrokes);
      if (onChange) {
        onChange(updatedStrokes);
      }
      
      setPendingTextId(newStroke.id);
      setTextInput("");
      setShowTextInput(false);
      setTextPosition(null);
      
      setTool("select");
      setSelectedId(newStroke.id);
    }
  };

  useEffect(() => {
    if (pendingTextId) {
      const element = strokes.find(s => s.id === pendingTextId);
      if (element) {
        setSelectedId(pendingTextId);
        setPendingTextId(null);
        redraw();
      }
    }
  }, [strokes, pendingTextId, redraw]);

  const handleCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const pos = getPos(e);
    
    if (isEraserMode) {
      let foundIndex = -1;
      for (let i = strokes.length - 1; i >= 0; i--) {
        if (isPointInShape(pos, strokes[i])) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex !== -1) {
        const updatedStrokes = [...strokes];
        updatedStrokes.splice(foundIndex, 1);
        setStrokes(updatedStrokes);
        if (onChange) {
          onChange(updatedStrokes);
        }
        setSelectedId(null);
      }
      return;
    }
    
    if (tool === "select") {
      if (selectedId) {
        const selectedStroke = strokes.find(s => s.id === selectedId);
        if (selectedStroke && isOnResizeHandle(pos, selectedStroke)) {
          setIsResizing(true);
          setResizeStartY(pos.y);
          setResizeInitialSize(selectedStroke.size);
          return;
        }
      }
      
      let foundId: string | null = null;
      for (let i = strokes.length - 1; i >= 0; i--) {
        if (isPointInShape(pos, strokes[i])) {
          foundId = strokes[i].id;
          break;
        }
      }
      
      if (!foundId) {
        setSelectedId(null);
      } else {
        setSelectedId(foundId);
      }
      return;
    }
    
    if (tool === "text") {
      setTextPosition(pos);
      setShowTextInput(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    
    if (tool === "select") {
      let foundId: string | null = null;
      for (let i = strokes.length - 1; i >= 0; i--) {
        if (isPointInShape(pos, strokes[i])) {
          foundId = strokes[i].id;
          break;
        }
      }
      setHoveredId(foundId);
    } else {
      setHoveredId(null);
    }
    
    if (isResizing && selectedId) {
      const selectedStroke = strokes.find(s => s.id === selectedId);
      if (selectedStroke && (selectedStroke.tool === "text")) {
        const deltaY = pos.y - resizeStartY;
        const newSize = Math.max(1, resizeInitialSize + deltaY / 5);
        
        const updatedStrokes = strokes.map(s => {
          if (s.id === selectedId) {
            return { ...s, size: Math.round(Math.min(Math.max(newSize, 1), 20)) };
          }
          return s;
        });
        setStrokes(updatedStrokes);
        if (onChange) {
          onChange(updatedStrokes);
        }
        redraw();
      }
      return;
    }
    
    if (isDragging && selectedId && dragOffset) {
      const selectedStroke = strokes.find(s => s.id === selectedId);
      if (selectedStroke) {
        const dx = pos.x - dragStart!.x;
        const dy = pos.y - dragStart!.y;
        
        const updatedStrokes = strokes.map(s => {
          if (s.id === selectedId) {
            if (s.tool === "text") {
              return {
                ...s,
                points: [{ x: s.points[0].x + dx, y: s.points[0].y + dy }]
              };
            } else if (s.tool === "line" || s.tool === "rectangle" || s.tool === "circle") {
              return {
                ...s,
                startX: (s.startX || 0) + dx,
                startY: (s.startY || 0) + dy,
                endX: (s.endX || 0) + dx,
                endY: (s.endY || 0) + dy,
                points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
              };
            } else if (s.tool === "pen") {
              return {
                ...s,
                points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
              };
            }
            return s;
          }
          return s;
        });
        setStrokes(updatedStrokes);
        if (onChange) {
          onChange(updatedStrokes);
        }
        redraw();
        
        setDragStart(pos);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setDragOffset(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || tool !== "select" || !selectedId) return;
    
    const pos = getPos(e);
    
    const selectedStroke = strokes.find(s => s.id === selectedId);
    if (!selectedStroke) return;
    
    if (isOnResizeHandle(pos, selectedStroke)) {
      setIsResizing(true);
      setResizeStartY(pos.y);
      setResizeInitialSize(selectedStroke.size);
      return;
    }
    
    if (isPointInShape(pos, selectedStroke)) {
      setIsDragging(true);
      setDragStart(pos);
      setDragOffset({
        x: pos.x - (selectedStroke.tool === "text" ? selectedStroke.points[0]?.x || 0 : selectedStroke.startX || 0),
        y: pos.y - (selectedStroke.tool === "text" ? selectedStroke.points[0]?.y || 0 : selectedStroke.startY || 0)
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly || isEraserMode || tool === "text" || tool === "select") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const pos = getPos(e);

    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      color: color,
      size: size,
      points: [pos],
      tool: tool as any,
      startX: pos.x,
      startY: pos.y,
      endX: pos.x,
      endY: pos.y,
    };

    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || readOnly) return;

    const pos = getPos(e);
    
    if (tool === "line" || tool === "rectangle" || tool === "circle") {
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

  const handlePointerUp = () => {
    if (!isDrawing || !currentStroke || readOnly) {
      setIsDrawing(false);
      return;
    }

    if (
      (tool === "line" || tool === "rectangle" || tool === "circle") &&
      currentStroke.startX === currentStroke.endX &&
      currentStroke.startY === currentStroke.endY
    ) {
      setCurrentStroke(null);
      setIsDrawing(false);
      return;
    }

    const updatedStrokes = [...strokes, currentStroke];
    setStrokes(updatedStrokes);
    if (onChange) {
      onChange(updatedStrokes);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const clear = () => {
    if (readOnly) return;
    setStrokes([]);
    setSelectedId(null);
    setPendingTextId(null);
    if (onChange) onChange([]);
  };

  return (
    <div ref={wrapRef} className="relative w-full h-full bg-[#f7f6f3] dark:bg-[#1a1a1a]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        style={{ cursor: tool === "select" ? "default" : "crosshair" }}
      />

      {showTextInput && textPosition && (
        <div 
          className="absolute z-10"
          style={{ left: textPosition.x, top: textPosition.y }}
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
                setSelectedId(null);
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
                setSelectedId(null);
              }
            }}
            className="bg-transparent border-2 border-primary outline-none text-foreground font-sans min-w-[100px] p-1 rounded"
            style={{ 
              fontSize: `${size * 4}px`,
              color: color,
            }}
            autoFocus
            placeholder="Type text..."
          />
        </div>
      )}

      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 shadow-lg">
          <button
            onClick={() => {
              setTool("select");
              setIsEraserMode(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              tool === "select" && !isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Select"
          >
            <Move className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setTool("pen");
              setIsEraserMode(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              tool === "pen" && !isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Pen"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsEraserMode(!isEraserMode)}
            className={`p-1.5 rounded transition-colors ${
              isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Eraser"
          >
            <EraserIcon />
          </button>

          <button
            onClick={() => {
              setTool("line");
              setIsEraserMode(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              tool === "line" && !isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Line"
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setTool("rectangle");
              setIsEraserMode(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              tool === "rectangle" && !isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setTool("circle");
              setIsEraserMode(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              tool === "circle" && !isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setTool("text");
              setIsEraserMode(false);
              setSelectedId(null);
            }}
            className={`p-1.5 rounded transition-colors ${
              tool === "text" && !isEraserMode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Text"
          >
            <Type className="h-4 w-4" />
          </button>

          <span className="w-px h-6 bg-border" />

          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraserMode(false);
              }}
              className={`h-5 w-5 rounded-full border-2 transition-all ${
                color === c && !isEraserMode
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ background: c }}
              title={`Color ${c}`}
            />
          ))}

          <span className="w-px h-6 bg-border" />

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

          <button
            onClick={clear}
            className="p-1.5 rounded text-muted-foreground hover:text-red-500 transition-colors"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-2 text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
        <span>{strokes.length} elements</span>
        {isEraserMode && (
          <span className="text-primary font-medium">(Eraser mode - click to delete)</span>
        )}
        {tool === "select" && selectedId && (
          <span className="text-primary font-medium">(Selected - drag to move, use 🔵 handle to resize)</span>
        )}
        {tool === "select" && !selectedId && (
          <span className="text-muted-foreground">(Click an element to select it)</span>
        )}
        {tool === "text" && (
          <span className="text-primary font-medium">(Click on canvas to add text)</span>
        )}
      </div>
    </div>
  );
}