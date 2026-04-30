/*
  Shared shape returned by every Phase-3 drill when the student completes it.
  The /practice page forwards these stats into `practice_drill_done`, which the
  analytics layer mirrors into the `practice_attempts` Supabase table.
*/
export type DrillStats = {
  correct: number;
  wrong: number;
  durationMs: number;
};
