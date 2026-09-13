'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chore, TeamMember, ChoreStatus, RecurrenceEditMode } from '@/types';
import { INITIAL_MEMBERS, getInitialChores } from '@/lib/seed';
import { format, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';

interface ChoreContextType {
  members: TeamMember[];
  chores: Chore[];
  filterMemberId: string | null;
  setFilterMemberId: (id: string | null) => void;
  addChore: (chore: Omit<Chore, 'id' | 'createdAt'>) => void;
  updateChore: (id: string, updated: Partial<Chore>, editMode?: RecurrenceEditMode, targetDate?: string) => void;
  deleteChore: (id: string, editMode?: RecurrenceEditMode, targetDate?: string) => void;
  toggleStatus: (id: string, status: ChoreStatus, targetDate?: string) => void;
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  removeMember: (memberId: string) => void;
  getMemberById: (id: string) => TeamMember | undefined;
}

const ChoreContext = createContext<ChoreContextType | undefined>(undefined);

const CHORES_STORAGE_KEY = 'office_chore_items_v1';
const MEMBERS_STORAGE_KEY = 'office_chore_members_v1';

export const ChoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage or seed data
  useEffect(() => {
    try {
      const storedMembers = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      } else {
        setMembers(INITIAL_MEMBERS);
        localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      }

      const storedChores = localStorage.getItem(CHORES_STORAGE_KEY);
      if (storedChores) {
        setChores(JSON.parse(storedChores));
      } else {
        const initial = getInitialChores();
        setChores(initial);
        localStorage.setItem(CHORES_STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Error loading chore data from localStorage:', e);
      setMembers(INITIAL_MEMBERS);
      setChores(getInitialChores());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state updates (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members:', e);
    }
  }, [members, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CHORES_STORAGE_KEY, JSON.stringify(chores));
    } catch (e) {
      console.error('Failed to save chores:', e);
    }
  }, [chores, isLoaded]);

  const addChore = (choreData: Omit<Chore, 'id' | 'createdAt'>) => {
    const isRecurring = choreData.recurrence.frequency !== 'none';
    const seriesId = isRecurring ? `series_${Date.now()}` : undefined;

    const newChore: Chore = {
      ...choreData,
      id: `chore_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      seriesId,
      createdAt: new Date().toISOString(),
    };

    setChores((prev) => [newChore, ...prev]);
  };

  const updateChore = (
    id: string,
    updatedData: Partial<Chore>,
    editMode: RecurrenceEditMode = 'single',
    targetDate?: string
  ) => {
    setChores((prev) => {
      // Find whether the item exists as an actual stored chore or a generated recurring occurrence
      const existing = prev.find((c) => c.id === id);

      // If it's a generated recurring instance (ID contains seriesId_date) or has seriesId
      const seriesId = existing?.seriesId || (id.includes('_') ? id.split('_')[0].replace('chore_', 'series_') : undefined);
      const originalDate = targetDate || existing?.date || (id.includes('_') ? id.split('_')[1] : format(new Date(), 'yyyy-MM-dd'));

      if (!existing && !seriesId) return prev;

      if (editMode === 'single') {
        // Create an explicit exception for this single day
        const baseItem = existing || prev.find((c) => c.seriesId === seriesId || c.id === id);
        if (!baseItem) return prev;

        const exceptionChore: Chore = {
          ...baseItem,
          ...updatedData,
          id: `exception_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          seriesId: baseItem.seriesId,
          date: originalDate,
          isException: true,
          recurrence: { frequency: 'none' }, // Independent instance
          createdAt: new Date().toISOString(),
        };

        // If existing is already an exception, replace it, else append
        if (existing?.isException) {
          return prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
        } else {
          return [...prev, exceptionChore];
        }
      }

      if (editMode === 'following') {
        // Cap the previous series at the day before originalDate, and start a new series from originalDate
        const baseSeries = prev.find((c) => c.seriesId === seriesId && !c.isException);
        if (!baseSeries) return prev;

        const cutOffDate = parseISO(originalDate);
        // Add one day prior as end date for old series
        const newSeriesId = `series_${Date.now()}`;
        const newSeriesChore: Chore = {
          ...baseSeries,
          ...updatedData,
          id: `chore_${Date.now()}`,
          seriesId: newSeriesId,
          date: originalDate,
          isException: false,
          createdAt: new Date().toISOString(),
        };

        return prev.map((c) => {
          if (c.id === baseSeries.id) {
            return {
              ...c,
              recurrence: {
                ...c.recurrence,
                endDate: format(cutOffDate, 'yyyy-MM-dd'),
              },
            };
          }
          return c;
        }).concat(newSeriesChore);
      }

      if (editMode === 'series') {
        // Update the master series template
        return prev.map((c) => {
          if (c.seriesId === seriesId || c.id === id) {
            return {
              ...c,
              ...updatedData,
              // Keep original series date unless explicitly updated
              date: updatedData.date || c.date,
            };
          }
          return c;
        });
      }

      return prev;
    });
  };

  const deleteChore = (
    id: string,
    editMode: RecurrenceEditMode = 'single',
    targetDate?: string
  ) => {
    setChores((prev) => {
      const existing = prev.find((c) => c.id === id);
      const seriesId = existing?.seriesId || (id.includes('_') ? id.split('_')[0].replace('chore_', 'series_') : undefined);
      const dateStr = targetDate || existing?.date || (id.includes('_') ? id.split('_')[1] : null);

      if (!existing && !seriesId) return prev;

      if (!seriesId || editMode === 'series') {
        // Delete entire chore or entire recurring series (including any exceptions)
        return prev.filter((c) => (c.id !== id && (!seriesId || c.seriesId !== seriesId)));
      }

      if (editMode === 'single' && dateStr) {
        // If it's already an explicit exception, just remove it
        if (existing?.isException) {
          return prev.filter((c) => c.id !== id);
        }
        // Otherwise, mark an empty skipped/deleted exception record so recurrence generator skips it
        const baseSeries = prev.find((c) => c.seriesId === seriesId);
        if (!baseSeries) return prev;

        const deletedException: Chore = {
          ...baseSeries,
          id: `deleted_${Date.now()}`,
          seriesId,
          date: dateStr,
          status: 'skipped',
          isException: true,
          recurrence: { frequency: 'none' },
          createdAt: new Date().toISOString(),
        };
        return [...prev, deletedException];
      }

      if (editMode === 'following' && dateStr) {
        // End series on dateStr
        const targetD = parseISO(dateStr);
        return prev
          .filter((c) => {
            // Remove exceptions after this date for the same series
            if (c.seriesId === seriesId && c.isException) {
              return isBefore(parseISO(c.date), targetD);
            }
            return true;
          })
          .map((c) => {
            if (c.seriesId === seriesId && !c.isException) {
              return {
                ...c,
                recurrence: {
                  ...c.recurrence,
                  endDate: dateStr,
                },
              };
            }
            return c;
          });
      }

      return prev;
    });
  };

  const toggleStatus = (id: string, newStatus: ChoreStatus, targetDate?: string) => {
    setChores((prev) => {
      const existing = prev.find((c) => c.id === id);
      const isCompleted = newStatus === 'completed';

      // If it exists in stored array as a standalone or exception
      if (existing) {
        return prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                completedAt: isCompleted ? new Date().toISOString() : undefined,
                completedByMemberId: isCompleted ? c.assignedMemberId : undefined,
              }
            : c
        );
      }

      // If it is an unmaterialized occurrence of a recurring series (e.g. id = "series_coffee_2026-09-15")
      if (id.includes('_') && targetDate) {
        const seriesId = id.split('_')[0].replace('chore_', 'series_');
        const base = prev.find((c) => c.seriesId === seriesId || c.id === id.split('_')[0]);
        if (base) {
          const exceptionChore: Chore = {
            ...base,
            id: `exception_${Date.now()}`,
            seriesId: base.seriesId,
            date: targetDate,
            status: newStatus,
            isException: true,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
            completedByMemberId: isCompleted ? base.assignedMemberId : undefined,
            recurrence: { frequency: 'none' },
            createdAt: new Date().toISOString(),
          };
          return [...prev, exceptionChore];
        }
      }

      return prev;
    });
  };

  const addMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    // Clear filter if the deleted member was filtered
    if (filterMemberId === memberId) {
      setFilterMemberId(null);
    }
  };

  const getMemberById = (id: string) => {
    return members.find((m) => m.id === id);
  };

  return (
    <ChoreContext.Provider
      value={{
        members,
        chores,
        filterMemberId,
        setFilterMemberId,
        addChore,
        updateChore,
        deleteChore,
        toggleStatus,
        addMember,
        removeMember,
        getMemberById,
      }}
    >
      {children}
    </ChoreContext.Provider>
  );
};

export const useChores = () => {
  const context = useContext(ChoreContext);
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider');
  }
  return context;
};
