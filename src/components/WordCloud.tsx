import { motion } from "framer-motion";

interface WordCloudProps {
  words: { word: string; count: number }[];
}

export function WordCloud({ words }: WordCloudProps) {
  if (words.length === 0) {
    return <p className="text-center text-ink/50">لا توجد كلمات كافية بعد.</p>;
  }

  const max = Math.max(...words.map((w) => w.count));
  const min = Math.min(...words.map((w) => w.count));

  const sizeFor = (count: number) => {
    if (max === min) return 22;
    const t = (count - min) / (max - min);
    return 14 + t * 28; // px
  };

  const colors = ["text-saudi-green", "text-saudi-green-dark", "text-gold"];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 p-4">
      {words.map((w, i) => (
        <motion.span
          key={w.word}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 16 }}
          style={{ fontSize: sizeFor(w.count) }}
          className={`font-display font-bold ${colors[i % colors.length]}`}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
}
