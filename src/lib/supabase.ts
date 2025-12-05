import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase em falta. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env'
  );
}

// Validação adicional para garantir que as URLs são válidas
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error('VITE_SUPABASE_URL deve ser uma URL válida (começando com http:// ou https://)');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});