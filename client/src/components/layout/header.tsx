import { useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Home, Bell } from "lucide-react";

export function Header() {
  const [, navigate] = useLocation();
  
  // Handle navigation to profile
  const navigateToProfile = () => {
    navigate("/settings");
  };
  
  // Handle navigation to home
  const navigateToHome = () => {
    navigate("/");
  };
  
  // Handle navigation to reminders
  const navigateToReminders = () => {
    navigate("/lembretes");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary cursor-pointer" onClick={navigateToHome}>
                Relatório de Atividades
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">Abrir menu do usuário</span>
                    <Avatar>
                      <AvatarFallback className="bg-gray-500 text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem onClick={navigateToHome}>
                    <Home className="mr-2 h-4 w-4" />
                    Página inicial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={navigateToReminders}>
                    <Bell className="mr-2 h-4 w-4" />
                    Lembretes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={navigateToProfile}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
