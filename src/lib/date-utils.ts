
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    subDays,
    startOfMonth,
    endOfMonth,
    startOfQuarter,
    endOfQuarter,
    subMonths,
} from 'date-fns';
import type { DateFilterType } from '@/types/event';

/**
 * Calculates the start and end dates for a given date filter type.
 * @param filterType - The type of date filter.
 * @returns An object with start and end Date objects, or null if filterType is 'all'.
 */
export function getDateRange(filterType: DateFilterType): { start: Date | null; end: Date | null } | null {
    const now = new Date();

    switch (filterType) {
        case 'all':
            return null; // No date filtering
        case 'today':
            return { start: startOfDay(now), end: endOfDay(now) };
        case 'thisWeek':
            // Assuming week starts on Monday for consistency, locale might affect this
            return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        case 'last7days':
            // Includes today
            return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
        case 'last30days':
             // Includes today
            return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
        case 'thisMonth':
            return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'thisQuarter':
            return { start: startOfQuarter(now), end: endOfQuarter(now) };
        case 'lastMonth':
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(lastMonthStart);
            return { start: lastMonthStart, end: lastMonthEnd };
        default:
            return null; // Default to no filter if type is unknown
    }
}
