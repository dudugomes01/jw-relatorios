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

export function ActivityCalendar({ 
  activities,
  date,
  onDateChange,
  onDayClick
}: ActivityCalendarProps) {
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
    if (onDayClick) {
      onDayClick(day);
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
    </Card>
  );
}
