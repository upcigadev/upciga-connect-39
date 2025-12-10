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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateUser } from "@/hooks/useProfiles";
import { UserRole } from "@/contexts/AuthContext";

const userSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().optional(),
  role: z.enum(["admin", "user", "funcionario"]),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormModal({ open, onOpenChange }: UserFormModalProps) {
  const { toast } = useToast();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      nome: "",
      role: "user",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        nome: data.nome?.trim() || undefined,
        role: data.role,
      });
      
      // Sempre fechar o modal e resetar o formulário após sucesso
      reset();
      onOpenChange(false);
      
      toast({
        title: "Usuário criado com sucesso!",
        description: `O usuário ${data.email} foi criado e pode fazer login agora.`,
      });
    } catch (error) {
      // Verificar se é erro de rate limiting para mostrar mensagem mais clara
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const isRateLimit = errorMessage.includes("Aguarde") || errorMessage.includes("security purposes");
      
      toast({
        title: isRateLimit ? "Aguarde um momento" : "Erro ao criar usuário",
        description: errorMessage,
        variant: "destructive",
        duration: isRateLimit ? 5000 : 3000, // Rate limit mostra por mais tempo
      });
      
      // Não fechar o modal em caso de erro para o usuário poder tentar novamente
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário no sistema. O usuário receberá as credenciais de acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="usuario@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome (opcional)</Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Nome completo"
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Papel no Sistema *</Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="funcionario">Funcionário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Papel selecionado: <strong>{getRoleLabel(watch("role"))}</strong>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

