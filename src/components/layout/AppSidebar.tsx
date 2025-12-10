import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { name: "Funcionários", href: "/funcionarios", icon: UserCog, adminOnly: true },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, adminOnly: true },
  { name: "Configurações", href: "/configuracoes", icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredNavigation = navigation.filter((item) => {
    // Se o item requer admin, verificar se o usuário é admin
    if (item.adminOnly) {
      // Se ainda está carregando, não mostrar itens admin (evita flash)
      if (loading || !profile) {
        return false;
      }
      // Só mostrar se for admin
      return profile.role === "admin";
    }
    // Itens sem restrição são sempre mostrados
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-4">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">U</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">U</span>
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-sidebar-foreground">UPCIGA</h1>
                <p className="text-xs text-sidebar-foreground/60 font-sans">Sistemas</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" />
                <span>Recolher</span>
              </>
            )}
          </Button>
        </div>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
              <span className="text-sm font-medium text-accent-foreground">
                {profile?.nome ? getInitials(profile.nome) : (user?.email ? getInitials(user.email.split("@")[0]) : "U")}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {profile?.nome || (profile?.role === "admin" ? "Administrador" : profile?.role === "funcionario" ? "Funcionário" : "Usuário")}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user?.email || "Usuário"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
