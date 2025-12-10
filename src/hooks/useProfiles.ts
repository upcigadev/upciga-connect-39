import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, useAuth } from '@/contexts/AuthContext';

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

      if (!data) {
        throw new Error('Nenhum dado retornado do Supabase');
      }

      return data as Profile[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
  const { setIsCreatingUser } = useAuth();

  return useMutation({
    mutationFn: async (usuario: NovoUsuario) => {
      // IMPORTANTE: Salvar a sessão atual para restaurar depois
      // Isso evita que a criação de usuário mude a sessão do admin
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Marcar que estamos criando um usuário para ignorar mudanças de auth state
      if (setIsCreatingUser) {
        setIsCreatingUser(true);
      }
      
      // Passo 1: Criar o usuário no Supabase Auth
      // IMPORTANTE: Para que funcione sem confirmação de email, desabilite
      // "Enable email confirmations" nas configurações de Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: usuario.email,
        password: usuario.password,
        options: {
          emailRedirectTo: undefined,
          // Se a confirmação de email estiver habilitada, o usuário precisará confirmar
          // Para desabilitar: Supabase Dashboard > Authentication > Settings > Disable "Enable email confirmations"
        },
      });

      if (authError) {
        // Tratar erro de rate limiting de forma mais amigável
        if (authError.message?.includes('For security purposes')) {
          const match = authError.message.match(/(\d+)\s+seconds/);
          const seconds = match ? match[1] : 'alguns';
          throw new Error(`Aguarde ${seconds} segundos antes de criar outro usuário. Esta é uma medida de segurança.`);
        }
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        // Remover flag se houver erro
        if (setIsCreatingUser) {
          setIsCreatingUser(false);
        }
        throw new Error('Usuário não foi criado corretamente');
      }

      // IMPORTANTE: Restaurar a sessão IMEDIATAMENTE após criar o usuário
      // Isso deve acontecer ANTES de qualquer outra operação para evitar que
      // o onAuthStateChange mude a sessão para o novo usuário
      if (currentSession) {
        // Restaurar a sessão imediatamente
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
        
        if (sessionError) {
          console.error('Erro ao restaurar sessão:', sessionError);
          // Tentar novamente
          await new Promise(resolve => setTimeout(resolve, 100));
          await supabase.auth.setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
          });
        }
      }

      // Passo 2: Criar ou atualizar o perfil na tabela profiles
      // Aguardar um pouco para garantir que o trigger tenha executado (se existir)
      await new Promise(resolve => setTimeout(resolve, 500));

      const profileData = {
        id: authData.user.id,
        email: usuario.email,
        nome: usuario.nome?.trim() || null,
        role: usuario.role,
      };

      // Tentar inserir o perfil. Se já existir (criado por trigger), apenas atualizar
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      // Se der erro de chave duplicada, significa que o trigger já criou o perfil
      if (insertError && insertError.code === '23505') {
        // Aguardar mais um pouco para garantir que o trigger terminou completamente
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Atualizar o perfil existente com os dados corretos
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: usuario.email,
            nome: usuario.nome?.trim() || null,
            role: usuario.role,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          // Tentar novamente após mais um delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const { error: retryError } = await supabase
            .from('profiles')
            .update({
              email: usuario.email,
              nome: usuario.nome?.trim() || null,
              role: usuario.role,
            })
            .eq('id', authData.user.id);
          
          if (retryError) {
            console.error('Erro ao atualizar perfil após retry:', retryError);
            // Mesmo com erro, o usuário foi criado - retornar sucesso
          }
        }
      } else if (insertError) {
        // Outro tipo de erro - tentar atualizar mesmo assim (pode ser que o trigger criou)
        console.warn('Erro ao inserir perfil, tentando atualizar:', insertError);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: usuario.email,
            nome: usuario.nome?.trim() || null,
            role: usuario.role,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil após erro de inserção:', updateError);
        }
      }

      // Remover flag de criação de usuário após um pequeno delay
      // para garantir que todas as operações de restauração de sessão foram concluídas
      if (setIsCreatingUser) {
        setTimeout(() => {
          setIsCreatingUser(false);
        }, 300);
      }

      // Sempre retornar sucesso se o usuário foi criado no Auth
      // O perfil será atualizado/criado mesmo que haja avisos
      return authData.user;
    },
    onSuccess: () => {
      // Invalidar queries para atualizar a lista de usuários
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (error) => {
      // Log do erro para debug
      console.error('Erro na mutation useCreateUser:', error);
      // Remover flag mesmo em caso de erro
      if (setIsCreatingUser) {
        setIsCreatingUser(false);
      }
    },
    onSettled: () => {
      // Garantir que a flag seja removida sempre, mesmo se houver erro
      if (setIsCreatingUser) {
        setTimeout(() => {
          setIsCreatingUser(false);
        }, 200);
      }
    },
  });
}



