import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-ink/50 sm:px-6">
        صوتك يرسم الوطن — كلماتنا... لوحة لقائدنا
      </footer>
    </div>
  );
}
