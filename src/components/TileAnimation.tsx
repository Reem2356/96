import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApprovedSubmissions } from "../hooks/useApprovedSubmissions";
import { useReferenceTileColors } from "../hooks/useReferenceTileColors";
import { MosaicCanvas } from "./MosaicCanvas";
import { MosaicTile } from "./MosaicTile";
import { getTileVisual } from "../lib/tilePalette";
import { indexToRowCol, TOTAL_TILES } from "../lib/mosaicGrid";

interface TileAnimationProps {
  text: string;
  keywords: string[];
  onFinish: () => void;
}

/** بذرة ثابتة من نص المشاركة لاختيار موضع "معاينة شخصية" فقط لهذه الحركة */
function previewIndexFromText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash % TOTAL_TILES;
}

type Phase = "center" | "moving" | "revealed";

export function TileAnimation({ text, keywords, onFinish }: TileAnimationProps) {
  const [phase, setPhase] = useState<Phase>("center");
  const { submissions } = useApprovedSubmissions();
  const colors = useReferenceTileColors();

  const previewIndex = useMemo(() => previewIndexFromText(text), [text]);
  const { row, col } = indexToRowCol(previewIndex);
  const targetLeft = ((col + 0.5) / Math.sqrt(TOTAL_TILES)) * 100;
  const targetTop = ((row + 0.5) / Math.sqrt(TOTAL_TILES)) * 100;

  const visual = useMemo(
    () => (colors ? getTileVisual(colors[previewIndex], previewIndex) : { background: "#006C35", foreground: "#F6F1E7", motif: "geometric" as const }),
    [colors, previewIndex],
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("moving"), 1400);
    const t2 = setTimeout(() => setPhase("revealed"), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative mx-auto min-h-[70vh] max-w-2xl">
      {phase !== "revealed" && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          {phase === "center" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 font-display text-xl font-bold text-saudi-green-dark sm:text-2xl"
            >
              هذه بصمتك في لوحة الوطن
            </motion.p>
          )}

          <div className="relative h-[70vh] w-full max-w-md">
            <motion.div
              className="absolute"
              initial={{ left: "50%", top: "50%", x: "-50%", y: "-50%", scale: 3 }}
              animate={
                phase === "moving"
                  ? { left: `${targetLeft}%`, top: `${targetTop}%`, x: "-50%", y: "-50%", scale: 0.4, opacity: 0.9 }
                  : { left: "50%", top: "50%", x: "-50%", y: "-50%", scale: 3 }
              }
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <MosaicTile visual={visual} size={72} />
            </motion.div>
          </div>
        </div>
      )}

      {phase === "revealed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-full max-w-md">
            <MosaicCanvas
              approvedSubmissions={submissions}
              colors={colors}
              interactive={false}
              highlightIndex={previewIndex}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-saudi-green-dark">
            <span className="text-2xl">✓</span>
            <p className="font-display text-xl font-bold">تمت إضافة مشاركتك</p>
          </div>
          <p className="mt-2 text-ink/70">أنت الآن جزء من لوحة وطنية صنعها الجميع.</p>

          {keywords.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {keywords.map((kw) => (
                <span key={kw} className="rounded-full bg-saudi-green/10 px-3 py-1 text-xs text-saudi-green-dark">
                  #{kw}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onFinish}
            className="mt-8 rounded-full bg-saudi-green-dark px-8 py-3 font-bold text-ivory shadow-lg transition hover:brightness-110"
          >
            شاهد اللوحة كاملة
          </button>
          <p className="mt-3 max-w-sm text-xs text-ink/50">
            ملاحظة: ستظهر مشاركتك في اللوحة العامة بعد مراجعتها واعتمادها من فريق الإشراف.
          </p>
        </motion.div>
      )}
    </div>
  );
}
