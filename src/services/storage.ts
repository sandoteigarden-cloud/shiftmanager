import {
  Staff,
  ShiftPeriod,
  ShiftSubmission,
  ShiftRequirements,
  UrgentHelpPost,
  AssignedShift,
  LineChatMessage
} from '../types/shift';
import {
  INITIAL_STAFF,
  INITIAL_PERIOD,
  INITIAL_REQUIREMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_URGENT_POSTS,
  INITIAL_ASSIGNED_SHIFTS
} from '../mock/initialData';

const KEYS = {
  STAFF: 'shiftline_staff_v1',
  PERIOD: 'shiftline_period_v1',
  REQUIREMENTS: 'shiftline_reqs_v1',
  SUBMISSIONS: 'shiftline_subs_v1',
  ASSIGNED: 'shiftline_assigned_v1',
  URGENT: 'shiftline_urgent_v1',
  CHAT_MESSAGES: 'shiftline_chat_v1',
  NOTIFICATIONS_LOG: 'shiftline_notifs_v1',
  LINE_CONFIG: 'shiftline_line_config_v1'
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Failed to parse localStorage item: ${key}`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write to localStorage: ${key}`, e);
  }
}

export const StorageService = {
  getStaff: (): Staff[] => safeGet<Staff[]>(KEYS.STAFF, INITIAL_STAFF),
  saveStaff: (staff: Staff[]) => safeSet(KEYS.STAFF, staff),

  getPeriod: (): ShiftPeriod => safeGet<ShiftPeriod>(KEYS.PERIOD, INITIAL_PERIOD),
  savePeriod: (period: ShiftPeriod) => safeSet(KEYS.PERIOD, period),

  getRequirements: (): ShiftRequirements => safeGet<ShiftRequirements>(KEYS.REQUIREMENTS, INITIAL_REQUIREMENTS),
  saveRequirements: (reqs: ShiftRequirements) => safeSet(KEYS.REQUIREMENTS, reqs),

  getSubmissions: (): ShiftSubmission[] => {
    const subs = safeGet<ShiftSubmission[]>(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    return subs.map(sub => ({
      ...sub,
      entries: sub.entries.map(e => {
        let preference = e.preference;
        if (preference !== 'unavailable') {
          const isBoth = (e.slots?.includes('lunch') && e.slots?.includes('dinner')) ||
            (!!e.lunchInTime && !!e.dinnerInTime) ||
            (!!e.startTime && e.startTime.includes('/'));
          preference = isBoth ? 'available' : 'preferred_time';
        }
        return { ...e, preference };
      })
    }));
  },
  saveSubmissions: (subs: ShiftSubmission[]) => safeSet(KEYS.SUBMISSIONS, subs),

  addOrUpdateSubmission: (submission: ShiftSubmission): ShiftSubmission[] => {
    const subs = StorageService.getSubmissions();
    const existingIndex = subs.findIndex(s => s.staffId === submission.staffId && s.periodId === submission.periodId);
    let updated: ShiftSubmission[];
    if (existingIndex >= 0) {
      updated = [...subs];
      updated[existingIndex] = submission;
    } else {
      updated = [submission, ...subs];
    }
    StorageService.saveSubmissions(updated);
    return updated;
  },

  getAssignedShifts: (): AssignedShift[] => {
    const list = safeGet<AssignedShift[]>(KEYS.ASSIGNED, INITIAL_ASSIGNED_SHIFTS);
    return list.map(s => ({
      ...s,
      hours: s.slot === 'lunch' ? 4.0 : 4.5,
      startTime: s.startTime || (s.slot === 'lunch' ? '10:30' : '17:00')
    }));
  },
  saveAssignedShifts: (shifts: AssignedShift[]) => safeSet(KEYS.ASSIGNED, shifts),

  getUrgentPosts: (): UrgentHelpPost[] => safeGet<UrgentHelpPost[]>(KEYS.URGENT, INITIAL_URGENT_POSTS),
  saveUrgentPosts: (posts: UrgentHelpPost[]) => safeSet(KEYS.URGENT, posts),

  getChatMessages: (): LineChatMessage[] => {
    const defaultMessages: LineChatMessage[] = [
      {
        id: 'msg-init-1',
        sender: 'bot',
        timestamp: '9/20 10:00',
        type: 'text',
        text: 'こんにちは！さんど亭ガーデン シフト担当BOTです。\nアルバイトの皆さま、次回【10月前半(10/1〜10/15)】のシフト希望を受付中です！'
      },
      {
        id: 'msg-init-2',
        sender: 'bot',
        timestamp: '9/20 10:01',
        type: 'text',
        text: '【締切: 9月25日 23:59】\n下のメニューの「📅 シフト希望提出」をタップしてご入力ください。'
      }
    ];
    return safeGet<LineChatMessage[]>(KEYS.CHAT_MESSAGES, defaultMessages);
  },
  saveChatMessages: (msgs: LineChatMessage[]) => safeSet(KEYS.CHAT_MESSAGES, msgs),

  getNotificationsLog: (): any[] => safeGet<any[]>(KEYS.NOTIFICATIONS_LOG, []),
  addNotificationLog: (log: any) => {
    const current = safeGet<any[]>(KEYS.NOTIFICATIONS_LOG, []);
    safeSet(KEYS.NOTIFICATIONS_LOG, [log, ...current]);
  },

  resetAll: () => {
    localStorage.removeItem(KEYS.STAFF);
    localStorage.removeItem(KEYS.PERIOD);
    localStorage.removeItem(KEYS.REQUIREMENTS);
    localStorage.removeItem(KEYS.SUBMISSIONS);
    localStorage.removeItem(KEYS.ASSIGNED);
    localStorage.removeItem(KEYS.URGENT);
    localStorage.removeItem(KEYS.CHAT_MESSAGES);
    localStorage.removeItem(KEYS.NOTIFICATIONS_LOG);
  }
};
