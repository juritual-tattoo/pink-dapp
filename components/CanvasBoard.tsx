import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { CANVAS_SIZE, BRAND_COLORS, FLASH_TEMPLATE_URI } from '../constants';
import { mcp } from '../services/mcp';
import { PixelData } from '../types';

export interface CanvasBoardActions {
  undo: () => void;
  redo: () => void;
}

interface CanvasBoardProps {
  currentColor: string;
  isEraser: boolean;
  onInteract: () => void;
  getCanvasRef: (ref: HTMLCanvasElement | null) => void;
  actionRef: React.MutableRefObject<CanvasBoardActions | null>;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({ 
  currentColor, 
  isEraser, 
  onInteract, 
  getCanvasRef,
  actionRef,
  onHistoryChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize history with a stable empty map
  const initialMap = useMemo(() => new Map<string, string>(), []);
  const [history, setHistory] = useState<Map<string, string>[]>([initialMap]);
  const [historyStep, setHistoryStep] = useState(0);
  
  // Current pixels state
  const [pixels, setPixels] = useState<Map<string, string>>(initialMap);
  const [isDrawing, setIsDrawing] = useState(false);

  // Expose Undo/Redo actions
  const undo = useCallback(() => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setPixels(history[newStep]);
      onInteract(); // Trigger haptic/sound if applicable
    }
  }, [historyStep, history, onInteract]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setPixels(history[newStep]);
      onInteract();
    }
  }, [historyStep, history, onInteract]);

  useEffect(() => {
    if (actionRef) {
      actionRef.current = { undo, redo };
    }
  }, [undo, redo, actionRef]);

  // Update parent about availability
  useEffect(() => {
    onHistoryChange(historyStep > 0, historyStep < history.length - 1);
  }, [historyStep, history, onHistoryChange]);

  // Initialize canvas grid
  useEffect(() => {
    if (canvasRef.current) {
      getCanvasRef(canvasRef.current);
    }
  }, [getCanvasRef]);

  const drawPixel = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    const currentPixel = pixels.get(key);
    
    // Prevent redraw same color (optimization)
    if (currentPixel === currentColor && !isEraser) return;
    if (!currentPixel && isEraser) return;

    const newPixels = new Map(pixels);
    
    if (isEraser) {
      newPixels.delete(key);
    } else {
      newPixels.set(key, currentColor);
    }
    
    setPixels(newPixels);
    
    // Notify MCP only on drawing, not erasing empty
    if (!isEraser || currentPixel) {
      mcp.logEvent('draw.pixel', { x, y, color: isEraser ? 'none' : currentColor });
      onInteract();
    }
  }, [pixels, currentColor, isEraser, onInteract]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = Math.floor(((clientX - rect.left) / rect.width) * CANVAS_SIZE);
    const y = Math.floor(((clientY - rect.top) / rect.height) * CANVAS_SIZE);

    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      return { x, y };
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) drawPixel(coords.x, coords.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (coords) drawPixel(coords.x, coords.y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    
    // If the pixel state has changed from the current history snapshot, push new state
    const currentSnapshot = history[historyStep];
    
    // Helper to check map equality efficiently for this use case
    const areDifferent = () => {
        if (pixels.size !== currentSnapshot.size) return true;
        for (const [key, val] of pixels) {
            if (!currentSnapshot.has(key) || currentSnapshot.get(key) !== val) return true;
        }
        return false;
    };

    if (areDifferent()) {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(pixels);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 1. Draw Template (Background Layer - 10% Opacity)
    // In a real app, this would be an Image object. 
    // For MVP, we draw the simplified SVG path or shapes.
    ctx.save();
    ctx.globalAlpha = 0.1;
    const img = new Image();
    img.src = FLASH_TEMPLATE_URI;
    // We assume image loads fast since it's data URI, but normally use onload
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();

    // 2. Draw Pixels
    pixels.forEach((color, key) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });

    // 3. Grid Lines (Optional - very faint)
    ctx.strokeStyle = '#000000';
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    for (let i = 0; i <= CANVAS_SIZE; i++) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
    }
    ctx.stroke();

  }, [pixels]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[400px] aspect-square mx-auto shadow-2xl bg-white border-4 border-brand-dark cursor-crosshair touch-none select-none z-0"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full h-full block z-10 relative"
        style={{ imageRendering: 'pixelated' }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      {/* Corner accents for the "Flash" look - pointer-events-none is crucial here */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-brand-pink z-20 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-brand-pink z-20 pointer-events-none" />
    </div>
  );
};

export default CanvasBoard;