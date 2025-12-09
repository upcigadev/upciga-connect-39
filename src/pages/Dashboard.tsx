import { Calendar, Users, UserCheck, ClipboardList, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats, useRecentClients } from "@/hooks/useDashboardStats";
import { useAgendamentosHoje } from "@/hooks/useAgendamentos";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentClients = [], isLoading: clientsLoading } = useRecentClients();
  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useAgendamentosHoje();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de gestão comercial"
      />

      {/* Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Atendimentos Realizados"
          value={stats?.totalAgendamentos || 0}
          icon={ClipboardList}
          details={stats?.agendamentosPorTipo || []}
        />
        <MetricCard
          title="Total de Clientes"
          value={stats?.totalClientes || 0}
          icon={Users}
        />
        <MetricCard
          title="Clientes Ativos"
          value={stats?.clientesAtivos || 0}
          icon={UserCheck}
        />
        <MetricCard
          title="Agendamentos Hoje"
          value={stats?.agendamentosHoje || 0}
          icon={Calendar}
        />
      </div>

      {/* Content Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Agenda de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : todayAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum agendamento para hoje.</p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-sm font-bold text-primary">{appointment.hora}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{appointment.cliente_nome}</p>
                        <p className="text-sm text-muted-foreground">{appointment.funcionario_nome}</p>
                      </div>
                    </div>
                    <StatusBadge variant="default">{appointment.tipo}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Clientes Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                        <span className="text-sm font-bold text-primary-foreground">
                          {client.nome.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.nome}</p>
                        <p className="text-sm text-muted-foreground">{(client.produtos as string[])?.length || 0} produtos</p>
                      </div>
                    </div>
                    <StatusBadge
                      variant={
                        client.etiqueta === "green"
                          ? "labelGreen"
                          : client.etiqueta === "blue"
                          ? "labelBlue"
                          : "labelRed"
                      }
                    >
                      {client.etiqueta === "green" ? "Ativo" : client.etiqueta === "blue" ? "Regular" : "Atenção"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
