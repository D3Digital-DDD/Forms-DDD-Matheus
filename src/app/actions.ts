"use server";

import { z } from "zod";
import { BRANCHES, OPERATION_QUESTION, pathFromAnswer } from "@/lib/questions";
import { isValidPhoneBR, onlyDigits } from "@/lib/phone";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const utm = z.string().trim().max(200).optional();

const schema = z.object({
  nome: z.string().trim().min(2).max(80),
  whatsapp: z.string().refine(isValidPhoneBR),
  tem_operacao: z.enum(OPERATION_QUESTION.options),
  respostas: z.record(z.string(), z.string().max(200)),
  utm: z
    .object({ source: utm, medium: utm, campaign: utm, content: utm, term: utm })
    .optional(),
  // Campo invisível: só robôs preenchem.
  website: z.string().max(500).optional(),
});

export type SubmitInput = z.input<typeof schema>;
export type SubmitResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Não foi possível enviar agora. Tente novamente em instantes.";

export async function submitApplication(input: SubmitInput): Promise<SubmitResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Confira suas respostas e tente de novo." };

  const data = parsed.data;
  // Robô caiu na armadilha: fingimos sucesso e não salvamos nada.
  if (data.website) return { ok: true };
  const caminho = pathFromAnswer(data.tem_operacao);

  // Cada pergunta do caminho precisa ter uma resposta que exista nas opções.
  const respostas: Record<string, string> = {};
  for (const q of BRANCHES[caminho]) {
    const answer = data.respostas[q.id];
    if (!answer || !q.options.includes(answer)) {
      return { ok: false, error: "Confira suas respostas e tente de novo." };
    }
    respostas[q.id] = answer;
  }

  const row = {
    nome: data.nome,
    whatsapp: onlyDigits(data.whatsapp),
    caminho,
    respostas,
    utm_source: data.utm?.source || null,
    utm_medium: data.utm?.medium || null,
    utm_campaign: data.utm?.campaign || null,
    utm_content: data.utm?.content || null,
    utm_term: data.utm?.term || null,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DDD Private] Supabase não configurado — lead NÃO salvo:", row);
      return { ok: true };
    }
    console.error("[DDD Private] SUPABASE_URL / SUPABASE_SECRET_KEY ausentes.");
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error } = await supabase.from("leads").insert(row);
  if (error) {
    console.error("[DDD Private] Erro ao salvar lead:", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  return { ok: true };
}
