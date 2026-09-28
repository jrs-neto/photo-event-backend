import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, "");
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("❌ Variáveis de ambiente do Supabase não configuradas corretamente.");
}

if (!supabaseServiceKey.startsWith("eyJ")) {
  console.warn("⚠️ ALERTA: A SUPABASE_SERVICE_ROLE_KEY não parece ser um JWT válido (deve começar com 'eyJ').");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
export const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME?.trim().replace(/^["']|["']$/g, "");
