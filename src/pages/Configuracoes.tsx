import { useState } from "react";
import { Clock, Calendar, Package, Shield, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tiposServico = [
  { id: 1, nome: "Visita Técnica", valorPadrao: 250 },
  { id: 2, nome: "Treinamento", valorPadrao: 450 },
  { id: 3, nome: "Suporte Remoto", valorPadrao: 150 },
  { id: 4, nome: "Instalação", valorPadrao: 600 },
  { id: 5, nome: "Consultoria", valorPadrao: 800 },
];

const produtos = [
  { id: 1, nome: "ERP Completo", ativo: true },
  { id: 2, nome: "PDV", ativo: true },
  { id: 3, nome: "NFe", ativo: true },
  { id: 4, nome: "Financeiro", ativo: true },
  { id: 5, nome: "Estoque", ativo: false },
];

const bloqueios = [
  { id: 1, descricao: "Natal", dataInicio: "2024-12-25", dataFim: "2024-12-25", tipo: "geral" },
  { id: 2, descricao: "Férias - Carlos", dataInicio: "2024-12-20", dataFim: "2025-01-05", tipo: "funcionario" },
  { id: 3, descricao: "Ano Novo", dataInicio: "2025-01-01", dataFim: "2025-01-01", tipo: "geral" },
];

export default function Configuracoes() {
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("18:00");
  const [almocaoInicio, setAlmocaoInicio] = useState("12:00");
  const [almocaoFim, setAlmocaoFim] = useState("13:00");

  const diasSemana = [
    { nome: "Segunda", ativo: true },
    { nome: "Terça", ativo: true },
    { nome: "Quarta", ativo: true },
    { nome: "Quinta", ativo: true },
    { nome: "Sexta", ativo: true },
    { nome: "Sábado", ativo: false },
    { nome: "Domingo", ativo: false },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Configurações"
        description="Configure o sistema de gestão"
      />

      <Tabs defaultValue="agenda" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="agenda" className="gap-2">
            <Clock className="h-4 w-4" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="bloqueios" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bloqueios
          </TabsTrigger>
          <TabsTrigger value="cadastros" className="gap-2">
            <Package className="h-4 w-4" />
            Cadastros
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Shield className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Agenda Tab */}
        <TabsContent value="agenda">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início do Expediente</Label>
                    <Input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim do Expediente</Label>
                    <Input
                      type="time"
                      value={horaFim}
                      onChange={(e) => setHoraFim(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início do Almoço</Label>
                    <Input
                      type="time"
                      value={almocaoInicio}
                      onChange={(e) => setAlmocaoInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim do Almoço</Label>
                    <Input
                      type="time"
                      value={almocaoFim}
                      onChange={(e) => setAlmocaoFim(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Dias de Funcionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diasSemana.map((dia) => (
                    <div key={dia.nome} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{dia.nome}</span>
                      <Switch defaultChecked={dia.ativo} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bloqueios Tab */}
        <TabsContent value="bloqueios">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bloqueios de Agenda</CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Bloqueio
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Descrição</TableHead>
                    <TableHead className="font-semibold">Data Início</TableHead>
                    <TableHead className="font-semibold">Data Fim</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bloqueios.map((bloqueio) => (
                    <TableRow key={bloqueio.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{bloqueio.descricao}</TableCell>
                      <TableCell>{new Date(bloqueio.dataInicio).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Date(bloqueio.dataFim).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            bloqueio.tipo === "geral"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-info/10 text-info"
                          }`}
                        >
                          {bloqueio.tipo === "geral" ? "Geral" : "Funcionário"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cadastros Tab */}
        <TabsContent value="cadastros">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tipos de Serviço</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tiposServico.map((servico) => (
                    <div
                      key={servico.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <span className="font-medium text-foreground">{servico.nome}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          R$ {servico.valorPadrao.toLocaleString("pt-BR")}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos do Sistema</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {produtos.map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <span className="font-medium text-foreground">{produto.nome}</span>
                      <div className="flex items-center gap-4">
                        <Switch defaultChecked={produto.ativo} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sistema Tab */}
        <TabsContent value="sistema">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Área Administrativa</h3>
                <p className="mt-2 text-muted-foreground">
                  Os logs de auditoria e gerenciamento de usuários estarão disponíveis após a integração com o backend.
                </p>
                <Button className="mt-4">Configurar Backend</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
