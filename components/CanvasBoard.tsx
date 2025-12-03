import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { CANVAS_SIZE, FLASH_TEMPLATE_URI } from '../constants';
import { mcp } from '../services/mcp';
import {
  isValidCanvasCoordinate,
  isValidColor,
  validateAndSanitizeCoordinates,
} from '../utils/validation';

// Limite máximo do histórico
const MAX_HISTORY_SIZE = 50;

// Função throttle para limitar frequência de eventos
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

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
  onHistoryChange,
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

  // Ref para acessar pixels atual sem depender dele no useCallback
  const pixelsRef = useRef<Map<string, string>>(initialMap);

  // Atualizar ref sempre que pixels mudar
  useEffect(() => {
    pixelsRef.current = pixels;
  }, [pixels]);

  // Cache da imagem do template
  const templateImageRef = useRef<HTMLImageElement | null>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Carregar imagem do template uma única vez
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      templateImageRef.current = img;
    };
    img.onerror = (error) => {
      console.error('Erro ao carregar template:', error);
    };
    img.src = FLASH_TEMPLATE_URI;
  }, []);

  // Criar canvas estático para o grid (desenhado uma única vez)
  useEffect(() => {
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = CANVAS_SIZE;
    gridCanvas.height = CANVAS_SIZE;
    const gridCtx = gridCanvas.getContext('2d');

    if (gridCtx) {
      try {
        gridCtx.strokeStyle = '#000000';
        gridCtx.globalAlpha = 0.05;
        gridCtx.lineWidth = 0.05;
        gridCtx.beginPath();
        for (let i = 0; i <= CANVAS_SIZE; i++) {
          gridCtx.moveTo(i, 0);
          gridCtx.lineTo(i, CANVAS_SIZE);
          gridCtx.moveTo(0, i);
          gridCtx.lineTo(CANVAS_SIZE, i);
        }
        gridCtx.stroke();
        gridCanvasRef.current = gridCanvas;
      } catch (error) {
        console.error('Erro ao desenhar grid:', error);
      }
    }
  }, []);

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

  // Otimizado: usa ref para acessar pixels atual sem depender dele
  const drawPixel = useCallback(
    (x: number, y: number) => {
      // Validação profissional de coordenadas
      if (!isValidCanvasCoordinate(x, y)) {
        console.warn('[CanvasBoard] Coordenadas inválidas:', { x, y });
        return;
      }

      const key = `${x},${y}`;
      const currentPixels = pixelsRef.current; // Usa ref ao invés de pixels diretamente
      const currentPixel = currentPixels.get(key);

      // Prevent redraw same color (optimization)
      if (currentPixel === currentColor && !isEraser) return;
      if (!currentPixel && isEraser) return;

      const newPixels = new Map(currentPixels);

      if (isEraser) {
        newPixels.delete(key);
      } else {
        // Validação profissional de cor
        if (!isValidColor(currentColor)) {
          console.warn('[CanvasBoard] Cor inválida:', currentColor);
          return;
        }
        newPixels.set(key, currentColor);
      }

      setPixels(newPixels);

      // Notify MCP only on drawing, not erasing empty
      if (!isEraser || currentPixel) {
        try {
          mcp.logEvent('draw.pixel', { x, y, color: isEraser ? 'none' : currentColor });
          onInteract();
        } catch (error) {
          console.error('[CanvasBoard] Erro ao registrar evento:', error);
        }
      }
    },
    [currentColor, isEraser, onInteract]
  ); // Removido pixels das dependências

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = Math.floor(((clientX - rect.left) / rect.width) * CANVAS_SIZE);
    const y = Math.floor(((clientY - rect.top) / rect.height) * CANVAS_SIZE);

    // Usar validação profissional
    return validateAndSanitizeCoordinates(x, y);
  };

  // Throttled version do drawPixel para melhor performance
  // O throttle só é chamado em event handlers (handleMove), nunca durante render
  // Nota: ESLint pode avisar sobre refs, mas é um falso positivo neste caso
  const drawPixelThrottled = useMemo(
    () =>
      throttle((x: number, y: number) => {
        drawPixel(x, y);
      }, 16), // ~60fps (16ms)
    [drawPixel]
  );

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      // No início, desenha imediatamente (sem throttle)
      drawPixel(coords.x, coords.y);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (coords) {
      // Durante o movimento, usa throttle para melhor performance
      drawPixelThrottled(coords.x, coords.y);
    }
  };

  const handleEnd = useCallback(() => {
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
      newHistory.push(new Map(pixels)); // Criar nova instância do Map

      // Limitar tamanho do histórico
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift(); // Remove o mais antigo
        setHistoryStep(MAX_HISTORY_SIZE - 1);
      } else {
        setHistoryStep(newHistory.length - 1);
      }

      setHistory(newHistory);
    }
  }, [history, historyStep, pixels]);

  // Rendering Loop - Otimizado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Clear
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 1. Draw Template (Background Layer - 10% Opacity) - usando imagem em cache
      if (templateImageRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.drawImage(templateImageRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.restore();
      }

      // 2. Draw Grid (usando canvas estático em cache)
      if (gridCanvasRef.current) {
        ctx.drawImage(gridCanvasRef.current, 0, 0);
      }

      // 3. Draw Pixels
      pixels.forEach((color, key) => {
        try {
          const [x, y] = key.split(',').map(Number);
          // Validação de coordenadas
          if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        } catch (error) {
          console.error('Erro ao desenhar pixel:', key, error);
        }
      });
    } catch (error) {
      console.error('Erro na renderização do canvas:', error);
    }
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
