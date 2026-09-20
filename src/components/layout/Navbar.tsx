import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/participate", label: "شارك الآن" },
  { to: "/mosaic", label: "لوحة الوطن" },
  { to: "/pulse", label: "نبض الوطن" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-white/40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-saudi-green-dark">
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M12 19v-6" stroke="#F6F1E7" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 13C12 13 6.5 11.5 4.5 7C4.5 7 10 5.5 12 13Z" fill="#F6F1E7" />
              <path d="M12 13C12 13 17.5 11.5 19.5 7C19.5 7 14 5.5 12 13Z" fill="#F6F1E7" />
              <path d="M12 13C12 13 8 8.5 7 4C7 4 12 4 12 13Z" fill="#F6F1E7" />
              <path d="M12 13C12 13 16 8.5 17 4C17 4 12 4 12 13Z" fill="#F6F1E7" />
              <path d="M12 13C12 13 10 7.5 12 2C12 2 14 7.5 12 13Z" fill="#F6F1E7" />
            </svg>
          </span>
          <span className="font-display text-sm font-bold text-saudi-green-dark sm:text-base">
            صوتك يرسم الوطن
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-saudi-green-dark text-ivory"
                    : "text-ink/70 hover:bg-saudi-green/10 hover:text-saudi-green-dark"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <NavLink
          to="/participate"
          className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-saudi-green-dark shadow-sm transition hover:brightness-105 sm:hidden"
        >
          شارك
        </NavLink>
      </nav>
    </header>
  );
}
