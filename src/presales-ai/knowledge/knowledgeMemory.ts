import type { DealScores } from "../shared/types";

export interface DealFingerprint {
  id: string;
  jobPost: string;
  scores?: DealScores;
  createdAt: string;
}

const store: DealFingerprint[] = [];
const MAX = 500;

export const knowledgeMemory = {
  recordDeal(row: DealFingerprint): void {
    store.unshift(row);
    if (store.length > MAX) store.pop();
  },

  recent(limit = 20): DealFingerprint[] {
    return store.slice(0, limit);
  },

  /** Cheap similarity: token overlap (replace with embeddings in production). */
  findSimilar(jobPost: string, topK = 5): DealFingerprint[] {
    const tokens = new Set(
      jobPost
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
    if (tokens.size === 0) return [];

    const scored = store.map((d) => {
      const dt = new Set(
        d.jobPost
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );
      let overlap = 0;
      for (const t of tokens) {
        if (dt.has(t)) overlap += 1;
      }
      const union = new Set([...tokens, ...dt]).size || 1;
      return { d, score: overlap / union };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter((x) => x.score > 0.05)
      .map((x) => x.d);
  },
};
