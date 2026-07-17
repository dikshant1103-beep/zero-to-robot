import { getSystem } from "@/lib/xp";
import { loadMe } from "@/lib/me";
import StatusView from "@/components/views/StatusView";

export const metadata = { title: "MY SYSTEM · Zero → Robot" };

export default async function MyStatus() {
  const d = await loadMe();
  const s = getSystem(d);
  return (
    <StatusView
      system={s}
      log={d.log}
      base="/me"
      tagline={`PLAYER MODE · AWAKENED ${d.player.awakened} · ${d.roadmap.phases.length} GATES · YOURS TO CLEAR`}
      player={{
        name: d.player.name.toUpperCase(),
        job: d.player.job,
      }}
      notification={
        <>
          <span className="sys">[NOTIFICATION]</span> Welcome back,{" "}
          <b>{d.player.name}</b>. This System is yours: reshape the gates, clear
          the quests, absorb the tomes. Every quest grants XP —{" "}
          <b>the roadmap bends to you, but the grind cannot be faked</b>.
        </>
      }
    />
  );
}
