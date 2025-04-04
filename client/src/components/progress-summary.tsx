import { Activity, UserRole } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateTotalHours } from "@/lib/utils/activity-utils";

interface ProgressSummaryProps {
  activities: Activity[];
  userRole: string;
}

export function ProgressSummary({ activities, userRole }: ProgressSummaryProps) {
  // Role-based goals
  const roleGoals = {
    [UserRole.PUBLICADOR]: 0, // No specific goal
    [UserRole.PIONEIRO_AUXILIAR]: 30,
    [UserRole.PIONEIRO_REGULAR]: 50
  };

  // Get goal for current role
  const goal = roleGoals[userRole as keyof typeof roleGoals] || 0;
  
  // Calculate total hours
  const totalHours = calculateTotalHours(activities);
  
  // Calculate progress percentage
  const progressPercentage = goal ? Math.min((totalHours / goal) * 100, 100) : 0;
  
  // Count total activities
  const totalActivities = activities.length;
  
  // Format progress message
  const formatProgressMessage = () => {
    if (userRole === UserRole.PUBLICADOR) {
      return "Publicador - Sem meta específica de horas.";
    }
    
    const roleLabel = userRole === UserRole.PIONEIRO_AUXILIAR 
      ? "Pioneiro Auxiliar"
      : "Pioneiro Regular";
    
    const remainingHours = Math.max(goal - totalHours, 0);
    
    if (remainingHours === 0) {
      return `${roleLabel} - Meta mensal atingida!`;
    } else {
      return `${roleLabel} - Faltam ${remainingHours} horas para atingir sua meta mensal.`;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Month Summary */}
          <div className="md:col-span-2">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Resumo do mês atual
            </h3>
            <div className="mt-5 flex items-center">
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary">
                        Progresso de horas
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary">
                        {goal ? `${totalHours}h / ${goal}h` : `${totalHours}h`}
                      </span>
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {formatProgressMessage()}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Totais do mês
            </h4>
            <dl className="mt-4 grid grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <dt className="text-sm font-medium text-gray-500">
                  Horas registradas
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalHours}h
                </dd>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <dt className="text-sm font-medium text-gray-500">
                  Atividades
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalActivities}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
