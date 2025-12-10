import { useEffect, useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useClientes } from "@/hooks/useClientes";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { checkScheduleConflict } from "@/hooks/useScheduleBlocks";
import {
  useCreateAgendamento,
  useUpdateAgendamento,
  Agendamento,
  NovoAgendamento,
} from "@/hooks/useAgendamentos";

const agendamentoSchema = z.object({
  cliente_nome: z.string().min(1, "Cliente é obrigatório"),
  funcionario_nome: z.string().min(1, "Funcionário é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  hora: z.string().min(1, "Hora é obrigatória"),
  tipo: z.string().min(1, "Tipo de serviço é obrigatório"),
  urgencia: z.string().optional(),
  endereco: z.string().optional(),
  modalidade: z.string().optional(),
  valor: z.number().optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface AgendamentoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento?: Agendamento | null;
  defaultDate?: string;
}

export function AgendamentoFormModal({ 
  open, 
  onOpenChange, 
  agendamento,
  defaultDate 
}: AgendamentoFormModalProps) {
  const { toast } = useToast();
  const { data: clientes = [] } = useClientes();
  const { data: funcionarios = [] } = useFuncionarios();
  const { data: serviceTypes = [] } = useServiceTypes();
  const createAgendamento = useCreateAgendamento();
  const updateAgendamento = useUpdateAgendamento();

  const [clienteOpen, setClienteOpen] = useState(false);
  const [funcionarioOpen, setFuncionarioOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      cliente_nome: "",
      funcionario_nome: "",
      data: defaultDate || new Date().toISOString().split("T")[0],
      hora: "09:00",
      tipo: "",
      urgencia: "tranquilo",
      endereco: "",
      modalidade: "Presencial",
      valor: 0,
    },
  });

  useEffect(() => {
    if (agendamento) {
      reset({
        cliente_nome: agendamento.cliente_nome || "",
        funcionario_nome: agendamento.funcionario_nome || "",
        data: agendamento.data,
        hora: agendamento.hora,
        tipo: agendamento.tipo,
        urgencia: agendamento.urgencia || "tranquilo",
        endereco: agendamento.endereco || "",
        modalidade: agendamento.modalidade || "Presencial",
        valor: agendamento.valor || 0,
      });
    } else {
      reset({
        cliente_nome: "",
        funcionario_nome: "",
        data: defaultDate || new Date().toISOString().split("T")[0],
        hora: "09:00",
        tipo: "",
        urgencia: "tranquilo",
        endereco: "",
        modalidade: "Presencial",
        valor: 0,
      });
    }
  }, [agendamento, defaultDate, reset]);

  const onSubmit = async (data: AgendamentoFormData) => {
    // Validar bloqueios de agenda antes de salvar
    const conflict = await checkScheduleConflict(
      data.data,
      data.hora,
      data.funcionario_nome
    );

    if (conflict.blocked) {
      toast({
        title: "Horário indisponível",
        description: conflict.reason,
        variant: "destructive",
      });
      return;
    }

    const agendamentoData: NovoAgendamento = {
      cliente_nome: data.cliente_nome,
      funcionario_nome: data.funcionario_nome,
      data: data.data,
      hora: data.hora,
      tipo: data.tipo,
      urgencia: data.urgencia,
      endereco: data.endereco,
      modalidade: data.modalidade,
      valor: data.valor || 0,
    };

    try {
      if (agendamento) {
        await updateAgendamento.mutateAsync({ id: agendamento.id, ...agendamentoData });
        toast({ title: "Agendamento atualizado com sucesso!" });
      } else {
        await createAgendamento.mutateAsync(agendamentoData);
        toast({ title: "Agendamento criado com sucesso!" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar agendamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const isLoading = createAgendamento.isPending || updateAgendamento.isPending;

  // Filtrar funcionários aptos para o serviço selecionado
  const tipoSelecionado = watch("tipo");
  const funcionariosAptos = tipoSelecionado
    ? funcionarios.filter(f => f.servicos?.includes(tipoSelecionado) && f.status !== "ferias")
    : funcionarios.filter(f => f.status !== "ferias");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cliente - Autocomplete */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  {watch("cliente_nome") || "Buscar cliente..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por nome ou documento..." />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {clientes.map((cliente) => (
                        <CommandItem
                          key={cliente.id}
                          value={`${cliente.nome} ${cliente.documento}`}
                          onSelect={() => {
                            setValue("cliente_nome", cliente.nome);
                            setClienteOpen(false);
                          }}
                        >
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-xs text-muted-foreground">{cliente.documento}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.cliente_nome && <p className="text-sm text-destructive">{errors.cliente_nome.message}</p>}
          </div>

          {/* Tipo de Serviço */}
          <div className="space-y-2">
            <Label>Tipo de Serviço</Label>
            <Select value={watch("tipo")} onValueChange={(v) => setValue("tipo", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.filter(s => s.ativo).map((service) => (
                  <SelectItem key={service.id} value={service.nome}>
                    {service.nome} - R$ {service.valor_padrao?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
          </div>

          {/* Funcionário */}
          <div className="space-y-2">
            <Label>Funcionário</Label>
            <Popover open={funcionarioOpen} onOpenChange={setFuncionarioOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  {watch("funcionario_nome") || "Selecionar funcionário..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar funcionário..." />
                  <CommandList>
                    <CommandEmpty>Nenhum funcionário disponível.</CommandEmpty>
                    <CommandGroup>
                      {funcionariosAptos.map((func) => (
                        <CommandItem
                          key={func.id}
                          value={func.nome}
                          onSelect={() => {
                            setValue("funcionario_nome", func.nome);
                            setFuncionarioOpen(false);
                          }}
                        >
                          <div>
                            <p className="font-medium">{func.nome}</p>
                            <p className="text-xs text-muted-foreground">{func.funcao}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.funcionario_nome && <p className="text-sm text-destructive">{errors.funcionario_nome.message}</p>}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" {...register("data")} />
              {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" {...register("hora")} />
              {errors.hora && <p className="text-sm text-destructive">{errors.hora.message}</p>}
            </div>
          </div>

          {/* Modalidade */}
          <div className="space-y-2">
            <Label>Modalidade</Label>
            <Select value={watch("modalidade")} onValueChange={(v) => setValue("modalidade", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" {...register("endereco")} placeholder="Endereço do atendimento" />
          </div>

          {/* Urgência */}
          <div className="space-y-2">
            <Label>Urgência</Label>
            <Select value={watch("urgencia")} onValueChange={(v) => setValue("urgencia", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tranquilo">🟢 Tranquilo</SelectItem>
                <SelectItem value="moderado">🟡 Moderado</SelectItem>
                <SelectItem value="urgente">🔴 Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              {...register("valor", { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {agendamento ? "Salvar" : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
