import roadmap from "@/data/roadmap.json";
import { staticData, getStaticSystem } from "@/lib/static-data";
import StatusView from "@/components/views/StatusView";

export default function Home() {
  const s = getStaticSystem();
  return (
    <StatusView
      system={s}
      log={staticData.log}
      tagline={`${roadmap.commitment.toUpperCase()} · AWAKENED ${roadmap.start} · 6 GATES · ~15 MONTHS`}
      player={{
        name: "DIKSHANT",
        job: (
          <>
            Mechanical Design Engineer{" "}
            <span className="fade">→ Full-Stack Robotics Engineer</span>
          </>
        ),
      }}
      notification={
        <>
          <span className="sys">[NOTIFICATION]</span> You have acquired the
          qualifications to be a <b>Player</b>. The System will now track your
          growth into an engineer who can{" "}
          <b>design a robot from scratch, train it, and deploy it</b> — humanoid
          in simulation, drone in the field. Progress cannot be faked: every
          level comes from a git push.
        </>
      }
    />
  );
}
