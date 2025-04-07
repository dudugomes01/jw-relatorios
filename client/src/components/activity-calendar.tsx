import { useCallback, useState } from "react";
import { Activity, ActivityType } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  addMonths,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


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
  onActivityEdit?: (activity: Activity) => void;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ isOpen, onClose, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ActivityCalendar({ 
  activities,
  date,
  onDateChange,
  onDayClick,
  onActivityEdit
}: ActivityCalendarProps) {
  // Ensure date is a valid Date object
  const currentDate = date instanceof Date ? date : new Date(date);

  // Create calendar for month
  const month = startOfMonth(currentDate);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: month, end: monthEnd });

  // Go to previous month
  const previousMonth = useCallback(() => {
    onDateChange(subMonths(currentDate, 1));
  }, [currentDate, onDateChange]);

  // Go to next month
  const nextMonth = useCallback(() => {
    onDateChange(addMonths(currentDate, 1));
  }, [currentDate, onDateChange]);

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

  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayActivities, setSelectedDayActivities] = useState<Activity[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (activityId: number) => {
      await apiRequest("DELETE", `/api/activities/${activityId}`);
    },
    onSuccess: () => {
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/month"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const openModal = (day: Date) => {
    setSelectedDay(day);
    setSelectedDayActivities(getDayActivities(day));
    setIsModalOpen(true);
  };

  const handleDelete = (activity: Activity) => {
    setActivityToDelete(activity);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      await deleteMutation.mutateAsync(activityToDelete.id);
      setIsDeleteDialogOpen(false);
      setActivityToDelete(null);
      if (selectedDay) {
        setSelectedDayActivities(getDayActivities(selectedDay));
      }
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
            {format(new Date(date), "MMMM yyyy", { locale: ptBR })}
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
                onClick={() => openModal(day)}
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
                        "text-xs rounded px-1 py-0.5 mb-1 truncate cursor-pointer",
                        ActivityColors[activity.type as keyof typeof ActivityColors]
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onActivityEdit) {
                          onActivityEdit(activity);
                        }
                      }}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Atividades do dia {selectedDay ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR }) : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedDayActivities.length === 0 ? (
              <p className="text-center text-gray-500">Nenhuma atividade registrada neste dia.</p>
            ) : (
              <div className="space-y-4">
                {selectedDayActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{ActivityLabels[activity.type as keyof typeof ActivityLabels]}</p>
                      <p className="text-sm text-gray-500">{activity.hours} horas</p>
                      {activity.notes && (
                        <p className="text-sm text-gray-500 mt-1">{activity.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsModalOpen(false);
                          if (onActivityEdit) onActivityEdit(activity);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(activity)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setActivityToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}