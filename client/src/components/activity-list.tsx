import { Activity, ActivityType } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Home, MessageSquare, Mail, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Activity icons mapping
const ActivityIcons = {
  [ActivityType.CAMPO]: <Home className="text-primary" />,
  [ActivityType.TESTEMUNHO]: <MessageSquare className="text-secondary" />,
  [ActivityType.CARTAS]: <Mail className="text-accent" />,
  [ActivityType.ESTUDO]: <BookOpen className="text-secondary" />
};

// Activity type labels
const ActivityLabels = {
  [ActivityType.CAMPO]: "Campo",
  [ActivityType.TESTEMUNHO]: "Testemunho informal",
  [ActivityType.CARTAS]: "Cartas",
  [ActivityType.ESTUDO]: "Estudo"
};

// Activity background colors
const ActivityBackgrounds = {
  [ActivityType.CAMPO]: "bg-primary/10",
  [ActivityType.TESTEMUNHO]: "bg-secondary/10",
  [ActivityType.CARTAS]: "bg-accent/10",
  [ActivityType.ESTUDO]: "bg-secondary/10"
};

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  // Sort activities by date (most recent first)
  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades recentes</CardTitle>
        <CardDescription>Seus últimos registros de atividades</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma atividade registrada. Use o botão "Registrar atividade" para adicionar.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sortedActivities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${ActivityBackgrounds[activity.type as ActivityTypeType]} flex items-center justify-center`}>
                      {ActivityIcons[activity.type as ActivityTypeType]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ActivityLabels[activity.type as ActivityTypeType]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(activity.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {Number(activity.hours) === 1 
                      ? "1 hora" 
                      : `${activity.hours} horas`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
