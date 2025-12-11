import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Agendamentos from "./pages/Agendamentos";
import Funcionarios from "./pages/Funcionarios";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import AcessoNegado from "./pages/AcessoNegado";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados considerados frescos
      gcTime: 1000 * 60 * 10, // 10 minutos - tempo de cache (anteriormente cacheTime)
      retry: 1, // Tentar novamente apenas 1 vez em caso de erro
      refetchOnWindowFocus: false, // Não refazer fetch ao focar na janela
    },
  },
});

// Verificação inicial de variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const App = () => {
  // Se as variáveis não estiverem configuradas, mostra uma tela de erro
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || 
      SUPABASE_URL === 'https://placeholder.supabase.co' || 
      SUPABASE_PUBLISHABLE_KEY === 'placeholder-key') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Configuração Necessária</CardTitle>
            <CardDescription>
              As variáveis de ambiente do Supabase não estão configuradas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold mb-2">Configure no Vercel:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-background px-2 py-1 rounded">VITE_SUPABASE_URL</code></li>
                <li><code className="bg-background px-2 py-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Acesse: <strong>Vercel Dashboard</strong> → <strong>Settings</strong> → <strong>Environment Variables</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Após configurar, faça um novo deploy.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/acesso-negado" element={<AcessoNegado />} />
              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Clientes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agendamentos"
                element={
                  <ProtectedRoute>
                    <Agendamentos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funcionarios"
                element={
                  <ProtectedRoute adminOnly>
                    <Funcionarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <ProtectedRoute adminOnly>
                    <Relatorios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute adminOnly>
                    <Configuracoes />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
