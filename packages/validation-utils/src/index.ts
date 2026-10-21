import { z } from "zod";

export const EmailSchema = z.string().email();
export const PromptSchema = z.string().min(3).max(2000);

export function isWithinPlanLimit(usedThisMonth: number, planLimit: number) {
  return usedThisMonth < planLimit;
}
