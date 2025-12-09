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
import { useToast } from "@/hooks/use-toast";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { useCreateScheduleBlock } from "@/hooks/useScheduleBlocks";

const blockSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(200, "Descrição muito longa"),
  data_inicio: z.string().min(1, "Data início é obrigatória"),
  data_fim: z.string().min(1, "Data fim é obrigatória"),
  tipo: z.enum(["geral", "funcionario"]),
  funcionario_id: z.number().optional(),
});

type BlockFormData = z.infer<typeof blockSchema>;

interface ScheduleBlockFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleBlockFormModal({ open, onOpenChange }: ScheduleBlockFormModalProps) {
  const { toast } = useToast();
  const { data: funcionarios = [] } = useFuncionarios();
  const createBlock = useCreateScheduleBlock();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlockFormData>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      descricao: "",
      data_inicio: "",
      data_fim: "",
      tipo: "geral",
    },
  });

  const tipoValue = watch("tipo");

  const onSubmit = async (data: BlockFormData) => {
    try {
      await createBlock.mutateAsync({
        descricao: data.descricao,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        tipo: data.tipo,
        funcionario_id: data.tipo === "funcionario" ? data.funcionario_id : undefined,
      });
      toast({ title: "Bloqueio criado com sucesso!" });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao criar bloqueio",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Bloqueio de Agenda</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register("descricao")} placeholder="Ex: Feriado Nacional" />
            {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input id="data_inicio" type="date" {...register("data_inicio")} />
              {errors.data_inicio && <p className="text-sm text-destructive">{errors.data_inicio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input id="data_fim" type="date" {...register("data_fim")} />
              {errors.data_fim && <p className="text-sm text-destructive">{errors.data_fim.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Bloqueio</Label>
            <Select value={tipoValue} onValueChange={(v) => setValue("tipo", v as "geral" | "funcionario")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral (Feriado)</SelectItem>
                <SelectItem value="funcionario">Funcionário Específico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoValue === "funcionario" && (
            <div className="space-y-2">
              <Label>Funcionário</Label>
              <Select onValueChange={(v) => setValue("funcionario_id", parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarios.map((func) => (
                    <SelectItem key={func.id} value={func.id.toString()}>
                      {func.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBlock.isPending}>
              {createBlock.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
