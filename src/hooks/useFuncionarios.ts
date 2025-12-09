import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  funcao: string | null;
  status: string | null;
  servicos: string[] | null;
  agendamentos_hoje: number | null;
  created_at: string;
}

export interface NovoFuncionario {
  nome: string;
  cpf: string;
  funcao?: string;
  status?: string;
  servicos?: string[];
}

export function useFuncionarios() {
  return useQuery({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw new Error(`Erro ao buscar funcionários: ${error.message}`);
      return data as Funcionario[];
    },
  });
}

export function useCreateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionario: NovoFuncionario) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([funcionario])
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar funcionário: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

export function useUpdateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...funcionario }: Partial<Funcionario> & { id: number }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(funcionario)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Erro ao atualizar funcionário: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

export function useDeleteFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir funcionário: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}
