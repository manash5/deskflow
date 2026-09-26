import { ChatTurn } from "@/modules/types";

const SESSION_GAP_MS = 30 * 60 * 1000;

export type ActivitySession = {
  id: string;
  index: number;
  startedAt: string;
  endedAt: string;
  turns: ChatTurn[];
};

export type ActivityDay = {
  date: string;
  label: string;
  turnCount: number;
  sessions: ActivitySession[];
};

function localDateKey(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const todayKey = localDateKey(today.toISOString());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday.toISOString());

  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function sessionClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sessionRange(session: ActivitySession) {
  const start = sessionClock(session.startedAt);
  const end = sessionClock(session.endedAt);
  return start === end ? start : `${start} – ${end}`;
}

export function groupTurns(turns: ChatTurn[]): ActivityDay[] {
  const chronological = [...turns].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const byDay = new Map<string, ChatTurn[]>();
  for (const turn of chronological) {
    const key = localDateKey(turn.createdAt);
    const bucket = byDay.get(key) || [];
    bucket.push(turn);
    byDay.set(key, bucket);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, dayTurns]) => {
      const sessions: ActivitySession[] = [];
      for (const turn of dayTurns) {
        const previous = sessions[sessions.length - 1];
        const stamp = new Date(turn.createdAt).getTime();
        const gap = previous
          ? stamp - new Date(previous.endedAt).getTime()
          : SESSION_GAP_MS;
        if (!previous || gap > SESSION_GAP_MS) {
          sessions.push({
            id: `${date}-${sessions.length + 1}`,
            index: sessions.length + 1,
            startedAt: turn.createdAt,
            endedAt: turn.createdAt,
            turns: [turn],
          });
        } else {
          previous.turns.push(turn);
          previous.endedAt = turn.createdAt;
        }
      }

      return {
        date,
        label: dayLabel(date),
        turnCount: dayTurns.length,
        sessions,
      };
    });
}
