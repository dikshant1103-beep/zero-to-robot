import "./globals.css";
import { Orbitron, Rajdhani } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/Nav";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
});
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});

export const metadata = {
  title: "SYSTEM · Zero → Robot",
  description:
    "The System tracks the rise from zero to full-stack robotics engineer. Humanoid in sim, drone in the field. Sign in and level up with every quest cleared.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#4cc9ff",
    colorBackground: "#0a1120",
    colorText: "#e8f4ff",
    colorTextSecondary: "#9db8d4",
    colorInputBackground: "#060e1e",
    colorInputText: "#e8f4ff",
    colorNeutral: "#e8f4ff",
    borderRadius: "2px",
    fontSize: "15px",
  },
  elements: {
    card: { boxShadow: "0 0 24px rgba(0,140,255,0.18)", border: "1px solid rgba(76,201,255,0.32)" },
    headerTitle: { letterSpacing: "0.08em" },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
        <body>
          <Nav />
          <main className="shell">{children}</main>
          <footer className="site">
            ⟨ SYSTEM ONLINE ⟩ · AWAKENED 2026.07.14 · EVERY PLAYER LEVELS UP ONE QUEST AT A TIME
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
