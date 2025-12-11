import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

/**
 * ProtectedRoute - Guard de rota com abordagem "non-blocking"
 * 
 * Abordagem similar ao Angular/Ionic: o Router sempre carrega e o Guard decide o acesso.
 * Não bloqueia o render da aplicação, permitindo redirecionamento imediato.
 * 
 * Fluxo:
 * 1. Se loading=true: mostra spinner (com timeout de segurança no AuthContext)
 * 2. Se !user && !loading: redireciona IMEDIATAMENTE para /login
 * 3. Se adminOnly && !admin: redireciona para /acesso-negado
 * 4. Caso contrário: renderiza o conteúdo protegido
 */
export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Enquanto está carregando, mostra loading
  // O timeout no AuthContext (5s) garante que loading não fica preso infinitamente
  // mesmo se o Supabase falhar ou não estiver configurado
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionamento IMEDIATO para login se não autenticado
  // Isso acontece assim que loading=false, permitindo fluxo rápido
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificação de permissão admin
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/acesso-negado" replace />;
  }

  // Usuário autenticado e com permissão: renderiza o conteúdo
  return <>{children}</>;
}





