import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduleBlock {
  id: number;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  tipo: string;
  funcionario_id: number | null;
  created_at: string;
}

export interface NovoScheduleBlock {
  descricao: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio?: string;
  hora_fim?: string;
  tipo: string;
  funcionario_id?: number;
}

export function useScheduleBlocks() {
  return useQuery({
    queryKey: ['schedule-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw new Error(`Erro ao buscar bloqueios: ${error.message}`);
      return data as ScheduleBlock[];
    },
  });
}

export function useCreateScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (block: NovoScheduleBlock) => {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .insert([block])
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar bloqueio: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
    },
  });
}

export function useDeleteScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir bloqueio: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
    },
  });
}
