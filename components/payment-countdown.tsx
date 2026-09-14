"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function getTimeLeft(deadline: Date) {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PaymentCountdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState<string | null>(() =>
    getTimeLeft(deadline),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <span className="text-xs text-destructive font-medium">Expired</span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-destructive">
      <Clock className="size-3.5" />
      <span className="text-sm font-medium tabular-nums">{timeLeft}</span>
    </div>
  );
}
