export type StaffRole = 'kitchen' | 'hall' | 'both';
export type ShiftSlotType = 'lunch' | 'dinner' | 'all_day' | 'custom';
export type PreferenceType = 'available' | 'preferred_time' | 'unavailable'; // ○, △, ✕

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  isLeader: boolean;
  hourlyWage: number;
  targetMonthlyHours: number;
  maxConsecutiveDays: number;
  isStudent: boolean;
  phone: string;
  lineUserId: string;
  lineConnected: boolean;
  color: string;
  notes?: string;
}

export interface ShiftPeriod {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  deadline: string;  // YYYY-MM-DD HH:mm
  status: 'recruiting' | 'adjusting' | 'published';
  targetDaysCount: number;
}

export interface ShiftRequestEntry {
  date: string;
  preference: PreferenceType;
  startTime?: string;
  endTime?: string;
  slots?: ShiftSlotType[];
  lunchInTime?: string;
  dinnerInTime?: string;
  note?: string;
}

export interface ShiftSubmission {
  id: string;
  staffId: string;
  periodId: string;
  submittedAt: string;
  overallComment?: string;
  entries: ShiftRequestEntry[];
}

export interface AssignedShift {
  id: string;
  periodId: string;
  staffId: string;
  date: string;
  slot: 'lunch' | 'dinner' | 'custom';
  role: 'kitchen' | 'hall';
  startTime: string;
  endTime: string;
  hours: number;
  isUrgentCover?: boolean;
  note?: string;
}

export interface RequirementSlot {
  kitchen: number;
  hall: number;
}

export interface DailyRequirementOverride {
  lunch?: {
    kitchen: number;
    hall: number;
  };
  dinner?: {
    kitchen: number;
    hall: number;
  };
  reason?: string;
}

export interface ShiftRequirements {
  lunchWeekday: RequirementSlot;
  lunchWeekend: RequirementSlot;
  dinnerWeekday: RequirementSlot;
  dinnerWeekend: RequirementSlot;
  customDailyOverrides?: Record<string, DailyRequirementOverride>;
}

export interface UrgentHelpPost {
  id: string;
  periodId: string;
  date: string;
  slot: 'lunch' | 'dinner';
  role: 'kitchen' | 'hall';
  startTime: string;
  endTime: string;
  bonusWagePerHour: number; // e.g. +150円
  reason: string;
  status: 'open' | 'filled';
  filledByStaffId?: string;
  createdAt: string;
}

export interface LineChatMessage {
  id: string;
  sender: 'bot' | 'user';
  timestamp: string;
  type: 'text' | 'flex_shift_card' | 'flex_urgent' | 'flex_receipt';
  text?: string;
  flexData?: any;
}

export interface OptimizationResult {
  summary: string;
  satisfactionRate: number;
  assignedShifts: Array<{
    date: string;
    slot: 'lunch' | 'dinner';
    staffId: string;
    role: 'kitchen' | 'hall';
    startTime: string;
    endTime: string;
    reason?: string;
  }>;
  unfilledSlots: Array<{
    date: string;
    slot: 'lunch' | 'dinner';
    role: 'kitchen' | 'hall';
    needed: number;
    recommendation: string;
  }>;
  adjustmentsMade: string[];
}
