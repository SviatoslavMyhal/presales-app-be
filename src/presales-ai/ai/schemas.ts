import { z } from "zod";

/** Categorized discovery questions (standalone generation). */
export const CategorizedQuestionsSchema = z.object({
  business: z.array(z.string()),
  technical: z.array(z.string()),
  risks: z.array(z.string()),
  scope: z.array(z.string()),
});

/** Solution variants with tradeoffs. */
export const SolutionVariantsSchema = z.object({
  fast: z.object({
    summary: z.string(),
    tradeoffs: z.array(z.string()),
  }),
  scalable: z.object({
    summary: z.string(),
    tradeoffs: z.array(z.string()),
  }),
  architecture_notes: z.array(z.string()),
});

/** Psychology + risk lens. */
export const PsychologyRiskSchema = z.object({
  vague_requirements: z.array(z.string()),
  red_flags: z.array(z.string()),
  unrealistic_expectations: z.array(z.string()),
  budget_signals: z.array(z.string()),
  response_strategy: z.string(),
});

/** Live assist structured chunk (can be streamed as JSON lines). */
export const LiveAssistChunkSchema = z.object({
  suggested_next_question: z.string().optional(),
  risks_detected: z.array(z.string()).optional(),
  recommended_phrasing: z.string().optional(),
  note: z.string().optional(),
});

export type CategorizedQuestions = z.infer<typeof CategorizedQuestionsSchema>;
export type SolutionVariants = z.infer<typeof SolutionVariantsSchema>;
export type PsychologyRiskView = z.infer<typeof PsychologyRiskSchema>;

export function parseJson<T>(schema: z.ZodType<T>, text: string): T {
  const raw = JSON.parse(text);
  return schema.parse(raw);
}
