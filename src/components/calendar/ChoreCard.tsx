'use client';

import React from 'react';
import { Chore, TeamMember } from '@/types';
import styles from './ChoreCard.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  Repeat,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  MinusCircle,
} from 'lucide-react';

interface ChoreCardProps {
  chore: Chore;
  member?: TeamMember;
  topOffsetPx: number;
  heightPx: number;
  onClick: (chore: Chore) => void;
  onQuickToggleStatus: (e: React.MouseEvent, chore: Chore) => void;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  member,
  topOffsetPx,
  heightPx,
  onClick,
  onQuickToggleStatus,
}) => {
  const memberColor = member?.colorBadge || '#6b7280';
  const timeString = `${chore.startTime} – ${chore.endTime}`;

  const isCompleted = chore.status === 'completed';
  const isSkipped = chore.status === 'skipped';
  const isInProgress = chore.status === 'in_progress';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      whileHover={{ y: -1.5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(chore)}
      className={`${styles.choreCard} ${isCompleted ? styles.completed : ''} ${
        isSkipped ? styles.skipped : ''
      } ${isInProgress ? styles.inProgress : ''} bg-[var(--bg-primary)] border border-[var(--border-subtle)]`}
      style={{
        top: `${topOffsetPx}px`,
        height: `${Math.max(heightPx, 28)}px`,
        borderLeftColor: memberColor,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {chore.recurrence.frequency !== 'none' && (
              <span title={`Recurring (${chore.recurrence.frequency})`} className="inline-flex items-center">
                <Repeat className="h-3 w-3 text-[var(--accent-blue)] shrink-0" />
              </span>
            )}
            <span className={styles.title} title={chore.title}>
              {chore.title}
            </span>
          </div>
          {heightPx >= 44 && (
            <div className={styles.metaRow}>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Clock className="h-2.5 w-2.5" /> {timeString}
              </span>
              {chore.location && (
                <span className="flex items-center gap-0.5 truncate text-[10px] opacity-85">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{chore.location}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick status button with micro pop animation */}
        <motion.button
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => onQuickToggleStatus(e, chore)}
          className="shrink-0 p-0.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          title={`Status: ${chore.status.replace('_', ' ')} (Click to advance)`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCompleted && (
              <motion.span
                key="completed"
                initial={{ scale: 0.4, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              </motion.span>
            )}
            {isInProgress && (
              <motion.span
                key="in_progress"
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <PlayCircle className="h-3.5 w-3.5 text-blue-500" />
              </motion.span>
            )}
            {isSkipped && (
              <motion.span
                key="skipped"
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <MinusCircle className="h-3.5 w-3.5 text-gray-400" />
              </motion.span>
            )}
            {chore.status === 'pending' && (
              <motion.span
                key="pending"
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {heightPx >= 58 && member && (
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className={styles.memberPill}>
            <span
              className={styles.badgeDot}
              style={{ backgroundColor: member.colorBadge }}
            />
            <span className="text-[10px] font-medium text-[var(--text-secondary)] truncate max-w-[100px]">
              {member.name.split(' ')[0]}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
            {chore.status.replace('_', ' ')}
          </span>
        </div>
      )}
    </motion.div>
  );
};
