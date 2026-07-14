"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/courses", label: "Courses" },
  { href: "/books", label: "Books" },
  { href: "/log", label: "Build Log" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          ZERO <span className="arrow">→</span> ROBOT
        </Link>
        <nav className="navlinks">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path === l.href ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
