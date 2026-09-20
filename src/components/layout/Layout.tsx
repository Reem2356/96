import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl space-y-2 px-4 py-10 text-center sm:px-6">
        <p className="text-xs text-ink/50">صوتك يرسم الوطن — كلماتنا... لوحة لقائدنا</p>
        <p className="text-sm font-medium text-saudi-green-dark">مبادرة من المتوسطة السابعة بعرعر 🌴</p>
        <p className="text-xs text-ink/40">
          فكرة وإعداد: ريم الخمسان &nbsp;·&nbsp; مديرة المدرسة: جواهر الرويلي
        </p>
      </footer>
    </div>
  );
}
