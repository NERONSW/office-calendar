'use client';

import React, { useState, useEffect } from 'react';
import {
  Chore,
  ChoreStatus,
  RecurrenceFrequency,
  RecurrenceEditMode,
} from '@/types';
import { useChores } from '@/context/ChoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
} from 'lucide-react';

interface ChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChore?: Chore | null;
  initialDate?: string;
  initialStartTime?: string;
}

const DAYS_OF_WEEK = [
  { label: 'M', value: 1, full: 'Mon' },
  { label: 'T', value: 2, full: 'Tue' },
  { label: 'W', value: 3, full: 'Wed' },
  { label: 'T', value: 4, full: 'Thu' },
  { label: 'F', value: 5, full: 'Fri' },
  { label: 'S', value: 6, full: 'Sat' },
  { label: 'S', value: 0, full: 'Sun' },
];

export const ChoreModal: React.FC<ChoreModalProps> = ({
  isOpen,
  onClose,
  initialChore,
  initialDate,
  initialStartTime,
}) => {
  const { members, addChore, updateChore, deleteChore } = useChores();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [status, setStatus] = useState<ChoreStatus>('pending');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('none');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);

  // Outlook Recurrence Confirmation Dialog State
  const [showRecurrencePrompt, setShowRecurrencePrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'delete' | null>(
    null
  );
  const [recurrenceEditChoice, setRecurrenceEditChoice] =
    useState<RecurrenceEditMode>('single');

  const isEditing = Boolean(initialChore);
  const isRecurringInstance =
    Boolean(initialChore?.seriesId) || initialChore?.recurrence?.frequency !== 'none';

  useEffect(() => {
    if (initialChore) {
      setTitle(initialChore.title);
      setDescription(initialChore.description || '');
      setLocation(initialChore.location || '');
      setAssignedMemberId(initialChore.assignedMemberId);
      setDate(initialChore.date);
      setStartTime(initialChore.startTime);
      setEndTime(initialChore.endTime);
      setStatus(initialChore.status);
      setFrequency(initialChore.recurrence.frequency);
      setSelectedDays(initialChore.recurrence.daysOfWeek || [1]);
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setAssignedMemberId(members[0]?.id || '');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime(initialStartTime || '09:00');

      // Calculate default end time 30 mins later
      const [h, m] = (initialStartTime || '09:00').split(':').map(Number);
      const endH = m >= 30 ? (h + 1).toString().padStart(2, '0') : h.toString().padStart(2, '0');
      const endM = m >= 30 ? '00' : '30';
      setEndTime(`${endH}:${endM}`);

      setStatus('pending');
      setFrequency('none');
      setSelectedDays([1]);
    }
    setShowRecurrencePrompt(false);
  }, [initialChore, initialDate, initialStartTime, isOpen, members]);

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedMemberId) return;

    if (isEditing && isRecurringInstance) {
      setPendingAction('save');
      setShowRecurrencePrompt(true);
      return;
    }

    executeSave('single');
  };

  const executeSave = (editMode: RecurrenceEditMode) => {
    const chorePayload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      assignedMemberId,
      date,
      startTime,
      endTime,
      status,
      recurrence: {
        frequency,
        daysOfWeek: frequency === 'weekly' ? selectedDays : undefined,
      },
    };

    if (isEditing && initialChore) {
      updateChore(initialChore.id, chorePayload, editMode, initialChore.date);
    } else {
      addChore(chorePayload);
    }

    onClose();
  };

  const handleDeleteClick = () => {
    if (!initialChore) return;

    if (isRecurringInstance) {
      setPendingAction('delete');
      setShowRecurrencePrompt(true);
      return;
    }

    deleteChore(initialChore.id, 'single');
    onClose();
  };

  const executeDelete = (editMode: RecurrenceEditMode) => {
    if (!initialChore) return;
    deleteChore(initialChore.id, editMode, initialChore.date);
    onClose();
  };

  const toggleDayOfWeek = (dayVal: number) => {
    if (selectedDays.includes(dayVal)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayVal));
      }
    } else {
      setSelectedDays([...selectedDays, dayVal].sort());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-xl border border-[var(--border-strong)] bg-[var(--bg-primary)] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-secondary)]">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[var(--accent-blue)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {isEditing ? 'Edit Office Chore' : 'Schedule Office Chore'}
                </h2>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Outlook-style Recurrence Scope Dialog Overlay */}
            {showRecurrencePrompt ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-full text-amber-500 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {pendingAction === 'delete'
                        ? 'Delete Recurring Chore'
                        : 'Modify Recurring Chore'}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      This chore is part of a recurring schedule. How would you like
                      to apply this {pendingAction === 'delete' ? 'deletion' : 'change'}?
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 my-5">
                  <label
                    onClick={() => setRecurrenceEditChoice('single')}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      recurrenceEditChoice === 'single'
                        ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/5 ring-1 ring-[var(--accent-blue)]'
                        : 'border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recurrence_scope"
                      checked={recurrenceEditChoice === 'single'}
                      onChange={() => setRecurrenceEditChoice('single')}
                      className="mt-0.5 text-[var(--accent-blue)]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        Only this occurrence
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Changes will only affect this single scheduled instance on{' '}
                        {initialChore?.date}.
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setRecurrenceEditChoice('following')}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      recurrenceEditChoice === 'following'
                        ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/5 ring-1 ring-[var(--accent-blue)]'
                        : 'border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recurrence_scope"
                      checked={recurrenceEditChoice === 'following'}
                      onChange={() => setRecurrenceEditChoice('following')}
                      className="mt-0.5 text-[var(--accent-blue)]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        This and following occurrences
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Changes will apply to this occurrence and all future dates in
                        the series.
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setRecurrenceEditChoice('series')}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      recurrenceEditChoice === 'series'
                        ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/5 ring-1 ring-[var(--accent-blue)]'
                        : 'border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recurrence_scope"
                      checked={recurrenceEditChoice === 'series'}
                      onChange={() => setRecurrenceEditChoice('series')}
                      className="mt-0.5 text-[var(--accent-blue)]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        All occurrences in the series
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Updates the master template for every occurrence past and
                        future.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--border-subtle)]">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowRecurrencePrompt(false)}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-[var(--border-strong)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      if (pendingAction === 'delete') {
                        executeDelete(recurrenceEditChoice);
                      } else {
                        executeSave(recurrenceEditChoice);
                      }
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md text-white ${
                      pendingAction === 'delete'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)]'
                    }`}
                  >
                    Confirm {pendingAction === 'delete' ? 'Delete' : 'Save'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              /* Normal Chore Form */
              <form onSubmit={handleSaveClick} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Chore Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Empty Dishwasher & Tidy Mugs"
                    className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                  />
                </div>

                {/* Description & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Location / Room
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. 2nd Floor Kitchen"
                        className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Assigned Team Member <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <select
                        required
                        value={assignedMemberId}
                        onChange={(e) => setAssignedMemberId(e.target.value)}
                        className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                      >
                        <option value="" disabled>
                          Select an assignee
                        </option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.department})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Details & Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specific guidance for whoever completes this chore..."
                    className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                  />
                </div>

                {/* Date and Times */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      step="900"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      step="900"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                    />
                  </div>
                </div>

                {/* Status & Recurrence Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ChoreStatus)}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                      Recurrence Pattern
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                    >
                      <option value="none">Does not repeat (One-off)</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Day selector for weekly recurrence */}
                <AnimatePresence>
                  {frequency === 'weekly' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)] overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
                        Repeat On Days:
                      </label>
                      <div className="flex items-center gap-1.5">
                        {DAYS_OF_WEEK.map((d) => {
                          const isSelected = selectedDays.includes(d.value);
                          return (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              key={d.value}
                              onClick={() => toggleDayOfWeek(d.value)}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                                  : 'bg-[var(--bg-primary)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                              }`}
                              title={d.full}
                            >
                              {d.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  {isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleDeleteClick}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Chore</span>
                    </motion.button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={onClose}
                      className="px-4 py-1.5 text-xs font-medium rounded-md border border-[var(--border-strong)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] shadow-xs transition-colors"
                    >
                      {isEditing ? 'Save Changes' : 'Schedule Chore'}
                    </motion.button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
