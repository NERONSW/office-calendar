'use client';

import React, { useState } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { WeekViewGrid } from '@/components/calendar/WeekViewGrid';
import { ChoreModal } from '@/components/modals/ChoreModal';
import { TeamMemberModal } from '@/components/modals/TeamMemberModal';
import { Chore } from '@/types';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';

export const CalendarApp: React.FC = () => {
  // Always anchor current week start on Monday
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Modal visibility states
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Selected chore for editing or initial slot for new chore
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [slotDate, setSlotDate] = useState<string | undefined>(undefined);
  const [slotStartTime, setSlotStartTime] = useState<string | undefined>(
    undefined
  );

  const handleNavigateWeek = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    } else if (direction === 'prev') {
      setCurrentWeekStart((prev) => subWeeks(prev, 1));
    } else if (direction === 'next') {
      setCurrentWeekStart((prev) => addWeeks(prev, 1));
    }
  };

  const handleOpenNewChoreModal = () => {
    setSelectedChore(null);
    setSlotDate(undefined);
    setSlotStartTime(undefined);
    setIsChoreModalOpen(true);
  };

  const handleSelectSlot = (date: string, startTime: string) => {
    setSelectedChore(null);
    setSlotDate(date);
    setSlotStartTime(startTime);
    setIsChoreModalOpen(true);
  };

  const handleSelectChore = (chore: Chore) => {
    setSelectedChore(chore);
    setSlotDate(undefined);
    setSlotStartTime(undefined);
    setIsChoreModalOpen(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Outlook Calendar Header Bar */}
      <CalendarHeader
        currentWeekStart={currentWeekStart}
        onNavigateWeek={handleNavigateWeek}
        onOpenNewChoreModal={handleOpenNewChoreModal}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
      />

      {/* Main Week Calendar View */}
      <main className="flex-1 overflow-hidden">
        <WeekViewGrid
          currentWeekStart={currentWeekStart}
          onSelectSlot={handleSelectSlot}
          onSelectChore={handleSelectChore}
        />
      </main>

      {/* Modals */}
      <ChoreModal
        isOpen={isChoreModalOpen}
        onClose={() => setIsChoreModalOpen(false)}
        initialChore={selectedChore}
        initialDate={slotDate}
        initialStartTime={slotStartTime}
      />

      <TeamMemberModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
};
