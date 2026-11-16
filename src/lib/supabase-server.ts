import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase que roda SOMENTE no servidor, com a chave secreta.
 * Retorna null se as variáveis de ambiente não estiverem configuradas.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
