import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LiveCounterProps {
  value: number;
  label: string;
  className?: string;
}

/** عداد يتحرك بسلاسة نحو القيمة الجديدة بدل القفز المباشر بين الأرقام */
export function LiveCounter({ value, label, className = "" }: LiveCounterProps) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const duration = 700;
    const start = performance.now();

    let frame: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(step);
      else prev.current = to;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center ${className}`}
    >
      <div className="font-display text-4xl font-bold text-saudi-green-dark sm:text-5xl">
        {display.toLocaleString("ar-SA")}
      </div>
      <div className="mt-1 text-sm text-ink/70 sm:text-base">{label}</div>
    </motion.div>
  );
}
