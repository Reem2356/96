import { useState } from "react";

const MAX_LENGTH = 150;

interface TextSubmissionProps {
  onComplete: (text: string) => void;
}

export function TextSubmission({ onComplete }: TextSubmissionProps) {
  const [text, setText] = useState("");

  return (
    <div className="mx-auto max-w-lg">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        maxLength={MAX_LENGTH}
        rows={5}
        placeholder="اكتب هنا ما يعنيه الوطن لك..."
        className="w-full rounded-2xl border border-saudi-green/20 bg-white/70 p-5 text-lg leading-relaxed focus:border-saudi-green focus:outline-none"
        autoFocus
      />
      <div className="mt-1 flex items-center justify-between text-xs text-ink/40">
        <span>مثال: «وطني هو الأمان والطموح والمستقبل.»</span>
        <span>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => onComplete(text.trim())}
          className="rounded-full bg-saudi-green-dark px-8 py-3 font-bold text-ivory shadow-lg transition hover:brightness-110 disabled:opacity-40"
        >
          حوّل كلماتي إلى جزء من اللوحة
        </button>
      </div>
    </div>
  );
}
