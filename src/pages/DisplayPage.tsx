import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MosaicCanvas } from "../components/MosaicCanvas";
import { MosaicTile } from "../components/MosaicTile";
import { useApprovedSubmissions } from "../hooks/useApprovedSubmissions";
import { useReferenceTileColors } from "../hooks/useReferenceTileColors";
import { useMosaicStats } from "../hooks/useMosaicStats";
import { getTileVisual } from "../lib/tilePalette";
import type { Submission } from "../lib/types";

const MESSAGES = [
  (count: number) => `${count.toLocaleString("ar-SA")} صوتًا وكلمة صنعت هذه اللوحة`,
  () => "كل واحد منا... جزء من الصورة",
  () => "وطن يكتمل بأصواتكم... وقائد يجمعنا",
];

export function DisplayPage() {
  const { submissions, loading } = useApprovedSubmissions();
  const colors = useReferenceTileColors();
  const stats = useMosaicStats();
  const [spotlight, setSpotlight] = useState<Submission | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const knownIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    // ننتظر اكتمال أول تحميل حقيقي قبل ضبط خط الأساس، حتى لا تُعتبر كل
    // المشاركات الموجودة مسبقًا "جديدة" بمجرد وصول أول دفعة بيانات.
    if (loading) return;
    if (knownIds.current === null) {
      knownIds.current = new Set(submissions.map((s) => s.id));
      return;
    }
    const fresh = submissions.find((s) => !knownIds.current!.has(s.id));
    knownIds.current = new Set(submissions.map((s) => s.id));
    if (fresh) {
      setSpotlight(fresh);
      const timer = setTimeout(() => setSpotlight(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [submissions, loading]);

  useEffect(() => {
    const interval = setInterval(() => setMessageIndex((i) => (i + 1) % MESSAGES.length), 4500);
    return () => clearInterval(interval);
  }, []);

  const spotlightVisual =
    spotlight && colors && spotlight.tileIndex !== null ? getTileVisual(colors[spotlight.tileIndex], spotlight.tileIndex) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-saudi-green-dark px-6 py-10 text-ivory">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">لوحة الوطن</h1>

      <div className="mt-6 w-full max-w-xl">
        <MosaicCanvas approvedSubmissions={submissions} colors={colors} interactive={false} />
      </div>

      <div className="mt-8 h-14 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-display text-xl font-bold sm:text-2xl"
          >
            {MESSAGES[messageIndex](stats?.approvedCount ?? 0)}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {spotlight && spotlightVisual && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="glass-dark fixed inset-x-6 bottom-10 mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl p-6 text-center sm:flex-row sm:text-right"
          >
            <MosaicTile visual={spotlightVisual} size={72} />
            <div>
              <p className="font-display text-lg font-bold">«{spotlight.text}»</p>
              <p className="mt-1 text-sm text-ivory/70">مشاركة جديدة انضمت للتو إلى لوحة الوطن</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
