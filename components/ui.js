import { areaColor } from "@/lib/meta";

export function Bar({ value, slim, gold }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`bar${slim ? " slim" : ""}${gold ? " gold" : ""}`}
      role="img"
      aria-label={`${v}% complete`}
    >
      <i style={{ width: `${v}%` }} />
    </div>
  );
}

export function AreaChip({ area }) {
  return (
    <span className="chip">
      <span className="dot" style={{ background: areaColor(area), color: areaColor(area) }} />
      {area}
    </span>
  );
}

export function PlatformBadge({ platform }) {
  const label = platform === "udemy" ? "Udemy" : platform === "nptel" ? "NPTEL" : "Free";
  return <span className={`badge ${platform}`}>{label}</span>;
}

export function Window({ title, children, style, className = "" }) {
  return (
    <section className={`window ${className}`.trim()} style={style}>
      {title && <div className="w-head">{title}</div>}
      {children}
    </section>
  );
}

export function SysAlert({ children }) {
  return (
    <div className="sys-alert">
      <div className="mark">
        <span>!</span>
      </div>
      <div className="msg">{children}</div>
    </div>
  );
}
