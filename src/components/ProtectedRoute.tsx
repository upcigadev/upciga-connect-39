import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Enquanto está carregando, mostra loading (com timeout de segurança no AuthContext)
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

  // Redirecionamento imediato para login se não autenticado
  // O timeout no AuthContext garante que loading não fica preso infinitamente
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





