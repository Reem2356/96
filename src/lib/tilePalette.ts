import type { TileTargetColor } from "./referenceImage";

export type TileMotif = "palm" | "geometric" | "calligraphy" | "star" | "plain";

export interface TileVisual {
  background: string;
  foreground: string;
  motif: TileMotif;
}

/** بذرة بسيطة مشتقة من رقم القطعة لاختيار نمط زخرفي بشكل ثابت (لا يتغير مع كل رندر) */
function seededPick<T>(seed: number, options: T[]): T {
  const idx = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return options[Math.floor(idx * options.length)];
}

const PALETTE_STOPS: { at: number; color: [number, number, number] }[] = [
  { at: 0, color: [0, 44, 26] }, // أخضر داكن جدًا
  { at: 0.28, color: [0, 77, 39] }, // أخضر داكن (--saudi-green-dark)
  { at: 0.52, color: [0, 108, 53] }, // أخضر سعودي
  { at: 0.75, color: [214, 208, 180] }, // عاجي مائل للأخضر
  { at: 1, color: [246, 241, 231] }, // عاجي/أبيض
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function colorForLuminance(luminance: number): [number, number, number] {
  for (let i = 0; i < PALETTE_STOPS.length - 1; i++) {
    const cur = PALETTE_STOPS[i];
    const next = PALETTE_STOPS[i + 1];
    if (luminance >= cur.at && luminance <= next.at) {
      const t = (luminance - cur.at) / (next.at - cur.at || 1);
      return [
        Math.round(lerp(cur.color[0], next.color[0], t)),
        Math.round(lerp(cur.color[1], next.color[1], t)),
        Math.round(lerp(cur.color[2], next.color[2], t)),
      ];
    }
  }
  return PALETTE_STOPS[PALETTE_STOPS.length - 1].color;
}

const MOTIFS: TileMotif[] = ["geometric", "palm", "calligraphy", "star", "plain"];

/**
 * يحوّل لون الخلية الهدف (من الصورة المرجعية) إلى لون فعلي ضمن هويتنا
 * البصرية المحدودة (أخضر/عاجي/أبيض + ذهبي نادر جدًا)، حتى تبقى صورة
 * الملك سلمان واضحة عند النظر إلى اللوحة من بعيد رغم التزامنا بالألوان.
 */
export function getTileVisual(target: TileTargetColor, tileIndex: number): TileVisual {
  const [r, g, b] = colorForLuminance(target.luminance);
  const background = `rgb(${r}, ${g}, ${b})`;
  const isDark = target.luminance < 0.5;
  const foreground = isDark ? "#F6F1E7" : "#004D27";

  // لمسة ذهبية نادرة جدًا (Accent محدود) في مناطق منتصف الإضاءة فقط
  const useGold = target.luminance > 0.4 && target.luminance < 0.58 && seededPick(tileIndex, [0, 0, 0, 0, 0, 1]) === 1;

  return {
    background: useGold ? "#C9A24B" : background,
    foreground: useGold ? "#004D27" : foreground,
    motif: seededPick(tileIndex, MOTIFS),
  };
}
