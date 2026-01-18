import { useState, useEffect, useCallback } from "react";

export interface ClaimHistoryItem {
  id: string;
  claimText: string;
  timestamp: Date;
  status: "completed" | "processing" | "failed";
  summary?: string;
}

const STORAGE_KEY = "claimflow-history";

export const useClaimsHistory = () => {
  const [claims, setClaims] = useState<ClaimHistoryItem[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setClaims(parsed.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })));
      } catch (e) {
        console.error("Failed to parse claims history:", e);
      }
    }
  }, []);

  const saveClaim = useCallback((claimText: string, summary?: string): string => {
    const id = crypto.randomUUID();
    const newClaim: ClaimHistoryItem = {
      id,
      claimText,
      timestamp: new Date(),
      status: "processing",
      summary: summary || claimText.slice(0, 50) + (claimText.length > 50 ? "..." : ""),
    };

    setClaims((prev) => {
      const updated = [newClaim, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setSelectedClaimId(id);
    return id;
  }, []);

  const updateClaimStatus = useCallback((id: string, status: ClaimHistoryItem["status"], summary?: string) => {
    setClaims((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, status, summary: summary || c.summary } : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteClaim = useCallback((id: string) => {
    setClaims((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (selectedClaimId === id) {
      setSelectedClaimId(null);
    }
  }, [selectedClaimId]);

  const clearHistory = useCallback(() => {
    setClaims([]);
    setSelectedClaimId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    claims,
    selectedClaimId,
    setSelectedClaimId,
    saveClaim,
    updateClaimStatus,
    deleteClaim,
    clearHistory,
  };
};
