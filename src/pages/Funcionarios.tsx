import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFuncionarios, useDeleteFuncionario, Funcionario } from "@/hooks/useFuncionarios";
import { FuncionarioFormModal } from "@/components/funcionarios/FuncionarioFormModal";
import { useToast } from "@/hooks/use-toast";

export default function Funcionarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);

  const { data: funcionarios = [], isLoading } = useFuncionarios();
  const deleteFuncionario = useDeleteFuncionario();
  const { toast } = useToast();

  const filteredFuncionarios = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || f.cpf.includes(searchTerm)
  );

  const handleEdit = (func: Funcionario) => {
    setSelectedFuncionario(func);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await deleteFuncionario.mutateAsync(id);
        toast({ title: "Funcionário excluído com sucesso!" });
      } catch {
        toast({ title: "Erro ao excluir funcionário", variant: "destructive" });
      }
    }
  };

  const handleNew = () => {
    setSelectedFuncionario(null);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Funcionários" description="Gerencie a equipe da UPCIGA">
        <Button className="gap-2" onClick={handleNew}>
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </PageHeader>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {filteredFuncionarios.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Nenhum funcionário cadastrado.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFuncionarios.map((funcionario) => (
            <Card key={funcionario.id} className="shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                      <span className="text-lg font-bold text-primary-foreground">
                        {funcionario.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{funcionario.nome}</h3>
                      <p className="text-sm text-muted-foreground">{funcionario.funcao || "Sem função"}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(funcionario)} className="gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" />Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer"><Calendar className="h-4 w-4" />Ver Agenda</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(funcionario.id)} className="gap-2 cursor-pointer text-destructive">
                        <Trash2 className="h-4 w-4" />Excluir
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
                    <StatusBadge variant={funcionario.status === "disponivel" ? "success" : funcionario.status === "ocupado" ? "warning" : "info"}>
                      {funcionario.status === "disponivel" ? "Disponível" : funcionario.status === "ocupado" ? "Ocupado" : "Férias"}
                    </StatusBadge>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Serviços:</p>
                    <div className="flex flex-wrap gap-1">
                      {funcionario.servicos?.length ? funcionario.servicos.map((s) => (
                        <StatusBadge key={s} variant="default">{s}</StatusBadge>
                      )) : <span className="text-xs text-muted-foreground">Nenhum serviço</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FuncionarioFormModal open={modalOpen} onOpenChange={setModalOpen} funcionario={selectedFuncionario} />
    </div>
  );
}
