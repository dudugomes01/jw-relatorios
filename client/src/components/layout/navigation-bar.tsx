import { Link, useLocation } from "wouter";
import { CalendarDays, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="bg-white border-b border-gray-200 py-2 mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4">
          <Link
            href="/"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium flex items-center",
              isActive("/")
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Atividades
          </Link>

          <Link
            href="/reports"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium flex items-center",
              isActive("/reports")
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Relatórios
          </Link>

          <Link
            href="/lembretes"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium flex items-center",
              isActive("/lembretes")
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Bell className="mr-2 h-4 w-4" />
            Lembretes
          </Link>

          <Link
            href="/settings"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium flex items-center",
              isActive("/settings")
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </nav>
      </div>
    </div>
  );
}