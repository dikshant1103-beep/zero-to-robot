# Zero → Robot

Live dashboard for a 15-month full-stack robotics journey: design a robot from
scratch, train it, deploy it. Humanoid in simulation, drone in the field.

**Live:** deployed on Vercel (auto-deploys from `main`).

## How to update progress

Everything is data-driven — no code changes needed for day-to-day updates:

| What | File | Field to edit |
|---|---|---|
| Tick a milestone | `data/roadmap.json` | `milestones[].done: true` |
| Course progress | `data/courses.json` | `progress: 0–100` (and swap search `url` for your enrolled course URL) |
| Chapters read | `data/books.json` | `chaptersRead` |
| New journal entry | `data/log.json` | prepend to `entries` (newest first) |
| Phase transition | `data/roadmap.json` | set old phase `"status": "done"`, new one `"active"` |

Then:

```bash
git add -A && git commit -m "progress: <what>" && git push
```

Vercel redeploys automatically. Or just tell Claude: *"update the robot dashboard — finished ROS2 section 4, read Modern Robotics ch 3."*

## Stack

Next.js 15 (App Router, JS), no other dependencies. Data in `data/*.json`.

```bash
npm install
npm run dev
```
