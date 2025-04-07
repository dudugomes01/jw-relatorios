
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, UserRole } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateHoursByType } from "@/lib/utils/activity-utils";

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

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = [2023, 2024, 2025];

  // Prepare data for chart
  const hoursByType = calculateHoursByType(activities);
  const chartData = Object.entries(hoursByType).map(([type, hours]) => ({
    type: type === 'campo' ? 'Campo' : 
          type === 'testemunho' ? 'Testemunho' :
          type === 'cartas' ? 'Cartas' : 'Estudo',
    hours
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NavigationBar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-6">
                Resumo de Relatórios
              </h2>
              
              <div className="flex gap-4 mb-6">
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Horas por Tipo de Atividade</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#4F46E5" name="Horas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Detalhes das Atividades</h3>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{activity.type === 'campo' ? 'Campo' : 
                                                     activity.type === 'testemunho' ? 'Testemunho' :
                                                     activity.type === 'cartas' ? 'Cartas' : 'Estudo'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-lg font-semibold">
                          {activity.hours}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
