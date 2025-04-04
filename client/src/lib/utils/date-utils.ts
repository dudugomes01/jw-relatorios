import { format, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Get a formatted date string for display
 */
export function formatDisplayDate(date: Date): string {
  return format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
}

/**
 * Get a formatted date string for input fields
 */
export function formatInputDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get current month and year as an object
 */
export function getCurrentMonthYear(date: Date = new Date()): { month: number; year: number } {
  return {
    month: getMonth(date),
    year: getYear(date)
  };
}

/**
 * Group dates by month
 */
export function groupByMonth<T>(
  items: T[],
  dateAccessor: (item: T) => string | Date
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = new Date(dateAccessor(item));
    const monthKey = format(date, "yyyy-MM");
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    
    groups[monthKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Format month for display (e.g., "Janeiro 2023")
 */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy", { locale: ptBR });
}

/**
 * Get formatted day name
 */
export function getDayName(date: Date): string {
  return format(date, "EEEE", { locale: ptBR });
}
