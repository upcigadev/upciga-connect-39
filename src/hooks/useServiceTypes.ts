import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceType {
  id: number;
  nome: string;
  valor_padrao: number | null;
  ativo: boolean | null;
  created_at: string;
}

export function useServiceTypes() {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw new Error(`Erro ao buscar tipos de serviço: ${error.message}`);
      return data as ServiceType[];
    },
  });
}

export function useCreateServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceType: { nome: string; valor_padrao?: number }) => {
      const { data, error } = await supabase
        .from('service_types')
        .insert([serviceType])
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar tipo de serviço: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-types'] });
    },
  });
}

export function useDeleteServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir tipo de serviço: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-types'] });
    },
  });
}
