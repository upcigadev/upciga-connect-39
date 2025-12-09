import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NovoCliente {
  nome: string;
  tipo: 'PF' | 'PJ';
  documento: string;
  telefone?: string;
  etiqueta?: 'green' | 'blue' | 'red';
  produtos?: string[];
}

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cliente: NovoCliente) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([cliente])
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...cliente }: Partial<NovoCliente> & { id: number }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(cliente)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir cliente: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}
