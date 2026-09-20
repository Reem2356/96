import { motion } from "framer-motion";

interface ParticipationMethodProps {
  onSelect: (method: "voice" | "text") => void;
}

const cards = [
  {
    method: "voice" as const,
    icon: "🎙️",
    title: "سجّل بصوتك",
    desc: "تحدث عن وطنك وقائدك",
  },
  {
    method: "text" as const,
    icon: "✍️",
    title: "اكتب كلماتك",
    desc: "عبّر بما تشاء",
  },
];

export function ParticipationMethod({ onSelect }: ParticipationMethodProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-3xl font-bold text-saudi-green-dark sm:text-4xl">
        كيف تريد أن تعبّر؟
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cards.map((card, i) => (
          <motion.button
            key={card.method}
            type="button"
            onClick={() => onSelect(card.method)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="glass group flex flex-col items-center rounded-3xl px-8 py-12 text-center shadow-sm transition hover:shadow-xl"
          >
            <span className="text-6xl transition group-hover:scale-110">{card.icon}</span>
            <h3 className="mt-6 font-display text-2xl font-bold text-saudi-green-dark">{card.title}</h3>
            <p className="mt-2 text-ink/70">{card.desc}</p>
            <span className="mt-6 rounded-full bg-saudi-green-dark px-6 py-2 text-sm font-medium text-ivory transition group-hover:brightness-110">
              اختر هذا
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
