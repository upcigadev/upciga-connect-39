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
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: usuario.email,
        password: usuario.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: usuario.nome,
            role: usuario.role,
          },
        },
      });

      if (authError) {
        if (authError.message?.includes('For security purposes')) {
          const match = authError.message.match(/(\d+)\s+seconds/);
          const seconds = match ? match[1] : 'alguns';
          throw new Error(`Aguarde ${seconds} segundos antes de criar outro usuário.`);
        }
        if (authError.message?.includes('already registered')) {
          throw new Error('Este email já está cadastrado.');
        }
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update profile with role and name
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: usuario.email,
          nome: usuario.nome?.trim() || null,
          role: usuario.role,
        });

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
      }

      return authData.user;
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
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('Você precisa estar logado');
      }

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
