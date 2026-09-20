import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GRID_SIZE, indexToRowCol } from "../lib/mosaicGrid";
import type { TileTargetColor } from "../lib/referenceImage";
import { getTileVisual } from "../lib/tilePalette";
import type { Submission } from "../lib/types";

interface MosaicCanvasProps {
  approvedSubmissions: Submission[];
  colors: TileTargetColor[] | null;
  interactive?: boolean;
  highlightIndex?: number | null;
  onTileClick?: (submission: Submission) => void;
  className?: string;
}

const BASE_RESOLUTION = 960; // دقة داخلية ثابتة لرسم Canvas بوضوح عالٍ بغض النظر عن حجم الشاشة

/**
 * يرسم اللوحة الكاملة على Canvas بدل عناصر DOM منفصلة لكل قطعة، ما يسمح
 * بعرض آلاف القطع (حتى 100×100) بأداء سلس، مع دعم التكبير والتصغير والسحب
 * والضغط على قطعة لعرض تفاصيلها.
 */
export function MosaicCanvas({
  approvedSubmissions,
  colors,
  interactive = true,
  highlightIndex = null,
  onTileClick,
  className = "",
}: MosaicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; panX: number; panY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
  });

  const submissionByTile = useMemo(() => {
    const map = new Map<number, Submission>();
    for (const s of approvedSubmissions) {
      if (s.tileIndex !== null) map.set(s.tileIndex, s);
    }
    return map;
  }, [approvedSubmissions]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !colors) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = BASE_RESOLUTION / GRID_SIZE;
    ctx.clearRect(0, 0, BASE_RESOLUTION, BASE_RESOLUTION);

    for (let index = 0; index < colors.length; index++) {
      const { row, col } = indexToRowCol(index);
      const x = col * cell;
      const y = row * cell;
      const submission = submissionByTile.get(index);

      if (submission) {
        const visual = getTileVisual(colors[index], index);
        ctx.fillStyle = visual.background;
        ctx.fillRect(x, y, cell - 0.6, cell - 0.6);
      } else {
        // قطعة لم تُملأ بعد: مظهر فني داكن/شبه فارغ بدل إظهار الصورة الأصلية مباشرة
        const shade = 20 + ((row + col) % 2) * 4;
        ctx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 3})`;
        ctx.fillRect(x, y, cell - 0.6, cell - 0.6);
      }

      if (index === hoveredIndex || index === highlightIndex) {
        ctx.strokeStyle = "#C9A24B";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cell - 2.6, cell - 2.6);
      }
    }
  }, [colors, submissionByTile, hoveredIndex, highlightIndex]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCellFromEvent = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const fracX = (e.clientX - rect.left) / rect.width;
    const fracY = (e.clientY - rect.top) / rect.height;
    if (fracX < 0 || fracX > 1 || fracY < 0 || fracY > 1) return null;
    const col = Math.min(GRID_SIZE - 1, Math.floor(fracX * GRID_SIZE));
    const row = Math.min(GRID_SIZE - 1, Math.floor(fracY * GRID_SIZE));
    return row * GRID_SIZE + col;
  }, []);

  const handleMove = (e: React.MouseEvent) => {
    if (dragState.current.dragging) {
      const dx = (e.clientX - dragState.current.startX) / scale;
      const dy = (e.clientY - dragState.current.startY) / scale;
      setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
      return;
    }
    if (!interactive) return;
    setHoveredIndex(getCellFromEvent(e));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    setScale((s) => Math.min(6, Math.max(1, s - e.deltaY * 0.0015)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const wasDragging = dragState.current.dragging;
    const moved =
      wasDragging && (Math.abs(e.clientX - dragState.current.startX) > 4 || Math.abs(e.clientY - dragState.current.startY) > 4);
    dragState.current.dragging = false;
    if (!interactive || moved) return;
    const idx = getCellFromEvent(e);
    if (idx === null) return;
    const submission = submissionByTile.get(idx);
    if (submission) onTileClick?.(submission);
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-[#0d1f16] ${className}`}
    >
      <div
        className="h-full w-full"
        style={{ transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`, transformOrigin: "center" }}
        onWheel={handleWheel}
        onMouseMove={handleMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragState.current.dragging = false;
          setHoveredIndex(null);
        }}
      >
        <canvas
          ref={canvasRef}
          width={BASE_RESOLUTION}
          height={BASE_RESOLUTION}
          className={`h-full w-full ${interactive ? "cursor-grab active:cursor-grabbing" : ""}`}
        />
      </div>

      {interactive && (
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(6, s + 0.6))}
            className="glass-dark rounded-full px-3 py-1 text-sm text-ivory hover:brightness-110"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(1, s - 0.6))}
            className="glass-dark rounded-full px-3 py-1 text-sm text-ivory hover:brightness-110"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            className="glass-dark rounded-full px-3 py-1 text-xs text-ivory hover:brightness-110"
          >
            إعادة ضبط
          </button>
        </div>
      )}
    </div>
  );
}
