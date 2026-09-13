import { TeamMember, Chore } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem_1',
    name: 'Sarah Jenkins',
    role: 'Office Manager',
    department: 'Operations',
    colorBadge: '#2563eb', // Blue
  },
  {
    id: 'mem_2',
    name: 'David Chen',
    role: 'Lead Architect',
    department: 'Engineering',
    colorBadge: '#16a34a', // Emerald Green
  },
  {
    id: 'mem_3',
    name: 'Elena Rostova',
    role: 'HR Specialist',
    department: 'People & Culture',
    colorBadge: '#9333ea', // Purple
  },
  {
    id: 'mem_4',
    name: 'Marcus Vance',
    role: 'Facilities Specialist',
    department: 'Workplace Ops',
    colorBadge: '#ea580c', // Orange
  },
];

// Helper to compute dates relative to current week so calendar is never empty
export function getInitialChores(): Chore[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  const mon = format(addDays(weekStart, 0), 'yyyy-MM-dd');
  const tue = format(addDays(weekStart, 1), 'yyyy-MM-dd');
  const wed = format(addDays(weekStart, 2), 'yyyy-MM-dd');
  const thu = format(addDays(weekStart, 3), 'yyyy-MM-dd');
  const fri = format(addDays(weekStart, 4), 'yyyy-MM-dd');

  return [
    // Daily recurring chore: Coffee restock
    {
      id: 'chore_rec_coffee',
      seriesId: 'series_coffee',
      title: 'Restock Coffee & Tea Supplies',
      description: 'Check espresso beans, oat milk, sugar, syrups and tea station',
      location: 'Breakroom Kitchen',
      assignedMemberId: 'mem_1',
      date: mon,
      startTime: '08:30',
      endTime: '09:00',
      status: 'completed',
      recurrence: {
        frequency: 'daily',
      },
      createdAt: new Date().toISOString(),
    },
    // Weekly recurring chore: Water plants (Mon, Thu)
    {
      id: 'chore_rec_plants',
      seriesId: 'series_plants',
      title: 'Water Office Plants & Ferns',
      description: 'Mist all boardroom ficus and refill self-watering pots in open lounge',
      location: 'Open Lounge & Boardroom',
      assignedMemberId: 'mem_3',
      date: mon,
      startTime: '10:00',
      endTime: '10:45',
      status: 'pending',
      recurrence: {
        frequency: 'weekly',
        daysOfWeek: [1, 4], // Monday and Thursday
      },
      createdAt: new Date().toISOString(),
    },
    // One-off chore: IT Equipment Audit
    {
      id: 'chore_oneoff_audit',
      title: 'Server Rack & Cable Organization',
      description: 'Tidy up patch cables and label new switch ports',
      location: 'Server Room 2B',
      assignedMemberId: 'mem_2',
      date: tue,
      startTime: '11:00',
      endTime: '12:30',
      status: 'in_progress',
      recurrence: {
        frequency: 'none',
      },
      createdAt: new Date().toISOString(),
    },
    // Biweekly recurring chore: Order Office Supplies
    {
      id: 'chore_rec_supplies',
      seriesId: 'series_supplies',
      title: 'Audit & Order Office Snacks',
      description: 'Check inventory for healthy snacks, sodas, sparkling water, fruit baskets',
      location: 'Main Pantry',
      assignedMemberId: 'mem_4',
      date: wed,
      startTime: '14:00',
      endTime: '15:00',
      status: 'pending',
      recurrence: {
        frequency: 'biweekly',
      },
      createdAt: new Date().toISOString(),
    },
    // Weekly Friday chore: Deep Clean Kitchen Fridges
    {
      id: 'chore_rec_fridge',
      seriesId: 'series_fridge',
      title: 'Fridge Clean-out & Sanitize',
      description: 'Toss unlabelled containers and wipe down refrigerator shelves before weekend',
      location: '4th Floor Kitchenette',
      assignedMemberId: 'mem_1',
      date: fri,
      startTime: '16:00',
      endTime: '17:00',
      status: 'pending',
      recurrence: {
        frequency: 'weekly',
        daysOfWeek: [5], // Friday
      },
      createdAt: new Date().toISOString(),
    },
  ];
}
