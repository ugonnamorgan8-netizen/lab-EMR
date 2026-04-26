import { useEffect, useMemo, useState } from "react";
import { cn } from "../../utils/cn";

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function TurnaroundTimer({
  registeredAt,
  tatDeadline,
  urgency,
}: {
  registeredAt: string;
  tatDeadline?: string | null;
  urgency: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const state = useMemo(() => {
    const start = new Date(registeredAt).getTime();
    if ((urgency === "URGENT" || urgency === "STAT") && tatDeadline) {
      const deadline = new Date(tatDeadline).getTime();
      const remaining = Math.max(0, Math.round((deadline - now) / 60000));
      const total = Math.max(1, Math.round((deadline - start) / 60000));
      const elapsedPercent = 1 - remaining / total;
      return {
        label: `${urgency === "STAT" ? "⚡ " : ""}${formatMinutes(remaining)} remaining`,
        tone: urgency === "STAT" ? "text-brand-red" : elapsedPercent > 0.85 ? "text-brand-red" : elapsedPercent > 0.5 ? "text-brand-amber" : "text-brand-green",
      };
    }

    const elapsed = Math.max(0, Math.round((now - start) / 60000));
    return {
      label: `${formatMinutes(elapsed)} elapsed`,
      tone: "text-brand-green",
    };
  }, [now, registeredAt, tatDeadline, urgency]);

  return <span className={cn("text-sm font-medium", state.tone)}>{state.label}</span>;
}
