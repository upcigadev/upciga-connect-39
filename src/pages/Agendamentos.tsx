import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgendamentosByMonth, useAgendamentosHoje } from "@/hooks/useAgendamentos";
import { AgendamentoFormModal } from "@/components/agendamentos/AgendamentoFormModal";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function Agendamentos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const { data: agendamentos = [], isLoading } = useAgendamentosByMonth(currentYear, currentMonth);
  const { data: agendamentosHoje = [] } = useAgendamentosHoje();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const getDayAgendamentos = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return agendamentos.filter((a) => a.data === dateStr);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Agendamentos" description="Gerencie visitas técnicas e treinamentos">
        <Button className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">{meses[currentMonth]} {currentYear}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-7 mb-2">
                    {diasSemana.map((dia) => (
                      <div key={dia} className="py-2 text-center text-sm font-semibold text-muted-foreground">{dia}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="aspect-square p-1" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dayAgendamentos = getDayAgendamentos(day);
                      const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                      return (
                        <div key={day} className={`aspect-square p-1 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${isToday ? "border-primary bg-primary/10" : "border-transparent"}`}>
                          <div className="h-full flex flex-col">
                            <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
                            <div className="flex-1 overflow-hidden">
                              {dayAgendamentos.slice(0, 2).map((a) => (
                                <div key={a.id} className={`mt-0.5 truncate rounded px-1 text-xs ${a.urgencia === "urgente" ? "bg-destructive/20 text-destructive" : a.urgencia === "moderado" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                                  {a.hora}
                                </div>
                              ))}
                              {dayAgendamentos.length > 2 && <span className="text-xs text-muted-foreground">+{dayAgendamentos.length - 2}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Agenda de Hoje</CardTitle>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </CardHeader>
            <CardContent>
              {agendamentosHoje.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum agendamento para hoje.</p>
              ) : (
                <div className="space-y-4">
                  {agendamentosHoje.map((a) => (
                    <div key={a.id} className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{a.cliente_nome}</h4>
                        <StatusBadge variant={a.modalidade === "Online" ? "info" : "accent"}>{a.modalidade}</StatusBadge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{a.hora} - {a.tipo}</span></div>
                        <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{a.funcionario_nome}</span></div>
                        {a.endereco && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="truncate">{a.endereco}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AgendamentoFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
