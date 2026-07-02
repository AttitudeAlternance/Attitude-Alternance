import type { SupabaseClient } from "@supabase/supabase-js";
import { aiDailyLimitForPlan, type Plan } from "@/lib/plan";

export interface AiQuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Vérifie le quota d'appels IA quotidien d'un utilisateur et l'incrémente si l'appel est autorisé.
 * Le compteur se réinitialise automatiquement chaque jour (comparaison de date).
 *
 * Utilisé par toutes les routes qui consomment l'API Anthropic (génération de message,
 * analyse de CV, score de correspondance) afin d'éviter qu'un usage excessif ne fasse
 * grimper la facture de manière incontrôlée.
 */
export async function checkAndConsumeAiQuota(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<AiQuotaResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, ai_calls_today, ai_calls_reset_at")
    .eq("id", userId)
    .maybeSingle();

  const plan: Plan = (profile?.plan as Plan) ?? "free";
  const limit = aiDailyLimitForPlan(plan);

  const today = new Date().toISOString().slice(0, 10);
  const resetAt = profile?.ai_calls_reset_at ?? today;
  const isNewDay = resetAt !== today;

  const currentCount = isNewDay ? 0 : profile?.ai_calls_today ?? 0;

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  await supabase
    .from("profiles")
    .upsert({ id: userId, ai_calls_today: currentCount + 1, ai_calls_reset_at: today });

  return { allowed: true, remaining: limit - (currentCount + 1), limit };
}
