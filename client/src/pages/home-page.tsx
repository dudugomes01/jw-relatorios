import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, UserRole } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { ActivityForm } from "@/components/activity-form";
import { ActivityList } from "@/components/activity-list";
import { ActivityCalendar } from "@/components/activity-calendar";
import { ProgressSummary } from "@/components/progress-summary";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { getCurrentMonthYear } from "@/lib/utils/date-utils";

export default function HomePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const { year, month } = getCurrentMonthYear(selectedDate);
  
  // Usuário fixo para fins de demonstração
  const demoUser = {
    id: 1,
    username: "usuario",
    email: "usuario@exemplo.com",
    role: UserRole.PIONEIRO_REGULAR
  };

  const handleActivityEdit = (activity: Activity) => {
    setActivityToEdit(activity);
    setSelectedDate(new Date(activity.date));
    setIsFormOpen(true);
  };

  const handleActivitySaved = () => {
    setIsFormOpen(false);
    setActivityToEdit(null);
  };

  // Fetch activities for the current month
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities/month", year, month],
    queryFn: async () => {
      const response = await fetch(`/api/activities/month/${year}/${month}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  // Fetch all activities for the activity list
  const { data: allActivities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const openActivityForm = (day?: Date) => {
    setSelectedDate(day || selectedDate);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NavigationBar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Progress Summary */}
          <ProgressSummary 
            activities={activities} 
            userRole={demoUser.role} 
          />

          {/* Add Activity Button */}
          <div className="flex justify-end">
            <Button onClick={() => {
              const event = {} as React.MouseEvent<HTMLButtonElement>;
              openActivityForm(undefined);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar atividade
            </Button>
          </div>

          {/* Calendar View */}
          <ActivityCalendar 
            activities={activities}
            date={selectedDate}
            onDateChange={handleDateChange}
            onDayClick={openActivityForm}
            onActivityEdit={handleActivityEdit}
          />

          {/* Activity List */}
          <ActivityList activities={allActivities} />

          {/* Activity Form Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <ActivityForm 
                onSave={handleActivitySaved} 
                initialDate={selectedDate}
                activityToEdit={activityToEdit} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}