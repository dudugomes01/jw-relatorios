import { useLocation } from "wouter";
import { useState, useEffect } from 'react'; // Added for state management

interface NavigationTabsProps {
  activeTab: string;
}

export function NavigationTabs({ activeTab }: NavigationTabsProps) {
  const [, navigate] = useLocation();

  // Handle tab switch
  const switchTab = (tab: string) => {
    navigate(`/${tab}`); // Simplified navigation
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


// New components for reports and goal saving (placeholder implementations)
function ReportsPage() {
  // Fetch and display historical monthly summaries here.  This requires backend integration.
  const [reportsData, setReportsData] = useState<any[]>([]);

  useEffect(() => {
    // Replace with actual API call to fetch reports
    const fetchData = async () => {
      const response = await fetch('/api/reports'); //Example API call
      const data = await response.json();
      setReportsData(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Monthly Reports</h1>
      {reportsData.map((report, index) => (
        <div key={index}>
          <h2>{report.month}</h2>
          {/* Display report details here */}
        </div>
      ))}
    </div>
  );
}

function ProgressSummary() {
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if(monthlyGoal){
        try {
            const response = await fetch('/api/goals', { //Example API call
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({goal: monthlyGoal})
            });
            if(response.ok){
                setSaved(true);
            } else {
                console.error("Failed to save goal");
            }
        } catch (error) {
            console.error("Error saving goal", error);
        }

    }
  };

  return (
    <div>
        <input type="text" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} placeholder="Enter your monthly goal" />
        <button onClick={handleSave} disabled={saved}>Save Goal</button>
        {saved && <p>Goal saved!</p>}
    </div>
  );
}

export {ReportsPage, ProgressSummary};