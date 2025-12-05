import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const dadosServicos = [
  { tipo: "Visita", quantidade: 45, valorMedio: 250 },
  { tipo: "Treinamento", quantidade: 32, valorMedio: 450 },
  { tipo: "Suporte", quantidade: 50, valorMedio: 150 },
  { tipo: "Instalação", quantidade: 18, valorMedio: 600 },
  { tipo: "Consultoria", quantidade: 12, valorMedio: 800 },
];

const topClientes = [
  { nome: "Tech Solutions LTDA", chamados: 28, valor: 12500 },
  { nome: "Mercado Central", chamados: 22, valor: 9800 },
  { nome: "Farmácia Vida", chamados: 18, valor: 8200 },
  { nome: "Padaria do João", chamados: 15, valor: 6500 },
  { nome: "Loja XYZ", chamados: 12, valor: 5200 },
];

const evolucaoMensal = [
  { mes: "Jul", valor: 28500 },
  { mes: "Ago", valor: 32000 },
  { mes: "Set", valor: 29800 },
  { mes: "Out", valor: 35200 },
  { mes: "Nov", valor: 38900 },
  { mes: "Dez", valor: 42500 },
];

export default function Relatorios() {
  const totalArrecadado = evolucaoMensal.reduce((acc, curr) => acc + curr.valor, 0);
  const descontosTotal = 3250;
  const acrescimosTotal = 1850;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Relatórios"
        description="Análise de desempenho e métricas financeiras"
      />

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Arrecadado</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalArrecadado.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descontos Dados</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {descontosTotal.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <TrendingUp className="h-6 w-6 text-destructive rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acréscimos</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {acrescimosTotal.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atendimentos</p>
                <p className="text-2xl font-bold text-foreground">157</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Agendamentos por Tipo de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosServicos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="tipo" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Mensal de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Valor"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Clientes por Chamados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientes.map((cliente, index) => (
                <div
                  key={cliente.nome}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">{cliente.chamados} chamados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      R$ {cliente.valor.toLocaleString("pt-BR")}
                    </p>
                    <StatusBadge variant="success">Ativo</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
