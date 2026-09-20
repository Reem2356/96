import { useEffect, useState } from "react";
import { submissionsRepository } from "../lib/data";
import type { Submission } from "../lib/types";

export function useApprovedSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = submissionsRepository.subscribeToApproved((items) => {
      setSubmissions(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { submissions, loading };
}
