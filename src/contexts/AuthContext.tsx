import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | 'funcionario';

interface Profile {
  id: string;
  email: string;
  role: UserRole;
  nome: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isFuncionario: boolean;
  setIsCreatingUser?: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isCreatingUserRef = useRef(false);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, nome')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Erro de recursão infinita nas políticas RLS
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          console.error('❌ ERRO CRÍTICO: Recursão infinita detectada nas políticas RLS da tabela profiles');
          console.error('📋 SOLUÇÃO: Execute o arquivo fix_profiles_rls.sql no Supabase para corrigir as políticas');
          console.error('   Ou configure as políticas RLS manualmente no dashboard do Supabase');
          return null;
        }
        
        // Se o perfil não existe (código PGRST116), retornar null
        if (error.code === 'PGRST116') {
          console.warn('Perfil não encontrado para o usuário:', userId);
          console.warn('Certifique-se de que o perfil foi criado na tabela profiles com o mesmo id do usuário');
        }
        return null;
      }

      if (!data) {
        console.warn('Perfil retornou null para o usuário:', userId);
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data as Profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Verificar sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      // Ignorar mudanças de auth state se estivermos criando um usuário
      // Isso evita que a sessão mude quando o admin cria um novo usuário
      if (isCreatingUserRef.current) {
        console.log('Ignorando mudança de auth state durante criação de usuário');
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        if (mounted) {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      const profileData = await fetchProfile(data.user.id);
      setProfile(profileData);
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const setIsCreatingUser = (value: boolean) => {
    isCreatingUserRef.current = value;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isFuncionario: profile?.role === 'funcionario' || profile?.role === 'admin',
    setIsCreatingUser, // Expor para uso no hook de criação de usuário
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

