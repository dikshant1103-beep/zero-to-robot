import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Zero → Robot",
  description:
    "Dikshant's full-stack robotics journey: design a robot from scratch, train it, deploy it. Humanoid in sim, drone in the field.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="shell">{children}</main>
        <footer className="site">
          <div className="shell" style={{ padding: "0 20px" }}>
            Zero → Robot · started 14 Jul 2026 · updated with every git push
          </div>
        </footer>
      </body>
    </html>
  );
}
