import { useEffect } from "react";
import { motion } from "framer-motion";

interface ProcessingScreenProps {
  keywords: string[];
  onDone: () => void;
}

export function ProcessingScreen({ keywords, onDone }: ProcessingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-saudi-green/20 border-t-saudi-green-dark"
      />
      <p className="mt-6 font-display text-xl font-bold text-saudi-green-dark sm:text-2xl">
        نحوّل كلماتك الآن إلى بصمة في لوحة الوطن...
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {keywords.map((kw, i) => (
          <motion.span
            key={kw}
            initial={{ opacity: 0, y: 14, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.18, type: "spring", stiffness: 220, damping: 16 }}
            className="rounded-full bg-saudi-green-dark px-4 py-2 text-sm font-medium text-ivory shadow-md"
          >
            {kw}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
