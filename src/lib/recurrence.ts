import { Chore } from '@/types';
import {
  parseISO,
  format,
  addDays,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
} from 'date-fns';

/**
 * Expands recurring chores for the days in the visible calendar week.
 * Also accounts for stored explicit chore exceptions/overrides.
 */
export function expandChoresForWeek(allChores: Chore[], weekDays: Date[]): Chore[] {
  const result: Chore[] = [];
  const startDay = weekDays[0];
  const endDay = weekDays[weekDays.length - 1];

  // Separate recurring templates/series bases from one-off chores and explicit exceptions
  const oneOffsAndExceptions: Chore[] = [];
  const recurringSeriesTemplates: Chore[] = [];

  for (const chore of allChores) {
    if (chore.recurrence.frequency === 'none' || chore.isException) {
      oneOffsAndExceptions.push(chore);
    } else {
      recurringSeriesTemplates.push(chore);
    }
  }

  // 1. Add all one-off chores or explicit exceptions that fall inside the current week
  for (const chore of oneOffsAndExceptions) {
    const choreDate = parseISO(chore.date);
    if (
      (isAfter(choreDate, startDay) || isSameDay(choreDate, startDay)) &&
      (isBefore(choreDate, endDay) || isSameDay(choreDate, endDay))
    ) {
      result.push(chore);
    }
  }

  // Set of dates that have an explicit exception for a given seriesId
  const exceptionDateMap = new Set<string>();
  for (const chore of oneOffsAndExceptions) {
    if (chore.seriesId) {
      exceptionDateMap.add(`${chore.seriesId}_${chore.date}`);
    }
  }

  // 2. Expand recurring series across the week's days
  for (const template of recurringSeriesTemplates) {
    const seriesStartDate = parseISO(template.date);
    const seriesEndDate = template.recurrence.endDate ? parseISO(template.recurrence.endDate) : null;

    for (const day of weekDays) {
      // Must not be before the series start date
      if (isBefore(day, seriesStartDate) && !isSameDay(day, seriesStartDate)) {
        continue;
      }
      // Must not be after end date if specified
      if (seriesEndDate && isAfter(day, seriesEndDate)) {
        continue;
      }

      const dateStr = format(day, 'yyyy-MM-dd');

      // If an explicit exception exists for this series on this date, skip generated instance
      if (template.seriesId && exceptionDateMap.has(`${template.seriesId}_${dateStr}`)) {
        continue;
      }

      let matches = false;
      const { frequency, daysOfWeek } = template.recurrence;

      if (frequency === 'daily') {
        matches = true;
      } else if (frequency === 'weekly') {
        const currentDayOfWeek = getDay(day); // 0 = Sun, 1 = Mon ...
        if (daysOfWeek && daysOfWeek.length > 0) {
          matches = daysOfWeek.includes(currentDayOfWeek);
        } else {
          // If no specific days provided, repeat on the same day of week as seriesStartDate
          matches = currentDayOfWeek === getDay(seriesStartDate);
        }
      } else if (frequency === 'biweekly') {
        const weeksDiff = Math.abs(differenceInCalendarWeeks(day, seriesStartDate, { weekStartsOn: 1 }));
        const currentDayOfWeek = getDay(day);
        const targetDayOfWeek = getDay(seriesStartDate);
        if (weeksDiff % 2 === 0 && currentDayOfWeek === targetDayOfWeek) {
          matches = true;
        }
      } else if (frequency === 'monthly') {
        const monthsDiff = differenceInCalendarMonths(day, seriesStartDate);
        // Same day of month (e.g. 15th of every month)
        if (monthsDiff >= 0 && day.getDate() === seriesStartDate.getDate()) {
          matches = true;
        }
      }

      if (matches) {
        // If it's the exact origin date of the template, keep original ID
        const isBaseDate = isSameDay(day, seriesStartDate);
        result.push({
          ...template,
          id: isBaseDate ? template.id : `${template.seriesId || template.id}_${dateStr}`,
          date: dateStr,
        });
      }
    }
  }

  return result;
}
