import { Calendar, Users, UserCheck, ClipboardList } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const todayAppointments = [
  { id: 1, client: "Tech Solutions LTDA", time: "09:00", type: "Visita Técnica", employee: "Carlos Silva" },
  { id: 2, client: "Mercado Central", time: "11:30", type: "Treinamento", employee: "Ana Santos" },
  { id: 3, client: "Padaria do João", time: "14:00", type: "Suporte", employee: "Carlos Silva" },
  { id: 4, client: "Farmácia Vida", time: "16:00", type: "Instalação", employee: "Pedro Costa" },
];

const recentClients = [
  { id: 1, name: "Tech Solutions LTDA", label: "green", products: 3 },
  { id: 2, name: "Mercado Central", label: "blue", products: 2 },
  { id: 3, name: "Padaria do João", label: "red", products: 1 },
  { id: 4, name: "Farmácia Vida", label: "green", products: 4 },
];

export default function Dashboard() {
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
          value={127}
          icon={ClipboardList}
          trend={{ value: 12, positive: true }}
          details={[
            { label: "Visitas", value: 45 },
            { label: "Treinamentos", value: 32 },
            { label: "Suporte", value: 50 },
          ]}
        />
        <MetricCard
          title="Total de Clientes"
          value={284}
          icon={Users}
          trend={{ value: 8, positive: true }}
        />
        <MetricCard
          title="Clientes Ativos"
          value={156}
          icon={UserCheck}
          trend={{ value: 5, positive: true }}
        />
        <MetricCard
          title="Agendamentos do Mês"
          value={48}
          icon={Calendar}
          trend={{ value: 3, positive: false }}
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
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-sm font-bold text-primary">{appointment.time}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">{appointment.employee}</p>
                    </div>
                  </div>
                  <StatusBadge variant="default">{appointment.type}</StatusBadge>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <span className="text-sm font-bold text-primary-foreground">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.products} produtos</p>
                    </div>
                  </div>
                  <StatusBadge
                    variant={
                      client.label === "green"
                        ? "labelGreen"
                        : client.label === "blue"
                        ? "labelBlue"
                        : "labelRed"
                    }
                  >
                    {client.label === "green" ? "Ativo" : client.label === "blue" ? "Regular" : "Atenção"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
