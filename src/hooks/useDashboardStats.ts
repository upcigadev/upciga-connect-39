import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Buscar todos os dados em paralelo
      const [clientsResult, appointmentsResult, todayAppointmentsResult] = await Promise.all([
        supabase.from('clients').select('id, etiqueta', { count: 'exact' }),
        supabase.from('appointments').select('id, tipo', { count: 'exact' }),
        supabase.from('appointments').select('*').eq('data', new Date().toISOString().split('T')[0]),
      ]);

      if (clientsResult.error) throw new Error(clientsResult.error.message);
      if (appointmentsResult.error) throw new Error(appointmentsResult.error.message);
      if (todayAppointmentsResult.error) throw new Error(todayAppointmentsResult.error.message);

      // Contar agendamentos por tipo
      const tipoCount: Record<string, number> = {};
      appointmentsResult.data?.forEach((a) => {
        tipoCount[a.tipo] = (tipoCount[a.tipo] || 0) + 1;
      });

      // Contar clientes ativos (com etiqueta green)
      const clientesAtivos = clientsResult.data?.filter(c => c.etiqueta === 'green').length || 0;

      // Buscar agendamentos futuros para clientes ativos
      const hoje = new Date().toISOString().split('T')[0];
      const futureAppointmentsResult = await supabase
        .from('appointments')
        .select('cliente_nome')
        .gte('data', hoje);

      const clientesComAgendamentoFuturo = new Set(
        futureAppointmentsResult.data?.map(a => a.cliente_nome) || []
      ).size;

      return {
        totalClientes: clientsResult.count || 0,
        clientesAtivos: clientesComAgendamentoFuturo,
        totalAgendamentos: appointmentsResult.count || 0,
        agendamentosHoje: todayAppointmentsResult.data?.length || 0,
        agendamentosPorTipo: Object.entries(tipoCount).map(([label, value]) => ({ label, value })),
      };
    },
  });
}

export function useRecentClients() {
  return useQuery({
    queryKey: ['recent-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw new Error(error.message);
      return data;
    },
  });
}
