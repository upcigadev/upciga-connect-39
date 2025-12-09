import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useCreateCliente, useUpdateCliente, NovoCliente } from "@/hooks/useCreateCliente";
import { Cliente } from "@/hooks/useClientes";

const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  tipo: z.enum(["PF", "PJ"]),
  documento: z.string().min(1, "Documento é obrigatório").max(20, "Documento muito longo"),
  etiqueta: z.enum(["green", "blue", "red"]),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
}

export function ClienteFormModal({ open, onOpenChange, cliente }: ClienteFormModalProps) {
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  
  const [telefones, setTelefones] = useState<string[]>([""]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      tipo: "PJ",
      documento: "",
      etiqueta: "blue",
    },
  });

  const tipoValue = watch("tipo");

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome,
        tipo: cliente.tipo,
        documento: cliente.documento,
        etiqueta: cliente.etiqueta,
      });
      setTelefones(cliente.telefone ? [cliente.telefone] : [""]);
      setSelectedProducts(cliente.produtos || []);
    } else {
      reset({
        nome: "",
        tipo: "PJ",
        documento: "",
        etiqueta: "blue",
      });
      setTelefones([""]);
      setSelectedProducts([]);
    }
  }, [cliente, reset]);

  const addTelefone = () => {
    setTelefones([...telefones, ""]);
  };

  const removeTelefone = (index: number) => {
    setTelefones(telefones.filter((_, i) => i !== index));
  };

  const updateTelefone = (index: number, value: string) => {
    const newTelefones = [...telefones];
    newTelefones[index] = value;
    setTelefones(newTelefones);
  };

  const toggleProduct = (productName: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName]
    );
  };

  const onSubmit = async (data: ClienteFormData) => {
    const clienteData: NovoCliente = {
      nome: data.nome,
      tipo: data.tipo,
      documento: data.documento,
      etiqueta: data.etiqueta,
      telefone: telefones.filter(Boolean).join(", "),
      produtos: selectedProducts,
    };

    try {
      if (cliente) {
        await updateCliente.mutateAsync({ id: cliente.id, ...clienteData });
        toast({ title: "Cliente atualizado com sucesso!" });
      } else {
        await createCliente.mutateAsync(clienteData);
        toast({ title: "Cliente criado com sucesso!" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const isLoading = createCliente.isPending || updateCliente.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Pessoa */}
          <div className="space-y-2">
            <Label>Tipo de Pessoa</Label>
            <Select value={tipoValue} onValueChange={(v) => setValue("tipo", v as "PF" | "PJ")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PJ">Pessoa Jurídica (CNPJ)</SelectItem>
                <SelectItem value="PF">Pessoa Física (CPF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">
              {tipoValue === "PJ" ? "Razão Social / Nome Fantasia" : "Nome Completo"}
            </Label>
            <Input id="nome" {...register("nome")} placeholder={tipoValue === "PJ" ? "Nome da empresa" : "Nome completo"} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          {/* Documento */}
          <div className="space-y-2">
            <Label htmlFor="documento">{tipoValue === "PJ" ? "CNPJ" : "CPF"}</Label>
            <Input
              id="documento"
              {...register("documento")}
              placeholder={tipoValue === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
            />
            {errors.documento && <p className="text-sm text-destructive">{errors.documento.message}</p>}
          </div>

          {/* Telefones */}
          <div className="space-y-2">
            <Label>Telefones</Label>
            {telefones.map((telefone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={telefone}
                  onChange={(e) => updateTelefone(index, e.target.value)}
                  placeholder="(00) 00000-0000"
                />
                {telefones.length > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeTelefone(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTelefone} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Telefone
            </Button>
          </div>

          {/* Etiqueta */}
          <div className="space-y-2">
            <Label>Etiqueta</Label>
            <Select value={watch("etiqueta")} onValueChange={(v) => setValue("etiqueta", v as "green" | "blue" | "red")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">🟢 Verde (Ativo)</SelectItem>
                <SelectItem value="blue">🔵 Azul (Regular)</SelectItem>
                <SelectItem value="red">🔴 Vermelho (Atenção)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Produtos */}
          <div className="space-y-2">
            <Label>Produtos</Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
              {products.filter(p => p.ativo).map((product) => (
                <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedProducts.includes(product.nome)}
                    onCheckedChange={() => toggleProduct(product.nome)}
                  />
                  <span className="text-sm">{product.nome}</span>
                </label>
              ))}
              {products.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">
                  Nenhum produto cadastrado. Cadastre em Configurações.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cliente ? "Salvar" : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
