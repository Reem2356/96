import { memo } from "react";
import type { TileVisual } from "../lib/tilePalette";

interface MosaicTileProps {
  visual: TileVisual;
  keyword?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
}

/** زخارف هندسية مجردة مستوحاة من التراث السعودي (نخلة، نجمة، أشكال هندسية) مرسومة كـ SVG بسيط */
function Motif({ type, color }: { type: TileVisual["motif"]; color: string }) {
  switch (type) {
    case "palm":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 opacity-70" fill="none">
          <path d="M12 22V11" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M12 11c0-3-2-5-5-5M12 11c0-3 2-5 5-5M12 11c-1-3-1-6 1-9M12 11c1-3 1-6-1-9M12 11c-3-1-5-3-7-1M12 11c3-1 5-3 7-1"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 opacity-70" fill="none">
          <path
            d="M12 2l2.2 6.2L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10l5.8-1.8L12 2z"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "geometric":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 opacity-70" fill="none">
          <rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth="1.1" transform="rotate(45 12 12)" />
          <rect x="8" y="8" width="8" height="8" stroke={color} strokeWidth="1.1" />
        </svg>
      );
    case "calligraphy":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 opacity-70" fill="none">
          <path d="M4 16c3-6 5-9 8-9s5 3 8 9" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="12" cy="7" r="1.1" fill={color} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 opacity-40" fill="none">
          <path d="M4 12h16M12 4v16" stroke={color} strokeWidth="1" />
        </svg>
      );
  }
}

function MosaicTileBase({ visual, keyword, size = 48, className = "", onClick, title }: MosaicTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{ width: size, height: size, background: visual.background }}
      className={`relative flex items-center justify-center overflow-hidden rounded-[3px] transition-transform duration-200 ${
        onClick ? "cursor-pointer hover:z-10 hover:scale-125 hover:shadow-lg" : "cursor-default"
      } ${className}`}
    >
      <Motif type={visual.motif} color={visual.foreground} />
      {keyword && size >= 64 && (
        <span
          className="absolute bottom-0.5 left-0.5 right-0.5 truncate text-center text-[9px] leading-tight"
          style={{ color: visual.foreground }}
        >
          {keyword}
        </span>
      )}
    </button>
  );
}

export const MosaicTile = memo(MosaicTileBase);
