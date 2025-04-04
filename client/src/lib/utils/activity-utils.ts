import { Activity, UserRole, ActivityType } from "@shared/schema";

/**
 * Calculate total hours from a list of activities
 */
export function calculateTotalHours(activities: Activity[]): number {
  if (!activities.length) return 0;
  
  const total = activities.reduce((sum, activity) => {
    return sum + Number(activity.hours);
  }, 0);
  
  // Round to 1 decimal place
  return Math.round(total * 10) / 10;
}

/**
 * Get the goal hours based on user role
 */
export function getGoalHours(role: string): number {
  switch (role) {
    case UserRole.PIONEIRO_REGULAR:
      return 50;
    case UserRole.PIONEIRO_AUXILIAR:
      return 30;
    case UserRole.PUBLICADOR:
    default:
      return 0; // No goal for regular publishers
  }
}

/**
 * Group activities by activity type
 */
export function groupActivitiesByType(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce((groups, activity) => {
    const type = activity.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);
}

/**
 * Calculate hours by activity type
 */
export function calculateHoursByType(activities: Activity[]): Record<string, number> {
  const groups = groupActivitiesByType(activities);
  
  const result: Record<string, number> = {};
  
  for (const type in groups) {
    result[type] = calculateTotalHours(groups[type]);
  }
  
  return result;
}

/**
 * Format hours with proper plural form
 */
export function formatHours(hours: number): string {
  if (hours === 1) {
    return "1 hora";
  }
  return `${hours} horas`;
}
