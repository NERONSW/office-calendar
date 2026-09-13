"use client";

import React from "react";
import { useChores } from "@/context/ChoreContext";
import { useTheme } from "next-themes";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Users,
  Sun,
  Moon,
  Filter,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarHeaderProps {
  currentWeekStart: Date;
  onNavigateWeek: (direction: "prev" | "next" | "today") => void;
  onOpenNewChoreModal: () => void;
  onOpenTeamModal: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentWeekStart,
  onNavigateWeek,
  onOpenNewChoreModal,
  onOpenTeamModal,
}) => {
  const { members, filterMemberId, setFilterMemberId } = useChores();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const weekLabel = `${format(currentWeekStart, "MMMM d")} – ${format(
    new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
    "MMMM d, yyyy",
  )}`;

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-3 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Date Range Controls */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-blue)] text-white shadow-sm cursor-pointer"
            >
              <CalendarIcon className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] transition-colors duration-200">
                Office Chores
              </h1>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Week Calendar
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[var(--border-subtle)] hidden sm:block" />

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigateWeek("today")}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors shadow-xs"
            >
              Today
            </motion.button>
            <div className="flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] p-0.5 shadow-xs">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigateWeek("prev")}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigateWeek("next")}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] pl-2">
              {weekLabel}
            </span>
          </div>
        </div>

        {/* Right: Actions, Filters, Theme Toggle */}
        <div className="flex items-center space-x-3">
          {/* Filter by Team Member */}
          <div className="relative flex items-center">
            <Filter className="absolute left-2.5 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={filterMemberId || ""}
              onChange={(e) =>
                setFilterMemberId(e.target.value ? e.target.value : null)
              }
              className="text-xs font-medium pl-8 pr-7 py-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] appearance-none cursor-pointer shadow-xs transition-colors"
            >
              <option value="">All Team Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 text-[var(--text-muted)] text-[10px]">
              ▼
            </div>
          </div>

          {/* Manage Team Members Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenTeamModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors shadow-xs"
          >
            <Users className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>Team ({members.length})</span>
          </motion.button>

          {/* Smooth Theme Switching Button with Framer Motion Icon Rotation & Spring */}
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors shadow-xs overflow-hidden w-8 h-8 flex items-center justify-center"
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Sun className="h-4 w-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Moon className="h-4 w-4 text-slate-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* New Chore Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenNewChoreModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Chore</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
