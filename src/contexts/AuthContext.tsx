import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca o perfil de forma segura
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, nome')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Timeout de segurança: se após 5 segundos ainda estiver carregando, força o loading para false
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Timeout ao verificar autenticação, assumindo usuário não autenticado');
        setLoading(false);
      }
    }, 5000);

    // 1. Configura o listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        try {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (!newSession?.user) {
            setProfile(null);
            setLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
          } else {
            // Se o usuário logou, busca o perfil
            const profileData = await fetchProfile(newSession.user.id);
            if (mounted) {
              setProfile(profileData);
              setLoading(false);
              if (timeoutId) clearTimeout(timeoutId);
            }
          }
        } catch (error) {
          console.error('Erro no onAuthStateChange:', error);
          if (mounted) {
            setLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
          }
        }
      }
    );

    // 2. Verifica a sessão inicial
    supabase.auth.getSession()
      .then(async ({ data: { session: existingSession } }) => {
        if (!mounted) return;
        
        try {
          setSession(existingSession);
          setUser(existingSession?.user ?? null);
          
          if (existingSession?.user) {
            const profileData = await fetchProfile(existingSession.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          }
        } catch (error) {
          console.error('Erro ao processar sessão existente:', error);
        }
      })
      .catch((err) => {
        console.error("Erro ao verificar sessão inicial:", err);
        // Em caso de erro (ex: Supabase não configurado), assume usuário não autenticado
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      })
      .finally(() => {
        // CORREÇÃO: Garante que o loading pare, aconteça o que acontecer
        if (mounted) {
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
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