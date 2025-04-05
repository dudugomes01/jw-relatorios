import { useState, useCallback } from "react";
import { Activity, ActivityType } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  addMonths,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Activity type colors
const ActivityColors = {
  [ActivityType.CAMPO]: "bg-primary/10 text-primary-dark",
  [ActivityType.TESTEMUNHO]: "bg-secondary/10 text-secondary-dark",
  [ActivityType.CARTAS]: "bg-accent/10 text-accent-dark",
  [ActivityType.ESTUDO]: "bg-secondary/10 text-secondary-dark"
};

// Activity type labels
const ActivityLabels = {
  [ActivityType.CAMPO]: "Campo",
  [ActivityType.TESTEMUNHO]: "Testemunho",
  [ActivityType.CARTAS]: "Cartas",
  [ActivityType.ESTUDO]: "Estudo"
};

interface ActivityCalendarProps {
  activities: Activity[];
  date: Date;
  onDateChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

// Modal Component
function DayActivitiesDialog({ isOpen, onClose, activities, date, onActivityDeleted, onActivityEdit }: any) {
  if (!isOpen) return null;

  const handleDelete = async (activityId: number) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onActivityDeleted(activityId);
      }
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Atividades em {format(date, 'dd/MM/yyyy', { locale: ptBR })}</h2>
        <ul className="space-y-4">
          {activities.map((activity:any) => (
            <li key={activity.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{ActivityLabels[activity.type]}</h3>
                  <p className="text-gray-600">{activity.hours}h</p>
                  {activity.notes && <p className="text-gray-500 mt-1">{activity.notes}</p>}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onActivityEdit(activity)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(activity.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}


export function ActivityCalendar({ 
  activities,
  date,
  onDateChange,
  onDayClick
}: ActivityCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  // Create calendar for month
  const month = startOfMonth(date);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: month, end: monthEnd });

  // Go to previous month
  const previousMonth = useCallback(() => {
    onDateChange(subMonths(date, 1));
  }, [date, onDateChange]);

  // Go to next month
  const nextMonth = useCallback(() => {
    onDateChange(addMonths(date, 1));
  }, [date, onDateChange]);

  // Week days
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Get day activities by date string
  const getDayActivities = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return format(activityDate, "yyyy-MM-dd") === dayStr;
    });
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const handleActivityEdit = (activity: Activity) => {
    setActivityToEdit(activity);
    if (onDayClick) {
      onDayClick(new Date(activity.date));
    }
    setSelectedDay(null);
  };

  const handleActivityDeleted = async (activityId: number) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
        queryClient.invalidateQueries({ queryKey: ["/api/activities/month"] });
        setSelectedDay(null);
      }
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Calendário de atividades</CardTitle>
          <CardDescription>Visualize suas atividades do mês</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Mês anterior</span>
          </Button>
          <span className="text-sm font-medium py-1 px-2">
            {format(date, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próximo mês</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs leading-6 text-gray-700 -mx-px -mt-px">
          {weekDays.map((day) => (
            <div key={day} className="bg-white py-2 font-semibold">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 text-sm -mx-px">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: getDay(month) }).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-white px-2 py-3 h-24" />
          ))}

          {/* Month days */}
          {days.map((day) => {
            const dayActivities = getDayActivities(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "bg-white px-2 py-3 relative h-24 cursor-pointer hover:bg-gray-50",
                  isCurrentDay && "bg-primary/5 ring-2 ring-primary ring-inset"
                )}
                onClick={() => handleDayClick(day)}
              >
                <time 
                  dateTime={format(day, "yyyy-MM-dd")} 
                  className={cn(
                    "text-gray-900",
                    isCurrentDay && "font-semibold text-primary"
                  )}
                >
                  {format(day, "d")}
                </time>

                {/* Day's activities */}
                <div className="mt-2">
                  {dayActivities.slice(0, 3).map((activity, index) => (
                    <div 
                      key={`${activity.id}-${index}`}
                      className={cn(
                        "text-xs rounded px-1 py-0.5 mb-1 truncate",
                        ActivityColors[activity.type as keyof typeof ActivityColors]
                      )}
                    >
                      {ActivityLabels[activity.type as keyof typeof ActivityLabels]}: {activity.hours}h
                    </div>
                  ))}

                  {/* More indicator for more than 3 activities */}
                  {dayActivities.length > 3 && (
                    <div className="text-xs text-gray-500 truncate">
                      + {dayActivities.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: 6 - getDay(monthEnd) }).map((_, index) => (
            <div key={`empty-end-${index}`} className="bg-white px-2 py-3 h-24" />
          ))}
        </div>
      </CardContent>
      {selectedDay && (
        <DayActivitiesDialog
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          activities={getDayActivities(selectedDay)}
          date={selectedDay}
          onActivityDeleted={() => setSelectedDay(null)}
        />
      )}
    </Card>
  );
}