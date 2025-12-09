import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Agendamento {
  id: number;
  cliente_nome: string | null;
  funcionario_nome: string | null;
  data: string;
  hora: string;
  tipo: string;
  urgencia: string | null;
  endereco: string | null;
  modalidade: string | null;
  valor: number | null;
  created_at: string;
}

export interface NovoAgendamento {
  cliente_nome: string;
  funcionario_nome: string;
  data: string;
  hora: string;
  tipo: string;
  urgencia?: string;
  endereco?: string;
  modalidade?: string;
  valor?: number;
}

export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      return data as Agendamento[];
    },
  });
}

export function useAgendamentosHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['agendamentos-hoje'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('data', hoje)
        .order('hora', { ascending: true });

      if (error) throw new Error(`Erro ao buscar agendamentos de hoje: ${error.message}`);
      return data as Agendamento[];
    },
  });
}

export function useAgendamentosByMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['agendamentos', year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      return data as Agendamento[];
    },
  });
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendamento: NovoAgendamento) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([agendamento])
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos-hoje'] });
    },
  });
}

export function useUpdateAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...agendamento }: Partial<Agendamento> & { id: number }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(agendamento)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos-hoje'] });
    },
  });
}

export function useDeleteAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir agendamento: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos-hoje'] });
    },
  });
}
