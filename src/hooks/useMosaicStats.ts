import { useEffect, useState } from "react";
import { submissionsRepository } from "../lib/data";
import type { MosaicStats } from "../lib/types";

export function useMosaicStats(pollIntervalMs = 4000) {
  const [stats, setStats] = useState<MosaicStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      submissionsRepository.getStats().then((s) => {
        if (!cancelled) setStats(s);
      });
    };

    refresh();
    const unsubscribe = submissionsRepository.subscribeToApproved(refresh);
    const interval = window.setInterval(refresh, pollIntervalMs);

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return stats;
}
