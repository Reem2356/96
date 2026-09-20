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

// تدرّج أوسع من سابقه (يبدأ من أسود شبه خالص وينتهي بأبيض خالص) لزيادة
// التباين بين المناطق الداكنة والفاتحة، فتظهر ملامح الصورة أوضح عند
// اكتمال اللوحة، مع الحفاظ على الأخضر السعودي كمنطقة التدرّج الوسطى.
const PALETTE_STOPS: { at: number; color: [number, number, number] }[] = [
  { at: 0, color: [4, 18, 11] }, // شبه أسود بلمسة خضراء
  { at: 0.2, color: [0, 44, 26] }, // أخضر داكن جدًا
  { at: 0.4, color: [0, 77, 39] }, // أخضر داكن (--saudi-green-dark)
  { at: 0.58, color: [0, 108, 53] }, // أخضر سعودي
  { at: 0.72, color: [151, 156, 120] }, // انتقالي
  { at: 0.86, color: [214, 208, 180] }, // عاجي مائل للأخضر
  { at: 1, color: [255, 255, 255] }, // أبيض خالص
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
 * البصرية المحدودة (أخضر/عاجي/أبيض فقط)، حتى تبقى صورة الملك سلمان
 * واضحة عند النظر إلى اللوحة من بعيد رغم التزامنا بالألوان.
 */
export function getTileVisual(target: TileTargetColor, tileIndex: number): TileVisual {
  const [r, g, b] = colorForLuminance(target.luminance);
  const background = `rgb(${r}, ${g}, ${b})`;
  const isDark = target.luminance < 0.5;
  const foreground = isDark ? "#F6F1E7" : "#004D27";

  return {
    background,
    foreground,
    motif: seededPick(tileIndex, MOTIFS),
  };
}
