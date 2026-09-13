'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { Chore, ChoreStatus } from '@/types';
import { useChores } from '@/context/ChoreContext';
import { expandChoresForWeek } from '@/lib/recurrence';
import { ChoreCard } from './ChoreCard';
import styles from './WeekViewGrid.module.scss';
import {
  format,
  addDays,
  isToday as checkIsToday,
} from 'date-fns';

interface WeekViewGridProps {
  currentWeekStart: Date;
  onSelectSlot: (date: string, startTime: string) => void;
  onSelectChore: (chore: Chore) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 AM to 9:00 PM (21:00)
const SLOT_HEIGHT_PX = 52; // Matches SCSS --slot-height
const START_HOUR = 6; // 06:00

export const WeekViewGrid: React.FC<WeekViewGridProps> = ({
  currentWeekStart,
  onSelectSlot,
  onSelectChore,
}) => {
  const { chores, filterMemberId, getMemberById, toggleStatus } = useChores();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 7 days for current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Expand recurring chores and apply filters
  const visibleChores = useMemo(() => {
    const expanded = expandChoresForWeek(chores, weekDays);
    if (!filterMemberId) return expanded;
    return expanded.filter((c) => c.assignedMemberId === filterMemberId);
  }, [chores, weekDays, filterMemberId]);

  // Scroll to 8:00 AM on initial mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const initialScroll = (8 - START_HOUR) * SLOT_HEIGHT_PX;
      scrollContainerRef.current.scrollTop = initialScroll;
    }
  }, []);

  // Compute Current Time Marker
  const now = new Date();
  const currentMinutesFromStart =
    (now.getHours() - START_HOUR) * 60 + now.getMinutes();
  const currentTimeTopPx = (currentMinutesFromStart / 60) * SLOT_HEIGHT_PX;
  const isCurrentTimeVisible =
    now.getHours() >= START_HOUR && now.getHours() < START_HOUR + HOURS.length;

  const handleQuickStatusCycle = (e: React.MouseEvent, chore: Chore) => {
    e.stopPropagation();
    const cycleMap: Record<ChoreStatus, ChoreStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
      skipped: 'pending',
    };
    const nextStatus = cycleMap[chore.status];
    toggleStatus(chore.id, nextStatus, chore.date);
  };

  return (
    <div className={styles.calendarWrapper}>
      <div ref={scrollContainerRef} className={styles.scrollContainer}>
        <div className={styles.calendarGrid}>
          {/* Row 1, Col 1: Corner Sticky Header above time column */}
          <div className={styles.cornerCell}>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">
              TIME
            </span>
          </div>

          {/* Row 1, Col 2-8: 7 Day Sticky Headers */}
          {weekDays.map((day, index) => {
            const isDayToday = checkIsToday(day);
            const isLast = index === weekDays.length - 1;
            return (
              <div
                key={day.toISOString()}
                className={`${styles.dayHeaderCell} ${
                  isDayToday ? styles.isToday : ''
                } ${isLast ? styles.noRightBorder : ''}`}
              >
                <div className={styles.dayName}>{format(day, 'EEE')}</div>
                <div className={styles.dayNumber}>
                  <span>{format(day, 'd')}</span>
                </div>
              </div>
            );
          })}

          {/* Row 2, Col 1: Time Labels Column */}
          <div className={styles.timeColumn}>
            {HOURS.map((hour) => {
              const timeDate = new Date();
              timeDate.setHours(hour, 0, 0, 0);
              return (
                <div key={hour} className={styles.timeSlotLabel}>
                  {format(timeDate, 'h a')}
                </div>
              );
            })}
          </div>

          {/* Row 2, Col 2-8: 7 Day Columns with Chore Cards */}
          {weekDays.map((day, index) => {
            const dayDateStr = format(day, 'yyyy-MM-dd');
            const isDayToday = checkIsToday(day);
            const isLast = index === weekDays.length - 1;
            const dayChores = visibleChores.filter((c) => c.date === dayDateStr);

            return (
              <div
                key={dayDateStr}
                className={`${styles.dayColumn} ${
                  isDayToday ? styles.isToday : ''
                } ${isLast ? styles.noRightBorder : ''}`}
              >
                {/* Current Time Indicator on Today's Column */}
                {isDayToday && isCurrentTimeVisible && (
                  <div
                    className={styles.currentTimeLine}
                    style={{ top: `${currentTimeTopPx}px` }}
                  />
                )}

                {/* Empty Hourly Slots (Click to Create) */}
                {HOURS.map((hour) => {
                  const hourStr = hour.toString().padStart(2, '0') + ':00';
                  return (
                    <div
                      key={hour}
                      onClick={() => onSelectSlot(dayDateStr, hourStr)}
                      className={styles.gridSlot}
                      title={`Click to add chore for ${format(
                        day,
                        'EEEE, MMM d'
                      )} at ${hourStr}`}
                    />
                  );
                })}

                {/* Positioned Chore Cards */}
                {dayChores.map((chore) => {
                  const member = getMemberById(chore.assignedMemberId);

                  const [startH, startM] = chore.startTime.split(':').map(Number);
                  const [endH, endM] = chore.endTime.split(':').map(Number);

                  const minutesFromStartHour =
                    (startH - START_HOUR) * 60 + (startM || 0);
                  const durationMinutes = Math.max(
                    (endH - startH) * 60 + ((endM || 0) - (startM || 0)),
                    30 // Minimum 30 mins render height
                  );

                  const topOffsetPx = (minutesFromStartHour / 60) * SLOT_HEIGHT_PX;
                  const heightPx = (durationMinutes / 60) * SLOT_HEIGHT_PX - 4;

                  return (
                    <ChoreCard
                      key={chore.id}
                      chore={chore}
                      member={member}
                      topOffsetPx={topOffsetPx}
                      heightPx={heightPx}
                      onClick={onSelectChore}
                      onQuickToggleStatus={handleQuickStatusCycle}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
