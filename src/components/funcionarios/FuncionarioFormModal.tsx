import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { useServiceTypes } from "@/hooks/useServiceTypes";
import {
  useCreateFuncionario,
  useUpdateFuncionario,
  Funcionario,
  NovoFuncionario,
} from "@/hooks/useFuncionarios";
import { useState } from "react";

const funcionarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  funcao: z.string().optional(),
  status: z.string().optional(),
});

type FuncionarioFormData = z.infer<typeof funcionarioSchema>;

interface FuncionarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario?: Funcionario | null;
}

export function FuncionarioFormModal({ open, onOpenChange, funcionario }: FuncionarioFormModalProps) {
  const { toast } = useToast();
  const { data: serviceTypes = [] } = useServiceTypes();
  const createFuncionario = useCreateFuncionario();
  const updateFuncionario = useUpdateFuncionario();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FuncionarioFormData>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      funcao: "",
      status: "disponivel",
    },
  });

  useEffect(() => {
    if (funcionario) {
      reset({
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        funcao: funcionario.funcao || "",
        status: funcionario.status || "disponivel",
      });
      setSelectedServices(funcionario.servicos || []);
    } else {
      reset({
        nome: "",
        cpf: "",
        funcao: "",
        status: "disponivel",
      });
      setSelectedServices([]);
    }
  }, [funcionario, reset]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const onSubmit = async (data: FuncionarioFormData) => {
    const funcionarioData: NovoFuncionario = {
      nome: data.nome,
      cpf: data.cpf,
      funcao: data.funcao,
      status: data.status,
      servicos: selectedServices,
    };

    try {
      if (funcionario) {
        await updateFuncionario.mutateAsync({ id: funcionario.id, ...funcionarioData });
        toast({ title: "Funcionário atualizado com sucesso!" });
      } else {
        await createFuncionario.mutateAsync(funcionarioData);
        toast({ title: "Funcionário criado com sucesso!" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar funcionário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const isLoading = createFuncionario.isPending || updateFuncionario.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {funcionario ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" {...register("nome")} placeholder="Nome do funcionário" />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00" />
            {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcao">Função</Label>
            <Input id="funcao" {...register("funcao")} placeholder="Ex: Técnico, Treinador" />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="ferias">Férias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Serviços que pode realizar</Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
              {serviceTypes.filter(s => s.ativo).map((service) => (
                <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedServices.includes(service.nome)}
                    onCheckedChange={() => toggleService(service.nome)}
                  />
                  <span className="text-sm">{service.nome}</span>
                </label>
              ))}
              {serviceTypes.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">
                  Nenhum serviço cadastrado. Cadastre em Configurações.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {funcionario ? "Salvar" : "Criar Funcionário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
