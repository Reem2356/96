import { AnimatePresence, motion } from "framer-motion";
import type { Submission } from "../lib/types";

interface TileDetailModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export function TileDetailModal({ submission, onClose }: TileDetailModalProps) {
  return (
    <AnimatePresence>
      {submission && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
          >
            <p className="font-display text-lg leading-relaxed text-saudi-green-dark">
              «{submission.text}»
            </p>
            {submission.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {submission.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-saudi-green/10 px-3 py-1 text-sm text-saudi-green-dark"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-saudi-green-dark px-6 py-2 text-sm font-medium text-ivory transition hover:brightness-110"
            >
              إغلاق
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
