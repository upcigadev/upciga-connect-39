import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockFuncionarios = [
  { 
    id: 1, 
    nome: "Carlos Silva", 
    cpf: "123.456.789-00", 
    funcao: "Técnico", 
    servicos: ["Visita Técnica", "Instalação", "Suporte"],
    agendamentosHoje: 3,
    status: "disponivel"
  },
  { 
    id: 2, 
    nome: "Ana Santos", 
    cpf: "234.567.890-11", 
    funcao: "Treinadora", 
    servicos: ["Treinamento", "Consultoria"],
    agendamentosHoje: 2,
    status: "ocupado"
  },
  { 
    id: 3, 
    nome: "Pedro Costa", 
    cpf: "345.678.901-22", 
    funcao: "Técnico", 
    servicos: ["Visita Técnica", "Suporte"],
    agendamentosHoje: 1,
    status: "disponivel"
  },
  { 
    id: 4, 
    nome: "Maria Oliveira", 
    cpf: "456.789.012-33", 
    funcao: "Administrativa", 
    servicos: ["Consultoria"],
    agendamentosHoje: 0,
    status: "ferias"
  },
];

export default function Funcionarios() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFuncionarios = mockFuncionarios.filter((funcionario) =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.cpf.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Funcionários"
        description="Gerencie a equipe da UPCIGA"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFuncionarios.map((funcionario) => (
          <Card key={funcionario.id} className="shadow-card hover:shadow-elevated transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                    <span className="text-lg font-bold text-primary-foreground">
                      {funcionario.nome.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{funcionario.nome}</h3>
                    <p className="text-sm text-muted-foreground">{funcionario.funcao}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Calendar className="h-4 w-4" />
                      Ver Agenda
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CPF</span>
                  <span className="text-sm font-medium text-foreground">{funcionario.cpf}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge
                    variant={
                      funcionario.status === "disponivel"
                        ? "success"
                        : funcionario.status === "ocupado"
                        ? "warning"
                        : "info"
                    }
                  >
                    {funcionario.status === "disponivel"
                      ? "Disponível"
                      : funcionario.status === "ocupado"
                      ? "Ocupado"
                      : "Férias"}
                  </StatusBadge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hoje</span>
                  <span className="text-sm font-medium text-foreground">
                    {funcionario.agendamentosHoje} agendamentos
                  </span>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Serviços:</p>
                  <div className="flex flex-wrap gap-1">
                    {funcionario.servicos.map((servico) => (
                      <StatusBadge key={servico} variant="default">
                        {servico}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
