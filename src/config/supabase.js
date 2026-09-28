import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("❌ Variáveis de ambiente do Supabase não configuradas corretamente.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
export const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;
