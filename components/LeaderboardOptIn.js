"use client";
import { useState, useTransition } from "react";
import { setLeaderboard } from "@/lib/actions";

// Opt-in only, and the name is one the player types — never their email,
// real name, or anything Clerk knows about them.
export default function LeaderboardOptIn({ onLeaderboard, publicName }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState(publicName || "");

  return (
    <div className="lb-optin">
      {onLeaderboard ? (
        <>
          <span className="ok">◆ LISTED AS “{publicName}”</span>
          <button
            className="sys-btn ghost tiny"
            disabled={pending}
            onClick={() => start(() => setLeaderboard({ optIn: false, publicName: name }))}
          >
            GO PRIVATE
          </button>
        </>
      ) : (
        <form
          className="sys-row"
          action={() => {
            if (!name.trim()) return;
            start(() => setLeaderboard({ optIn: true, publicName: name }));
          }}
        >
          <input
            className="sys-input"
            value={name}
            maxLength={24}
            placeholder="Hunter name"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="sys-btn tiny" disabled={pending || !name.trim()}>
            JOIN RANKINGS
          </button>
        </form>
      )}
      <p className="muted-note">
        Opt-in. Only this name, your level and your XP are shown — nothing else,
        and never your email.
      </p>
    </div>
  );
}
