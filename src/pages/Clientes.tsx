import { useState, useMemo } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientes } from "@/hooks/useClientes";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState<string>("all");
  
  const { data: clientes = [], isLoading, error } = useClientes();

  // Memoizar a filtragem para evitar re-renderizações desnecessárias
  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documento.includes(searchTerm);
      const matchesFilter = filterLabel === "all" || cliente.etiqueta === filterLabel;
      return matchesSearch && matchesFilter;
    });
  }, [clientes, searchTerm, filterLabel]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clientes"
        description="Gerencie a base de clientes da UPCIGA"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterLabel} onValueChange={setFilterLabel}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar etiqueta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="green">Verde (Ativo)</SelectItem>
            <SelectItem value="blue">Azul (Regular)</SelectItem>
            <SelectItem value="red">Vermelho (Atenção)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar clientes</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao buscar os clientes.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando clientes...</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Documento</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Produtos</TableHead>
                <TableHead className="font-semibold">Etiqueta</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm || filterLabel !== "all" 
                      ? "Nenhum cliente encontrado com os filtros aplicados." 
                      : "Nenhum cliente cadastrado."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-bold text-primary">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{cliente.nome}</p>
                          <p className="text-xs text-muted-foreground">{cliente.tipo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cliente.documento}</TableCell>
                    <TableCell className="text-muted-foreground">{cliente.telefone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cliente.produtos.length > 0 ? (
                          cliente.produtos.map((produto) => (
                            <StatusBadge key={produto} variant="info">
                              {produto}
                            </StatusBadge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Nenhum produto</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={
                          cliente.etiqueta === "green"
                            ? "labelGreen"
                            : cliente.etiqueta === "blue"
                            ? "labelBlue"
                            : "labelRed"
                        }
                      >
                        {cliente.etiqueta === "green" ? "Ativo" : cliente.etiqueta === "blue" ? "Regular" : "Atenção"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
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
                          <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
