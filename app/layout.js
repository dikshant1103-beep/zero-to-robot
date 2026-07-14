import "./globals.css";
import { Orbitron, Rajdhani } from "next/font/google";
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
    "The System tracks Dikshant's rise from zero to full-stack robotics engineer. Humanoid in sim, drone in the field. Level up with every push.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body>
        <Nav />
        <main className="shell">{children}</main>
        <footer className="site">
          ⟨ SYSTEM ONLINE ⟩ · PLAYER: DIKSHANT · AWAKENED 2026.07.14 · LEVELS UP WITH EVERY GIT PUSH
        </footer>
      </body>
    </html>
  );
}
