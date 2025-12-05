import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const mockAgendamentos = [
  { id: 1, dia: 5, cliente: "Tech Solutions", hora: "09:00", tipo: "Visita", urgencia: "tranquilo", funcionario: "Carlos" },
  { id: 2, dia: 5, cliente: "Mercado Central", hora: "14:00", tipo: "Treinamento", urgencia: "moderado", funcionario: "Ana" },
  { id: 3, dia: 12, cliente: "Farmácia Vida", hora: "10:00", tipo: "Suporte", urgencia: "urgente", funcionario: "Pedro" },
  { id: 4, dia: 15, cliente: "Padaria do João", hora: "11:00", tipo: "Instalação", urgencia: "tranquilo", funcionario: "Carlos" },
  { id: 5, dia: 20, cliente: "Loja XYZ", hora: "15:00", tipo: "Visita", urgencia: "moderado", funcionario: "Ana" },
];

const agendamentosHoje = [
  { id: 1, cliente: "Tech Solutions LTDA", hora: "09:00", tipo: "Visita Técnica", funcionario: "Carlos Silva", endereco: "Rua das Flores, 123", modalidade: "Presencial" },
  { id: 2, cliente: "Mercado Central", hora: "14:00", tipo: "Treinamento", funcionario: "Ana Santos", endereco: "Av. Brasil, 456", modalidade: "Online" },
];

export default function Agendamentos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getDayAgendamentos = (day: number) => {
    return mockAgendamentos.filter((a) => a.dia === day);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Agendamentos"
        description="Gerencie visitas técnicas e treinamentos"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  {meses[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days of Week */}
              <div className="grid grid-cols-7 mb-2">
                {diasSemana.map((dia) => (
                  <div
                    key={dia}
                    className="py-2 text-center text-sm font-semibold text-muted-foreground"
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square p-1" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayAgendamentos = getDayAgendamentos(day);
                  const isToday = day === new Date().getDate() && 
                    currentMonth === new Date().getMonth() && 
                    currentYear === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-1 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                        isToday ? "border-primary bg-primary/10" : "border-transparent"
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        <span
                          className={`text-sm font-medium ${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="flex-1 overflow-hidden">
                          {dayAgendamentos.slice(0, 2).map((agendamento) => (
                            <div
                              key={agendamento.id}
                              className={`mt-0.5 truncate rounded px-1 text-xs ${
                                agendamento.urgencia === "urgente"
                                  ? "bg-destructive/20 text-destructive"
                                  : agendamento.urgencia === "moderado"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-success/20 text-success"
                              }`}
                            >
                              {agendamento.hora}
                            </div>
                          ))}
                          {dayAgendamentos.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{dayAgendamentos.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Agenda */}
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Agenda de Hoje</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agendamentosHoje.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{agendamento.cliente}</h4>
                      <StatusBadge variant={agendamento.modalidade === "Online" ? "info" : "accent"}>
                        {agendamento.modalidade}
                      </StatusBadge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{agendamento.hora} - {agendamento.tipo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{agendamento.funcionario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{agendamento.endereco}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
