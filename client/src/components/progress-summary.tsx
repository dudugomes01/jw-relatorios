// import { Activity, UserRole } from "@shared/schema";
// import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useState, useEffect } from "react";
// import { calculateTotalHours } from "@/lib/utils/activity-utils";

// interface ProgressSummaryProps {
//   activities: Activity[];
//   userRole: string;
// }

// export function ProgressSummary({
//   activities,
//   userRole,
// }: ProgressSummaryProps) {
//   const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
//     return userRole === UserRole.PIONEIRO_REGULAR
//       ? 50
//       : userRole === UserRole.PIONEIRO_AUXILIAR
//       ? 30
//       : 0;
//   });

//   // Role-based annual goals
//   const annualGoals = {
//     [UserRole.PUBLICADOR]: 0,
//     [UserRole.PIONEIRO_AUXILIAR]: 360, // 30 x 12
//     [UserRole.PIONEIRO_REGULAR]: 600, // 50 x 12
//   };

//   // Verificar explicitamente se o usuário é um pioneiro regular
//   const isPioneiroRegular = userRole === UserRole.PIONEIRO_REGULAR;

//   // Get annual goal for current role
//   const annualGoal = annualGoals[userRole as keyof typeof annualGoals] || 0;

//   // Calculate total hours for current month
//   const totalMonthHours = calculateTotalHours(activities);

//   // Calculate total hours for the service year (September to September)
//   const calculateServiceYearHours = async () => {
//     // Só buscar dados anuais se for pioneiro regular
//     if (!isPioneiroRegular) return 0;
    
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth();

//     // Determine service year start
//     const serviceYearStart = new Date(
//       currentMonth < 8 ? currentYear - 1 : currentYear,
//       8, // September (0-based)
//       1
//     );

//     // Fetch all activities for the service year
//     const response = await fetch(
//       `/api/activities/year/${serviceYearStart.getFullYear()}/${serviceYearStart.getMonth()}`
//     );
//     if (!response.ok) return 0;

//     const yearActivities = await response.json();
//     return yearActivities.reduce((total: number, activity: Activity) => {
//       return total + Number(activity.hours);
//     }, 0);
//   };

//   const [totalYearHours, setTotalYearHours] = useState(0);

//   useEffect(() => {
//     if (isPioneiroRegular) {
//       calculateServiceYearHours().then(setTotalYearHours);
//     }
//   }, [isPioneiroRegular]);

//   // Calculate progress percentages
//   const monthProgressPercentage = monthlyGoal
//     ? Math.min((totalMonthHours / monthlyGoal) * 100, 100)
//     : 0;
//   const yearProgressPercentage = annualGoal
//     ? Math.min((totalYearHours / annualGoal) * 100, 100)
//     : 0;

//   // Count total activities
//   const totalActivities = activities.length;

//   // Format progress message
//   const formatProgressMessage = () => {
//     if (userRole === UserRole.PUBLICADOR) {
//       return "Publicador - Sem meta específica de horas.";
//     }

//     const roleLabel =
//       userRole === UserRole.PIONEIRO_AUXILIAR
//         ? "Pioneiro Auxiliar"
//         : "Pioneiro Regular";

//     const remainingMonthHours = Math.max(monthlyGoal - totalMonthHours, 0);
    
//     // Apenas mostrar informações sobre a meta anual para pioneiros regulares
//     if (isPioneiroRegular) {
//       const remainingYearHours = Math.max(annualGoal - totalYearHours, 0);
//       return (
//         <div className="space-y-1">
//           <p>
//             {remainingMonthHours === 0
//               ? `${roleLabel} - Meta mensal atingida!`
//               : `${roleLabel} - Faltam ${remainingMonthHours} horas para a meta mensal.`}
//           </p>
//           <p className="text-sm text-muted-foreground">
//             {remainingYearHours === 0
//               ? "Meta anual atingida!"
//               : `Faltam ${remainingYearHours} horas para a meta anual.`}
//           </p>
//         </div>
//       );
//     }

//     // Para outros roles (exceto publicadores que são tratados acima)
//     return (
//       <div className="space-y-1">
//         <p>
//           {remainingMonthHours === 0
//             ? `${roleLabel} - Meta mensal atingida!`
//             : `${roleLabel} - Faltam ${remainingMonthHours} horas para a meta mensal.`}
//         </p>
//       </div>
//     );
//   };

//   return (
//     <Card>
//       <CardContent className="pt-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Current Month Summary */}
//           <div className="md:col-span-2">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">
//                 Resumo do mês atual
//               </h3>
//               {isPioneiroRegular && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-500">Meta mensal:</span>
//                   <Input
//                     type="number"
//                     value={monthlyGoal}
//                     onChange={(e) => setMonthlyGoal(Number(e.target.value))}
//                     className="w-20"
//                     min="0"
//                     max="100"
//                   />
//                 </div>
//               )}
//             </div>
//             <div className="space-y-4">
//               {/* Monthly Progress */}
//               <div className="relative pt-1">
//                 <div className="flex mb-2 items-center justify-between">
//                   <div>
//                     <span className="text-xs font-semibold inline-block text-primary">
//                       Progresso mensal
//                     </span>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-xs font-semibold inline-block text-primary">
//                       {monthlyGoal
//                         ? `${totalMonthHours}h / ${monthlyGoal}h`
//                         : `${totalMonthHours}h`}
//                     </span>
//                   </div>
//                 </div>
//                 <Progress value={monthProgressPercentage} className="h-2" />
//               </div>

//               {/* Annual Progress - Apenas para pioneiros regulares */}
//               {userRole === UserRole.PIONEIRO_REGULAR && (
//                 <div className="relative pt-1">
//                   <div className="flex mb-2 items-center justify-between">
//                     <div>
//                       <span className="text-xs font-semibold inline-block text-primary">
//                         Progresso anual
//                       </span>
//                     </div>
//                     <div className="text-right">
//                       <span className="text-xs font-semibold inline-block text-primary">
//                         {annualGoal
//                           ? `${totalYearHours}h / ${annualGoal}h`
//                           : `${totalYearHours}h`}
//                       </span>
//                     </div>
//                   </div>
//                   <Progress value={yearProgressPercentage} className="h-2" />
//                 </div>
//               )}
//             </div>
//             <div className="mt-3">{formatProgressMessage()}</div>
//           </div>

//           {/* Summary Stats */}
//           <div className="bg-gray-50 rounded-lg p-4">
//             <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
//               Totais do mês
//             </h4>
//             <dl className="mt-4 grid grid-cols-1 gap-4">
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <dt className="text-sm font-medium text-gray-500">
//                   Horas registradas
//                 </dt>
//                 <dd className="mt-1 text-3xl font-semibold text-gray-900">
//                   {totalMonthHours}h
//                 </dd>
//               </div>
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <dt className="text-sm font-medium text-gray-500">
//                   Atividades
//                 </dt>
//                 <dd className="mt-1 text-3xl font-semibold text-gray-900">
//                   {totalActivities}
//                 </dd>
//               </div>
//             </dl>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import { Activity, UserRole } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { calculateTotalHours } from "@/lib/utils/activity-utils";
import { useQuery } from "@tanstack/react-query";

interface ProgressSummaryProps {
  activities: Activity[];
}

export function ProgressSummary({ activities }: ProgressSummaryProps) {
  const { data: userRoleData, isLoading: isRoleLoading, error: roleError } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user-role");
        if (!response.ok) {
          throw new Error("Erro ao buscar papel do usuário");
        }
        const data = await response.json();
        return data.role;
      } catch (error) {
        console.error("Erro na chamada de API:", error);
        return UserRole.PUBLICADOR;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [totalYearHours, setTotalYearHours] = useState(0);

  const mapToUserRole = (role: string): string => {
    if (!role) return UserRole.PUBLICADOR;
    if (role === "pioneiro-regular") return UserRole.PIONEIRO_REGULAR;
    if (role === "pioneiro-auxiliar") return UserRole.PIONEIRO_AUXILIAR;
    if (role === "publicador") return UserRole.PUBLICADOR;
    return UserRole.PUBLICADOR;
  };

  const userRoleEnum = mapToUserRole(userRoleData || "");

  useEffect(() => {
    if (userRoleEnum === UserRole.PIONEIRO_REGULAR) {
      setMonthlyGoal(50);
    } else if (userRoleEnum === UserRole.PIONEIRO_AUXILIAR) {
      setMonthlyGoal(30);
    } else {
      setMonthlyGoal(0);
    }
  }, [userRoleEnum]);

  const annualGoals: Record<string, number> = {
    [UserRole.PUBLICADOR]: 0,
    [UserRole.PIONEIRO_AUXILIAR]: 360,
    [UserRole.PIONEIRO_REGULAR]: 600,
  };

  const annualGoal = annualGoals[userRoleEnum] ?? 0;

  const calculateServiceYearHours = async () => {
    if (userRoleEnum !== UserRole.PIONEIRO_REGULAR) return 0;

    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const serviceYearStart = new Date(
        currentMonth < 8 ? currentYear - 1 : currentYear,
        8,
        1
      );

      const response = await fetch(
        `/api/activities/year/${serviceYearStart.getFullYear()}/${serviceYearStart.getMonth()}`
      );
      if (!response.ok) return 0;

      const yearActivities = await response.json();
      return yearActivities.reduce((total: number, activity: Activity) => {
        return total + Number(activity.hours);
      }, 0);
    } catch (error) {
      console.error("Erro ao calcular horas anuais:", error);
      return 0;
    }
  };

  useEffect(() => {
    if (userRoleEnum === UserRole.PIONEIRO_REGULAR) {
      calculateServiceYearHours().then(setTotalYearHours);
    }
  }, [userRoleEnum]);

  const totalMonthHours = calculateTotalHours(activities);

  const monthProgressPercentage = monthlyGoal
    ? Math.min((totalMonthHours / monthlyGoal) * 100, 100)
    : 0;
  const yearProgressPercentage = annualGoal
    ? Math.min((totalYearHours / annualGoal) * 100, 100)
    : 0;

  const totalActivities = activities.length;

  const formatProgressMessage = () => {
    if (userRoleEnum === UserRole.PUBLICADOR) {
      return "Publicador - Sem meta específica de horas.";
    }

    const roleLabel =
      userRoleEnum === UserRole.PIONEIRO_AUXILIAR
        ? "Pioneiro Auxiliar"
        : userRoleEnum === UserRole.PIONEIRO_REGULAR
        ? "Pioneiro Regular"
        : "Usuário";

    const remainingMonthHours = Math.max(monthlyGoal - totalMonthHours, 0);

    if (userRoleEnum === UserRole.PIONEIRO_REGULAR) {
      const remainingYearHours = Math.max(annualGoal - totalYearHours, 0);
      return (
        <div className="space-y-1">
          <p>
            {remainingMonthHours === 0
              ? `${roleLabel} - Meta mensal atingida!`
              : `${roleLabel} - Faltam ${remainingMonthHours} horas para a meta mensal.`}
          </p>
          <p className="text-sm text-muted-foreground">
            {remainingYearHours === 0
              ? "Meta anual atingida!"
              : `Faltam ${remainingYearHours} horas para a meta anual.`}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p>
          {remainingMonthHours === 0
            ? `${roleLabel} - Meta mensal atingida!`
            : `${roleLabel} - Faltam ${remainingMonthHours} horas para a meta mensal.`}
        </p>
      </div>
    );
  };

  if (isRoleLoading) {
    return <div>Carregando...</div>;
  }

  if (roleError) {
    console.error("Erro ao carregar papel do usuário:", roleError);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Resumo do mês atual
              </h3>
              {userRoleEnum === UserRole.PIONEIRO_REGULAR && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Meta mensal:</span>
                  <Input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                    className="w-20"
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary">
                      Progresso mensal
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary">
                      {monthlyGoal
                        ? `${totalMonthHours}h / ${monthlyGoal}h`
                        : `${totalMonthHours}h`}
                    </span>
                  </div>
                </div>
                <Progress value={monthProgressPercentage} className="h-2" />
              </div>

              {userRoleEnum === UserRole.PIONEIRO_REGULAR && (
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary">
                        Progresso anual
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary">
                        {annualGoal
                          ? `${totalYearHours}h / ${annualGoal}h`
                          : `${totalYearHours}h`}
                      </span>
                    </div>
                  </div>
                  <Progress value={yearProgressPercentage} className="h-2" />
                </div>
              )}
            </div>
            <div className="mt-3">{formatProgressMessage()}</div>
          </div>

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
                  {totalMonthHours}h
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