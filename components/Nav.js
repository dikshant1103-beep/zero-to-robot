"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

const PUBLIC_LINKS = [
  { href: "/", label: "STATUS" },
  { href: "/roadmap", label: "GATES" },
  { href: "/courses", label: "TRAINING" },
  { href: "/books", label: "TOMES" },
  { href: "/log", label: "RAID LOG" },
];

const ME_LINKS = [
  { href: "/me", label: "STATUS" },
  { href: "/me/roadmap", label: "GATES" },
  { href: "/me/courses", label: "TRAINING" },
  { href: "/me/books", label: "TOMES" },
  { href: "/me/log", label: "RAID LOG" },
];

export default function Nav() {
  const path = usePathname();
  const inMe = path === "/me" || path.startsWith("/me/");
  const links = inMe ? ME_LINKS : PUBLIC_LINKS;
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href={inMe ? "/me" : "/"} className="brand">
          ⟨ SYSTEM ⟩ <span className="dim">ZERO→ROBOT</span>
        </Link>
        <nav className="navlinks">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path === l.href ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-auth">
          <Show
            when="signed-in"
            fallback={
              <SignInButton mode="modal">
                <button className="sys-btn nav-cta">SIGN IN</button>
              </SignInButton>
            }
          >
            {inMe ? (
              <Link href="/" className="nav-swap">
                FOUNDER'S SYSTEM
              </Link>
            ) : (
              <Link href="/me" className="nav-swap glow">
                MY SYSTEM
              </Link>
            )}
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
