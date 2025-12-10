import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateAuditLog } from './useAudit';

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
  const createAuditLog = useCreateAuditLog();

  return useMutation({
    mutationFn: async (cliente: NovoCliente) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([cliente])
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);
      
      // Registrar log de auditoria
      await createAuditLog('clients', data.id, 'create', { new: data });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  const createAuditLog = useCreateAuditLog();

  return useMutation({
    mutationFn: async ({ id, ...cliente }: Partial<NovoCliente> & { id: number }) => {
      // Buscar dados antigos antes de atualizar
      const { data: oldData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('clients')
        .update(cliente)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      
      // Registrar log de auditoria
      await createAuditLog('clients', id, 'update', { old: oldData, new: data });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  const createAuditLog = useCreateAuditLog();

  return useMutation({
    mutationFn: async (id: number) => {
      // Buscar dados antes de deletar
      const { data: oldData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir cliente: ${error.message}`);
      
      // Registrar log de auditoria
      await createAuditLog('clients', id, 'delete', { old: oldData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}
