import { useLocation } from "wouter";

interface NavigationTabsProps {
  activeTab: string;
}

export function NavigationTabs({ activeTab }: NavigationTabsProps) {
  const [, navigate] = useLocation();
  
  // Handle tab switch
  const switchTab = (tab: string) => {
    if (tab === "reports") {
      navigate("/");
    } else if (tab === "settings") {
      navigate("/settings");
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex -mb-px max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Tabs">
        <a 
          href="#" 
          className={`${
            activeTab === "reports" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } py-4 px-1 border-b-2 font-medium text-sm`}
          onClick={(e) => {
            e.preventDefault();
            switchTab("reports");
          }}
        >
          Relatórios
        </a>
        <a 
          href="#"
          className={`${
            activeTab === "settings" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } py-4 px-1 border-b-2 font-medium text-sm ml-8`}
          onClick={(e) => {
            e.preventDefault();
            switchTab("settings");
          }}
        >
          Configurações
        </a>
      </nav>
    </div>
  );
}
