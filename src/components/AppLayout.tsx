import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Car, LayoutDashboard, LogOut, ScrollText, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  {
    to: "/dashboard",
    label: "儀表板",
    icon: LayoutDashboard,
    role: undefined,
  },
  {
    to: "/vehicles",
    label: "車輛管理",
    icon: Car,
    role: undefined,
  },
  {
    to: "/employees",
    label: "員工管理",
    icon: Users,
    role: "admin" as const,
  },
  {
    to: "/audit-logs",
    label: "操作紀錄",
    icon: ScrollText,
    role: "admin" as const,
  },
];

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // 即便 API 失敗也要清除本地登入狀態
    }
    logout();
    toast.success("已登出");
    navigate("/login", { replace: true });
  };

  const initials = (user?.name ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-60 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6 text-lg font-bold">
          <Car className="h-5 w-5" />
          車輛管理系統
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems
            .filter(
              (item) => !item.role || (user && user.role === item.role)
            )
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-8">
          <div className="md:hidden">
            <span className="font-semibold">車輛管理系統</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user?.role === "admin" ? "管理者" : "一般使用者"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> 登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
