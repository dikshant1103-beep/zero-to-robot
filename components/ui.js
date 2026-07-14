import { areaColor } from "@/lib/meta";

export function Bar({ value, thick }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={thick ? "bar thick" : "bar"} role="img" aria-label={`${v}% complete`}>
      <i style={{ width: `${v}%` }} />
    </div>
  );
}

export function AreaChip({ area }) {
  return (
    <span className="chip">
      <span className="dot" style={{ background: areaColor(area) }} />
      {area}
    </span>
  );
}

export function PlatformBadge({ platform }) {
  const label = platform === "udemy" ? "Udemy" : platform === "nptel" ? "NPTEL" : "Free";
  return <span className={`badge ${platform}`}>{label}</span>;
}
