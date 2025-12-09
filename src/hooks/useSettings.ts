import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Setting {
  id: number;
  chave: string;
  valor: string | null;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw new Error(`Erro ao buscar configurações: ${error.message}`);
      
      // Converter para objeto chave-valor
      const settings: Record<string, string> = {};
      data?.forEach((item: Setting) => {
        settings[item.chave] = item.valor || '';
      });
      
      return settings;
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chave, valor }: { chave: string; valor: string }) => {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ chave, valor, updated_at: new Date().toISOString() }, { onConflict: 'chave' })
        .select()
        .single();

      if (error) throw new Error(`Erro ao atualizar configuração: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
