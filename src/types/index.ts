export type ChoreStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  endDate?: string;      // YYYY-MM-DD
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  colorBadge: string; // Hex color code or standard color tag
}

export interface Chore {
  id: string;
  seriesId?: string; // Links recurring instances to original rule definition
  title: string;
  description?: string;
  location?: string;
  assignedMemberId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm (e.g. "09:00")
  endTime: string;    // HH:mm (e.g. "09:30")
  status: ChoreStatus;
  completedAt?: string;
  completedByMemberId?: string;
  recurrence: RecurrenceRule;
  // If this instance is an edited exception to the series
  isException?: boolean;
  createdAt: string;
}

export type RecurrenceEditMode = 'single' | 'following' | 'series';
