import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";

const steps = [
  { icon: "🎙️", title: "شارك", desc: "بصوتك أو بكلماتك في أقل من دقيقة" },
  { icon: "✨", title: "تُحلَّل مشاركتك", desc: "نستخرج كلماتها المفتاحية تلقائيًا" },
  { icon: "🧩", title: "تنضم إلى اللوحة", desc: "بعد اعتمادها تصبح قطعة في صورة قائدنا" },
];

export function HomePage() {
  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="glass rounded-2xl p-6 text-center">
              <span className="text-4xl">{s.icon}</span>
              <h3 className="mt-4 font-display text-lg font-bold text-saudi-green-dark">{s.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link to="/pulse" className="text-sm font-medium text-saudi-green-dark underline underline-offset-4">
            اطّلع على نبض الوطن وإحصائيات المشاركات ←
          </Link>
        </div>
      </section>
    </div>
  );
}
