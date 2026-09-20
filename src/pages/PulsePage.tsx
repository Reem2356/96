import { motion } from "framer-motion";
import { useMosaicStats } from "../hooks/useMosaicStats";
import { WordCloud } from "../components/WordCloud";
import { LiveCounter } from "../components/LiveCounter";

export function PulsePage() {
  const stats = useMosaicStats();
  const completionPercent = stats ? Math.round(stats.completionRatio * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-display text-3xl font-bold text-saudi-green-dark sm:text-4xl">
        نبض الوطن
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-ink/60">
        أرقام حيّة تعكس مدى تفاعل الجميع في صناعة لوحة الوطن.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl py-8">
          <LiveCounter value={stats?.approvedCount ?? 0} label="مشاركة" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass rounded-2xl py-8"
        >
          <LiveCounter value={stats?.totalWords ?? 0} label="كلمة" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass rounded-2xl py-8"
        >
          <LiveCounter value={completionPercent} label="% اكتمال اللوحة" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="glass rounded-2xl py-8"
        >
          <LiveCounter value={stats?.pendingCount ?? 0} label="بانتظار المراجعة" />
        </motion.div>
      </div>

      <div className="glass mt-10 rounded-3xl p-6">
        <h2 className="text-center font-display text-xl font-bold text-saudi-green-dark">أكثر الكلمات تكرارًا</h2>
        <WordCloud words={stats?.topKeywords ?? []} />
      </div>
    </div>
  );
}
