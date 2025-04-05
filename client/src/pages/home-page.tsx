import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Activity } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { NavigationTabs } from "@/components/layout/navigation-tabs";
import { ActivityForm } from "@/components/activity-form";
import { ActivityList } from "@/components/activity-list";
import { ActivityCalendar } from "@/components/activity-calendar";
import { ProgressSummary } from "@/components/progress-summary";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { getCurrentMonthYear } from "@/lib/utils/date-utils";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Changed to selectedDate
  const { year, month } = getCurrentMonthYear(selectedDate); // Changed to selectedDate

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
    setSelectedDate(newDate); // Changed to selectedDate
  };

  const openActivityForm = (day?: Date) => {
    setSelectedDate(day || selectedDate); //Set selectedDate to day if provided otherwise keep existing value.
    setIsFormOpen(true);
  };

  const closeActivityForm = () => {
    setIsFormOpen(false);
  };

  const handleActivitySaved = () => {
    closeActivityForm();
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <NavigationTabs activeTab="reports" />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Progress Summary */}
          <ProgressSummary 
            activities={activities} 
            userRole={user.role} 
          />

          {/* Add Activity Button */}
          <div className="flex justify-end">
            <Button onClick={openActivityForm}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar atividade
            </Button>
          </div>

          {/* Calendar View */}
          <ActivityCalendar 
            activities={activities}
            date={selectedDate} // Changed to selectedDate
            onDateChange={handleDateChange}
            onDayClick={openActivityForm}
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
              /> {/* Changed to selectedDate */}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}