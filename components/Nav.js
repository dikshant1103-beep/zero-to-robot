"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "STATUS" },
  { href: "/roadmap", label: "GATES" },
  { href: "/courses", label: "TRAINING" },
  { href: "/books", label: "TOMES" },
  { href: "/log", label: "RAID LOG" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          ⟨ SYSTEM ⟩ <span className="dim">ZERO→ROBOT</span>
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
