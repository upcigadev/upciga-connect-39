import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useRelatoriosStats() {
  return useQuery({
    queryKey: ['relatorios-stats'],
    queryFn: async () => {
      // Fetch all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*');

      if (appointmentsError) throw appointmentsError;

      // Fetch all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Fetch all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) throw employeesError;

      // Calculate total revenue
      const totalArrecadado = (appointments ?? []).reduce(
        (acc, apt) => acc + (apt.valor || 0),
        0
      );

      // Calculate appointments by type
      const appointmentsByType: Record<string, { quantidade: number; valorTotal: number }> = {};
      (appointments ?? []).forEach((apt) => {
        const tipo = apt.tipo || 'Outros';
        if (!appointmentsByType[tipo]) {
          appointmentsByType[tipo] = { quantidade: 0, valorTotal: 0 };
        }
        appointmentsByType[tipo].quantidade++;
        appointmentsByType[tipo].valorTotal += apt.valor || 0;
      });

      const dadosServicos = Object.entries(appointmentsByType).map(([tipo, data]) => ({
        tipo,
        quantidade: data.quantidade,
        valorMedio: data.quantidade > 0 ? Math.round(data.valorTotal / data.quantidade) : 0,
      }));

      // Calculate top clients by appointments count
      const clientAppointments: Record<string, { nome: string; chamados: number; valor: number }> = {};
      (appointments ?? []).forEach((apt) => {
        const clienteNome = apt.cliente_nome || 'Sem cliente';
        if (!clientAppointments[clienteNome]) {
          clientAppointments[clienteNome] = { nome: clienteNome, chamados: 0, valor: 0 };
        }
        clientAppointments[clienteNome].chamados++;
        clientAppointments[clienteNome].valor += apt.valor || 0;
      });

      const topClientes = Object.values(clientAppointments)
        .sort((a, b) => b.chamados - a.chamados)
        .slice(0, 5);

      // Calculate monthly evolution (last 6 months)
      const evolucaoMensal: { mes: string; valor: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const mesNome = format(date, 'MMM', { locale: ptBR });
        
        const monthAppointments = (appointments ?? []).filter((apt) => {
          const aptDate = new Date(apt.data);
          return aptDate >= monthStart && aptDate <= monthEnd;
        });

        const monthTotal = monthAppointments.reduce((acc, apt) => acc + (apt.valor || 0), 0);
        
        evolucaoMensal.push({
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
          valor: monthTotal,
        });
      }

      // Employee performance
      const funcionariosDesempenho: { nome: string; atendimentos: number; valor: number }[] = [];
      const employeeAppointments: Record<string, { nome: string; atendimentos: number; valor: number }> = {};
      
      (appointments ?? []).forEach((apt) => {
        const funcNome = apt.funcionario_nome || 'Sem funcionário';
        if (!employeeAppointments[funcNome]) {
          employeeAppointments[funcNome] = { nome: funcNome, atendimentos: 0, valor: 0 };
        }
        employeeAppointments[funcNome].atendimentos++;
        employeeAppointments[funcNome].valor += apt.valor || 0;
      });

      Object.values(employeeAppointments).forEach((emp) => {
        funcionariosDesempenho.push(emp);
      });
      funcionariosDesempenho.sort((a, b) => b.atendimentos - a.atendimentos);

      // Calcular status dos clientes (baseado na etiqueta)
      const statusClientes = {
        ativo: 0,
        atencao: 0,
        regular: 0,
      };
      (clients ?? []).forEach((client) => {
        if (client.etiqueta === 'green') statusClientes.ativo++;
        else if (client.etiqueta === 'red') statusClientes.atencao++;
        else statusClientes.regular++;
      });

      const dadosStatusClientes = [
        { name: 'Ativo', value: statusClientes.ativo, color: '#22c55e' },
        { name: 'Regular', value: statusClientes.regular, color: '#3b82f6' },
        { name: 'Atenção', value: statusClientes.atencao, color: '#ef4444' },
      ].filter(item => item.value > 0);

      // Calcular total do mês atual
      const hoje = new Date();
      const mesAtualStart = startOfMonth(hoje);
      const mesAtualEnd = endOfMonth(hoje);
      const agendamentosMesAtual = (appointments ?? []).filter((apt) => {
        const aptDate = new Date(apt.data);
        return aptDate >= mesAtualStart && aptDate <= mesAtualEnd;
      });
      const totalMesAtual = agendamentosMesAtual.reduce((acc, apt) => acc + (apt.valor || 0), 0);

      return {
        totalArrecadado,
        totalMesAtual,
        totalAtendimentos: appointments?.length ?? 0,
        totalClientes: clients?.length ?? 0,
        totalFuncionarios: employees?.length ?? 0,
        dadosServicos: dadosServicos.length > 0 ? dadosServicos : [{ tipo: 'Sem dados', quantidade: 0, valorMedio: 0 }],
        dadosStatusClientes: dadosStatusClientes.length > 0 ? dadosStatusClientes : [],
        topClientes: topClientes.length > 0 ? topClientes : [],
        evolucaoMensal,
        funcionariosDesempenho: funcionariosDesempenho.slice(0, 5),
      };
    },
  });
}
