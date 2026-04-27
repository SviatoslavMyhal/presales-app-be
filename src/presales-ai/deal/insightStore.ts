import { randomUUID } from "crypto";
import type { Deal, Insight } from "../shared/types";
import { DealNotFoundError } from "../shared/errors";

const deals = new Map<string, Deal>();
const insights = new Map<string, Insight[]>();

export function saveDeal(deal: Deal): void {
  deals.set(deal.id, deal);
}

export function getDeal(id: string): Deal {
  const d = deals.get(id);
  if (!d) throw new DealNotFoundError(id);
  return d;
}

export function appendInsights(dealId: string, items: Omit<Insight, "id" | "dealId" | "createdAt">[]): Insight[] {
  const list = insights.get(dealId) ?? [];
  const now = new Date().toISOString();
  const created: Insight[] = items.map((i) => ({
    ...i,
    id: randomUUID(),
    dealId,
    createdAt: now,
  }));
  insights.set(dealId, [...list, ...created]);
  return created;
}

export function listInsights(dealId: string): Insight[] {
  return insights.get(dealId) ?? [];
}

export function deleteDeal(id: string): void {
  deals.delete(id);
  insights.delete(id);
}
