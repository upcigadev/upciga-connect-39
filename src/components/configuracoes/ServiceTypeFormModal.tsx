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
import { useToast } from "@/hooks/use-toast";
import { useCreateServiceType } from "@/hooks/useServiceTypes";

const serviceTypeSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  valor_padrao: z.number().min(0, "Valor deve ser positivo"),
});

type ServiceTypeFormData = z.infer<typeof serviceTypeSchema>;

interface ServiceTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceTypeFormModal({ open, onOpenChange }: ServiceTypeFormModalProps) {
  const { toast } = useToast();
  const createServiceType = useCreateServiceType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceTypeFormData>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      nome: "",
      valor_padrao: 0,
    },
  });

  const onSubmit = async (data: ServiceTypeFormData) => {
    try {
      await createServiceType.mutateAsync({ nome: data.nome, valor_padrao: data.valor_padrao });
      toast({ title: "Tipo de serviço criado com sucesso!" });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao criar tipo de serviço",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Tipo de Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Serviço</Label>
            <Input id="nome" {...register("nome")} placeholder="Ex: Visita Técnica" />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_padrao">Valor Padrão (R$)</Label>
            <Input
              id="valor_padrao"
              type="number"
              step="0.01"
              {...register("valor_padrao", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.valor_padrao && <p className="text-sm text-destructive">{errors.valor_padrao.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createServiceType.isPending}>
              {createServiceType.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
