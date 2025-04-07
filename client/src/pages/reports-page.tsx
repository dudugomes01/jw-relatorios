
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, UserRole } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { ProgressSummary } from "@/components/progress-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities/month", selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/activities/month/${selectedYear}/${selectedMonth}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  const demoUser = {
    id: 1,
    username: "usuario",
    email: "usuario@exemplo.com",
    role: UserRole.PIONEIRO_REGULAR
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NavigationBar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-6">
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025].map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ProgressSummary activities={activities} userRole={demoUser.role} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
