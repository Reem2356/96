import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMosaicStats } from "../hooks/useMosaicStats";
import { useApprovedSubmissions } from "../hooks/useApprovedSubmissions";
import { useReferenceTileColors } from "../hooks/useReferenceTileColors";
import { MosaicCanvas } from "./MosaicCanvas";
import { LiveCounter } from "./LiveCounter";

const floatingTiles = [
  { color: "#006C35", top: "12%", left: "8%", delay: 0 },
  { color: "#F6F1E7", top: "20%", left: "85%", delay: 0.4 },
  { color: "#C9A24B", top: "70%", left: "12%", delay: 0.8 },
  { color: "#004D27", top: "78%", left: "80%", delay: 1.2 },
  { color: "#F6F1E7", top: "8%", left: "45%", delay: 1.6 },
];

export function Hero() {
  const stats = useMosaicStats();
  const { submissions } = useApprovedSubmissions();
  const colors = useReferenceTileColors();

  const completionPercent = stats ? Math.round(stats.completionRatio * 100) : 0;

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {floatingTiles.map((t, i) => (
          <motion.div
            key={i}
            className="absolute h-8 w-8 rounded-md opacity-40 animate-float"
            style={{ background: t.color, top: t.top, left: t.left, animationDelay: `${t.delay}s` }}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-right">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-saudi-green-dark lg:mx-0"
          >
            <span>🌴</span>
            <span>مبادرة من المتوسطة السابعة بعرعر</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-bold leading-tight text-saudi-green-dark sm:text-5xl lg:text-6xl"
          >
            صوتك يرسم الوطن
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-shimmer mt-3 font-display text-xl font-semibold sm:text-2xl"
          >
            كلماتنا... لوحة لقائدنا
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink/75 sm:text-lg lg:mx-0"
          >
            عبّر عن حبك لوطنك وقائدك بصوتك أو بكلماتك، ولتكن مشاركتك جزءًا من لوحة وطنية نصنعها معًا.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              to="/participate"
              className="rounded-full bg-saudi-green-dark px-8 py-4 text-lg font-bold text-ivory shadow-lg shadow-saudi-green-dark/20 transition hover:scale-[1.03] hover:brightness-110"
            >
              ابدأ مشاركتك
            </Link>
            <Link
              to="/mosaic"
              className="rounded-full border border-saudi-green-dark/20 bg-white/60 px-8 py-4 text-lg font-medium text-saudi-green-dark transition hover:bg-white"
            >
              شاهد اللوحة
            </Link>
          </motion.div>

          <div className="mt-10 flex justify-center gap-10 lg:justify-start">
            <LiveCounter value={stats?.approvedCount ?? 0} label="مشاركة وطنية" />
            <LiveCounter value={completionPercent} label="% اكتمال اللوحة" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="relative">
            <MosaicCanvas approvedSubmissions={submissions} colors={colors} interactive={false} />
            <div className="glass absolute -bottom-4 left-1/2 w-[88%] -translate-x-1/2 rounded-2xl px-4 py-3 text-center shadow-lg">
              <p className="font-display text-sm font-bold text-saudi-green-dark sm:text-base">
                اكتملت اللوحة بنسبة {completionPercent}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
