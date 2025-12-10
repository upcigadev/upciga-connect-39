import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  nome: string | null;
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, nome')
        .order('email', { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      return (data ?? []) as Profile[];
    },
  });
}

export function useUpdateProfileRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar role: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export interface NovoUsuario {
  email: string;
  password: string;
  nome?: string;
  role: UserRole;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usuario: NovoUsuario) => {
      // Use edge function to create user - this won't affect admin session
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: usuario.email,
          password: usuario.password,
          nome: usuario.nome,
          role: usuario.role,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar usuário');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao excluir usuário');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
