import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduleBlock {
  id: number;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  tipo: 'geral' | 'funcionario';
  funcionario_id: number | null;
  created_at: string;
}

export function useScheduleBlocks() {
  return useQuery({
    queryKey: ['schedule_blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar bloqueios: ${error.message}`);
      }

      return (data ?? []) as ScheduleBlock[];
    },
  });
}

export async function checkScheduleConflict(
  data: string,
  hora: string,
  funcionarioNome?: string
): Promise<{ blocked: boolean; reason: string }> {
  try {
    // Buscar todos os bloqueios
    const { data: blocks, error } = await supabase
      .from('schedule_blocks')
      .select('*');

    if (error) {
      console.error('Erro ao verificar bloqueios:', error);
      return { blocked: false, reason: '' };
    }

    if (!blocks || blocks.length === 0) {
      return { blocked: false, reason: '' };
    }

    const agendamentoDate = new Date(`${data}T${hora}`);
    
    for (const block of blocks) {
      const inicioDate = new Date(`${block.data_inicio}T${block.hora_inicio || '00:00'}`);
      const fimDate = new Date(`${block.data_fim}T${block.hora_fim || '23:59'}`);

      // Verificar se a data do agendamento está dentro do período de bloqueio
      if (agendamentoDate >= inicioDate && agendamentoDate <= fimDate) {
        // Se for bloqueio geral, sempre bloquear
        if (block.tipo === 'geral') {
          return {
            blocked: true,
            reason: `Horário indisponível devido a bloqueio: ${block.descricao}`,
          };
        }

        // Se for bloqueio de funcionário, verificar se é o mesmo funcionário
        if (block.tipo === 'funcionario' && funcionarioNome) {
          // Buscar o funcionário pelo ID para comparar o nome
          const { data: funcionario } = await supabase
            .from('employees')
            .select('nome')
            .eq('id', block.funcionario_id)
            .single();

          if (funcionario && funcionario.nome === funcionarioNome) {
            return {
              blocked: true,
              reason: `Horário indisponível: ${funcionarioNome} está em ${block.descricao}`,
            };
          }
        }
      }
    }

    return { blocked: false, reason: '' };
  } catch (error) {
    console.error('Erro ao verificar conflito de agenda:', error);
    return { blocked: false, reason: '' };
  }
}

export interface NovoScheduleBlock {
  descricao: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  tipo: 'geral' | 'funcionario';
  funcionario_id?: number | null;
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

      if (error) {
        throw new Error(`Erro ao criar bloqueio: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_blocks'] });
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

      if (error) {
        throw new Error(`Erro ao excluir bloqueio: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_blocks'] });
    },
  });
}
