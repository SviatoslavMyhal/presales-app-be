/**
 * Domain model for PreSalesAI deal engine (SaaS-ready).
 */

export type InsightType =
  | "summary"
  | "requirement"
  | "hidden_need"
  | "risk"
  | "question"
  | "solution_variant"
  | "psychology"
  | "score";

export interface DealInput {
  job_post: string;
  client_messages?: string;
  team_expertise?: string;
  constraints?: string;
}

export interface DealScores {
  deal_quality: number;
  risk_score: number;
  confidence?: number;
  labels?: Record<string, string>;
}

export interface Insight {
  id: string;
  dealId: string;
  type: InsightType;
  title: string;
  body: unknown;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface Deal {
  id: string;
  input: DealInput;
  createdAt: string;
  updatedAt: string;
  /** Full pipeline snapshot from existing orchestrator */
  pipeline?: Record<string, unknown>;
  scores?: DealScores;
}

export interface Message {
  id: string;
  dealId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  kind: "question" | "phrase" | "risk_alert" | "architecture";
  content: string;
  priority: "low" | "medium" | "high";
}

export interface CallSession {
  id: string;
  dealId?: string;
  startedAt: string;
  notes: string[];
}

export interface CategorizedQuestions {
  business: string[];
  technical: string[];
  risks: string[];
  scope: string[];
}

export interface SolutionVariants {
  fast: { summary: string; tradeoffs: string[] };
  scalable: { summary: string; tradeoffs: string[] };
  architecture_notes: string[];
}

export interface PsychologyRiskView {
  vague_requirements: string[];
  red_flags: string[];
  unrealistic_expectations: string[];
  budget_signals: string[];
  response_strategy: string;
}
