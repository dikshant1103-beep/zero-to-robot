export const AREA_COLORS = {
  CS: "var(--c-cs)",
  Robotics: "var(--c-robotics)",
  Electronics: "var(--c-electronics)",
  Control: "var(--c-control)",
  ML: "var(--c-ml)",
  Drone: "var(--c-drone)",
  Humanoid: "var(--c-humanoid)",
  Embedded: "var(--c-embedded)",
};

export function areaColor(area) {
  return AREA_COLORS[area] || "var(--muted)";
}
