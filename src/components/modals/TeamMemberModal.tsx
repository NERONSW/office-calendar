'use client';

import React, { useState } from 'react';
import { useChores } from '@/context/ChoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Trash2, Shield } from 'lucide-react';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Emerald', value: '#16a34a' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Indigo', value: '#4f46e5' },
];

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { members, addMember, removeMember, chores } = useChores();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [colorBadge, setColorBadge] = useState(PRESET_COLORS[0].value);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !department.trim()) {
      setError('Please fill in all team member fields');
      return;
    }

    addMember({
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      colorBadge,
    });

    // Reset form
    setName('');
    setRole('');
    setDepartment('');
    setColorBadge(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].value);
    setError(null);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    const assignedChores = chores.filter((c) => c.assignedMemberId === memberId);
    if (assignedChores.length > 0) {
      const confirmDelete = window.confirm(
        `${memberName} currently has ${assignedChores.length} assigned chore(s). Deleting them will unassign these chores. Proceed?`
      );
      if (!confirmDelete) return;
    }
    removeMember(memberId);
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

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl rounded-xl border border-[var(--border-strong)] bg-[var(--bg-primary)] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-secondary)]">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[var(--accent-blue)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Office Team Directory
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

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Add New Member Form */}
              <form
                onSubmit={handleAddMember}
                className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                  <UserPlus className="h-4 w-4 text-[var(--accent-blue)]" />
                  <span>Add New Team Member</span>
                </div>

                {error && (
                  <div className="text-xs text-rose-500 font-medium">{error}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Role (e.g. IT Admin)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="rounded-md border border-[var(--border-strong)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-colors"
                  />
                </div>

                {/* Color Badge Palette Selector */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Badge Color:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          key={c.value}
                          onClick={() => setColorBadge(c.value)}
                          className={`w-5 h-5 rounded-full transition-all ${
                            colorBadge === c.value
                              ? 'ring-2 ring-offset-1 ring-[var(--accent-blue)] scale-110'
                              : 'opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] transition-colors shadow-xs"
                  >
                    Add Member
                  </motion.button>
                </div>
              </form>

              {/* Members List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Current Members ({members.length})
                </h3>

                <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
                  <AnimatePresence>
                    {members.map((member) => {
                      const choreCount = chores.filter(
                        (c) => c.assignedMemberId === member.id
                      ).length;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          key={member.id}
                          className="flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                              style={{ backgroundColor: member.colorBadge }}
                            >
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </motion.div>
                            <div>
                              <div className="text-xs font-bold text-[var(--text-primary)]">
                                {member.name}
                              </div>
                              <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                                <span>{member.role}</span>
                                <span>•</span>
                                <span className="text-[var(--text-muted)]">
                                  {member.department}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
                              {choreCount} chore{choreCount !== 1 ? 's' : ''}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-secondary)]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--bg-primary)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
