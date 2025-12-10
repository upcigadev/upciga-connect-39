import { useState } from "react";
import { Clock, Calendar, Package, Shield, Plus, Trash2, Loader2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { useServiceTypes, useDeleteServiceType } from "@/hooks/useServiceTypes";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useScheduleBlocks, useDeleteScheduleBlock } from "@/hooks/useScheduleBlocks";
import { useProfiles, useUpdateProfileRole } from "@/hooks/useProfiles";
import { ServiceTypeFormModal } from "@/components/configuracoes/ServiceTypeFormModal";
import { ProductFormModal } from "@/components/configuracoes/ProductFormModal";
import { ScheduleBlockFormModal } from "@/components/configuracoes/ScheduleBlockFormModal";
import { UserFormModal } from "@/components/configuracoes/UserFormModal";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/contexts/AuthContext";

export default function Configuracoes() {
  const { toast } = useToast();
  const { data: settings = {}, isLoading: settingsLoading } = useSettings();
  const { data: serviceTypes = [], isLoading: servicesLoading } = useServiceTypes();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: blocks = [], isLoading: blocksLoading } = useScheduleBlocks();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  
  const updateSetting = useUpdateSetting();
  const deleteServiceType = useDeleteServiceType();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const deleteBlock = useDeleteScheduleBlock();
  const updateProfileRole = useUpdateProfileRole();

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const handleSettingChange = async (chave: string, valor: string) => {
    try {
      await updateSetting.mutateAsync({ chave, valor });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm("Excluir este tipo de serviço?")) {
      await deleteServiceType.mutateAsync(id);
      toast({ title: "Serviço excluído!" });
    }
  };

  const handleToggleProduct = async (id: number, ativo: boolean) => {
    await updateProduct.mutateAsync({ id, ativo: !ativo });
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Excluir este produto?")) {
      await deleteProduct.mutateAsync(id);
      toast({ title: "Produto excluído!" });
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (confirm("Excluir este bloqueio?")) {
      await deleteBlock.mutateAsync(id);
      toast({ title: "Bloqueio excluído!" });
    }
  };

  const handleUpdateRole = async (id: string, newRole: UserRole) => {
    try {
      await updateProfileRole.mutateAsync({ id, role: newRole });
      toast({
        title: "Role atualizado!",
        description: "O papel do usuário foi alterado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar role",
        description: error.message || "Não foi possível atualizar o papel do usuário.",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "funcionario":
        return "Funcionário";
      case "user":
        return "Usuário";
      default:
        return role;
    }
  };

  if (settingsLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const diasFuncionamento = settings.dias_funcionamento ? JSON.parse(settings.dias_funcionamento) : ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Configurações" description="Configure o sistema de gestão" />

      <Tabs defaultValue="agenda" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="agenda" className="gap-2"><Clock className="h-4 w-4" />Agenda</TabsTrigger>
          <TabsTrigger value="bloqueios" className="gap-2"><Calendar className="h-4 w-4" />Bloqueios</TabsTrigger>
          <TabsTrigger value="cadastros" className="gap-2"><Package className="h-4 w-4" />Cadastros</TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2"><Users className="h-4 w-4" />Usuários</TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2"><Shield className="h-4 w-4" />Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Horário de Funcionamento</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início do Expediente</Label>
                    <Input type="time" value={settings.hora_inicio || "08:00"} onChange={(e) => handleSettingChange("hora_inicio", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim do Expediente</Label>
                    <Input type="time" value={settings.hora_fim || "18:00"} onChange={(e) => handleSettingChange("hora_fim", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início do Almoço</Label>
                    <Input type="time" value={settings.almoco_inicio || "12:00"} onChange={(e) => handleSettingChange("almoco_inicio", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim do Almoço</Label>
                    <Input type="time" value={settings.almoco_fim || "13:00"} onChange={(e) => handleSettingChange("almoco_fim", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader><CardTitle>Dias de Funcionamento</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{dia}</span>
                      <Switch checked={diasFuncionamento.includes(dia)} onCheckedChange={(checked) => {
                        const newDias = checked ? [...diasFuncionamento, dia] : diasFuncionamento.filter((d: string) => d !== dia);
                        handleSettingChange("dias_funcionamento", JSON.stringify(newDias));
                      }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bloqueios">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bloqueios de Agenda</CardTitle>
              <Button className="gap-2" onClick={() => setBlockModalOpen(true)}><Plus className="h-4 w-4" />Novo Bloqueio</Button>
            </CardHeader>
            <CardContent>
              {blocksLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum bloqueio cadastrado.</TableCell></TableRow>
                    ) : blocks.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.descricao}</TableCell>
                        <TableCell>{new Date(b.data_inicio).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{new Date(b.data_fim).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${b.tipo === "geral" ? "bg-destructive/10 text-destructive" : "bg-info/10 text-info"}`}>
                            {b.tipo === "geral" ? "Geral" : "Funcionário"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBlock(b.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cadastros">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tipos de Serviço</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => setServiceModalOpen(true)}><Plus className="h-4 w-4" />Adicionar</Button>
              </CardHeader>
              <CardContent>
                {servicesLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : serviceTypes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum serviço cadastrado.</p>
                ) : (
                  <div className="space-y-3">
                    {serviceTypes.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                        <span className="font-medium text-foreground">{s.nome}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">R$ {s.valor_padrao?.toFixed(2)}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteService(s.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos do Sistema</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => setProductModalOpen(true)}><Plus className="h-4 w-4" />Adicionar</Button>
              </CardHeader>
              <CardContent>
                {productsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum produto cadastrado.</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                        <span className="font-medium text-foreground">{p.nome}</span>
                        <div className="flex items-center gap-4">
                          <Switch checked={p.ativo ?? true} onCheckedChange={() => handleToggleProduct(p.id, p.ativo ?? true)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>
                  Gerencie os usuários e seus papéis no sistema.
                </CardDescription>
              </div>
              <Button className="gap-2" onClick={() => setUserModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Email</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                              {getRoleLabel(profile.role)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={profile.role}
                              onValueChange={(value) => handleUpdateRole(profile.id, value as UserRole)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="funcionario">Funcionário</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Logs de Auditoria</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Área Administrativa</h3>
                <p className="mt-2 text-muted-foreground">Os logs de auditoria estarão disponíveis em uma versão futura.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServiceTypeFormModal open={serviceModalOpen} onOpenChange={setServiceModalOpen} />
      <ProductFormModal open={productModalOpen} onOpenChange={setProductModalOpen} />
      <ScheduleBlockFormModal open={blockModalOpen} onOpenChange={setBlockModalOpen} />
      <UserFormModal open={userModalOpen} onOpenChange={setUserModalOpen} />
    </div>
  );
}
