import { Staff, ShiftPeriod, ShiftSubmission, ShiftRequirements, UrgentHelpPost, AssignedShift } from '../types/shift';

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: '佐藤 健一',
    role: 'kitchen',
    isLeader: true,
    hourlyWage: 1250,
    targetMonthlyHours: 150,
    maxConsecutiveDays: 5,
    isStudent: false,
    phone: '090-1234-5678',
    lineUserId: 'U1a2b3c4d5e6f7g8h9',
    lineConnected: true,
    color: '#0284c7', // sky
    notes: '厨房リーダー。炭火焼き・仕込み全般対応可。週5日フル勤務希望。'
  },
  {
    id: 'staff-2',
    name: '田中 葵',
    role: 'hall',
    isLeader: false,
    hourlyWage: 1150,
    targetMonthlyHours: 60,
    maxConsecutiveDays: 4,
    isStudent: true,
    phone: '080-2345-6789',
    lineUserId: 'U2b3c4d5e6f7g8h9i0',
    lineConnected: true,
    color: '#10b981', // emerald
    notes: '大学2年生。接客・レジ担当。平日夜（17時以降）および土日昼夜希望。'
  },
  {
    id: 'staff-3',
    name: '高橋 翔太',
    role: 'both',
    isLeader: false,
    hourlyWage: 1200,
    targetMonthlyHours: 90,
    maxConsecutiveDays: 5,
    isStudent: true,
    phone: '090-3456-7890',
    lineUserId: 'U3c4d5e6f7g8h9i0j1',
    lineConnected: true,
    color: '#f59e0b', // amber
    notes: '大学4年生。キッチンもホールもこなせる万能戦力。調理場メイン。'
  },
  {
    id: 'staff-4',
    name: '渡辺 美咲',
    role: 'hall',
    isLeader: true,
    hourlyWage: 1200,
    targetMonthlyHours: 75,
    maxConsecutiveDays: 4,
    isStudent: true,
    phone: '080-4567-8901',
    lineUserId: 'U4d5e6f7g8h9i0j1k2',
    lineConnected: true,
    color: '#ec4899', // pink
    notes: 'ホールリーダー。常連客対応・新人教育担当。金土ディナー率先。'
  },
  {
    id: 'staff-5',
    name: '伊藤 蓮',
    role: 'both',
    isLeader: false,
    hourlyWage: 1200,
    targetMonthlyHours: 130,
    maxConsecutiveDays: 5,
    isStudent: false,
    phone: '090-5678-9012',
    lineUserId: 'U5e6f7g8h9i0j1k2l3',
    lineConnected: true,
    color: '#8b5cf6', // violet
    notes: 'フリーター。深夜締め作業・洗い場・ドリンク場。ラストまで可。'
  },
  {
    id: 'staff-6',
    name: '山本 結衣',
    role: 'kitchen',
    isLeader: false,
    hourlyWage: 1150,
    targetMonthlyHours: 50,
    maxConsecutiveDays: 3,
    isStudent: true,
    phone: '080-6789-0123',
    lineUserId: 'U6f7g8h9i0j1k2l3m4',
    lineConnected: true,
    color: '#06b6d4', // cyan
    notes: '大学3年生。平日ランチの仕込み・揚げ場担当。'
  },
  {
    id: 'staff-7',
    name: '中村 陽菜',
    role: 'hall',
    isLeader: false,
    hourlyWage: 1100,
    targetMonthlyHours: 40,
    maxConsecutiveDays: 3,
    isStudent: true,
    phone: '070-7890-1234',
    lineUserId: 'U7g8h9i0j1k2l3m4n5',
    lineConnected: false,
    color: '#f97316', // orange
    notes: '高校3年生（労基法により21:30完全退勤厳守）。平日ディナー前半。'
  },
  {
    id: 'staff-8',
    name: '小林 大地',
    role: 'both',
    isLeader: false,
    hourlyWage: 1200,
    targetMonthlyHours: 45,
    maxConsecutiveDays: 2,
    isStudent: false,
    phone: '090-8901-2345',
    lineUserId: 'U8h9i0j1k2l3m4n5o6',
    lineConnected: true,
    color: '#64748b', // slate
    notes: '副業Wワーカー。土日・祝日のディナー限定でがっつり入る希望。'
  }
];

export const INITIAL_PERIOD: ShiftPeriod = {
  id: 'period-2026-10-1',
  title: '2026年10月前半 (10/1〜10/15)',
  startDate: '2026-10-01',
  endDate: '2026-10-15',
  deadline: '2026-09-25 23:59',
  status: 'adjusting',
  targetDaysCount: 15
};

export const INITIAL_REQUIREMENTS: ShiftRequirements = {
  lunchWeekday: { kitchen: 2, hall: 2 },
  lunchWeekend: { kitchen: 2, hall: 3 },
  dinnerWeekday: { kitchen: 2, hall: 3 },
  dinnerWeekend: { kitchen: 3, hall: 4 }
};

// Generate realistic submissions
const RAW_INITIAL_SUBMISSIONS: ShiftSubmission[] = [
  {
    id: 'sub-staff-1',
    staffId: 'staff-1',
    periodId: 'period-2026-10-1',
    submittedAt: '2026-09-21 14:32',
    overallComment: '基本いつでも入れます！10/7(水)だけ免許更新のため休みにしてください。',
    entries: [
      { date: '2026-10-01', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-02', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-03', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-04', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-05', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-06', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-07', preference: 'unavailable', note: '免許更新のため休み希望' },
      { date: '2026-10-08', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-09', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-10', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-11', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-12', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-13', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-14', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-15', preference: 'available', slots: ['dinner'] }
    ]
  },
  {
    id: 'sub-staff-2',
    staffId: 'staff-2',
    periodId: 'period-2026-10-1',
    submittedAt: '2026-09-22 09:15',
    overallComment: '10/8〜10/10は中間テストのため休み希望です。その分前半と週末多めに入れます！',
    entries: [
      { date: '2026-10-01', preference: 'preferred_time', startTime: '18:00', endTime: '23:00', slots: ['dinner'], note: '授業終了後18:00〜' },
      { date: '2026-10-02', preference: 'preferred_time', startTime: '17:00', endTime: '23:00', slots: ['dinner'] },
      { date: '2026-10-03', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-04', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-05', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-06', preference: 'unavailable', note: 'ゼミ発表準備' },
      { date: '2026-10-07', preference: 'unavailable', note: 'テスト勉強' },
      { date: '2026-10-08', preference: 'unavailable', note: '中間試験' },
      { date: '2026-10-09', preference: 'unavailable', note: '中間試験' },
      { date: '2026-10-10', preference: 'unavailable', note: '中間試験' },
      { date: '2026-10-11', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-12', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-13', preference: 'preferred_time', startTime: '18:00', endTime: '23:00', slots: ['dinner'] },
      { date: '2026-10-14', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-15', preference: 'preferred_time', startTime: '17:00', endTime: '22:00', slots: ['dinner'] }
    ]
  },
  {
    id: 'sub-staff-3',
    staffId: 'staff-3',
    periodId: 'period-2026-10-1',
    submittedAt: '2026-09-22 18:40',
    overallComment: 'キッチン・ホールどちらでも対応可能です。金土ディナー入れます！',
    entries: [
      { date: '2026-10-01', preference: 'unavailable' },
      { date: '2026-10-02', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-03', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-04', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-05', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-06', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-07', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-08', preference: 'unavailable' },
      { date: '2026-10-09', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-10', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-11', preference: 'available', slots: ['lunch', 'dinner'] },
      { date: '2026-10-12', preference: 'unavailable' },
      { date: '2026-10-13', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-14', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-15', preference: 'available', slots: ['dinner'] }
    ]
  },
  {
    id: 'sub-staff-4',
    staffId: 'staff-4',
    periodId: 'period-2026-10-1',
    submittedAt: '2026-09-23 11:20',
    overallComment: '金・土・日のディナーは全日入れます。平日は火水木で調整お願いします。',
    entries: [
      { date: '2026-10-01', preference: 'unavailable' },
      { date: '2026-10-02', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-03', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-04', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-05', preference: 'unavailable' },
      { date: '2026-10-06', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-07', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-08', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-09', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-10', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-11', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-12', preference: 'unavailable' },
      { date: '2026-10-13', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-14', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-15', preference: 'available', slots: ['dinner'] }
    ]
  },
  {
    id: 'sub-staff-5',
    staffId: 'staff-5',
    periodId: 'period-2026-10-1',
    submittedAt: '2026-09-23 20:05',
    overallComment: '締め・ラスト作業大歓迎です。週4〜5日しっかり稼ぎたいです。',
    entries: [
      { date: '2026-10-01', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-02', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-03', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-04', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-05', preference: 'unavailable', note: '実家帰省' },
      { date: '2026-10-06', preference: 'unavailable', note: '実家帰省' },
      { date: '2026-10-07', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-08', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-09', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-10', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-11', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-12', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-13', preference: 'unavailable' },
      { date: '2026-10-14', preference: 'available', slots: ['dinner'] },
      { date: '2026-10-15', preference: 'available', slots: ['dinner'] }
    ]
  },
  {
    id: 'sub-staff-6',
    staffId: 'staff-6',
    periodId: 'period-2026-10-1',
    submittedAt: '2026-09-24 16:50',
    overallComment: '平日ランチ帯（10:30〜15:00）メインで希望します。',
    entries: [
      { date: '2026-10-01', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-02', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-03', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-04', preference: 'unavailable' },
      { date: '2026-10-05', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-06', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-07', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-08', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-09', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-10', preference: 'unavailable' },
      { date: '2026-10-11', preference: 'unavailable' },
      { date: '2026-10-12', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-13', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-14', preference: 'available', slots: ['lunch'] },
      { date: '2026-10-15', preference: 'available', slots: ['lunch'] }
    ]
  }
  // Note: staff-7 (中村 陽菜) and staff-8 (小林 大地) have NOT submitted yet!
  // This demonstrates the 1-click LINE reminder functionality.
];

// Enforce rule: 通しOKの場合は○ (available), ランチ・ディナーどちらかだけの場合は△ (preferred_time), 休みは✕ (unavailable)
export const INITIAL_SUBMISSIONS: ShiftSubmission[] = RAW_INITIAL_SUBMISSIONS.map(sub => ({
  ...sub,
  entries: sub.entries.map(e => {
    let preference = e.preference;
    if (preference !== 'unavailable') {
      const isBoth = (e.slots?.includes('lunch') && e.slots?.includes('dinner')) || (!!e.lunchInTime && !!e.dinnerInTime);
      preference = isBoth ? 'available' : 'preferred_time';
    }
    return { ...e, preference };
  })
}));

export const INITIAL_URGENT_POSTS: UrgentHelpPost[] = [
  {
    id: 'urgent-1',
    periodId: 'period-2026-10-1',
    date: '2026-10-04',
    slot: 'dinner',
    role: 'hall',
    startTime: '17:30',
    endTime: '23:00',
    bonusWagePerHour: 0,
    reason: '団体宴会32名予約追加のためホール1名急募！',
    status: 'open',
    createdAt: '2026-09-24 15:00'
  }
];

// Initial pre-assigned shifts (partial, before optimization)
export const INITIAL_ASSIGNED_SHIFTS: AssignedShift[] = [
  {
    id: 'as-1',
    periodId: 'period-2026-10-1',
    staffId: 'staff-1',
    date: '2026-10-01',
    slot: 'lunch',
    role: 'kitchen',
    startTime: '10:30',
    endTime: '14:30',
    hours: 4.0
  },
  {
    id: 'as-2',
    periodId: 'period-2026-10-1',
    staffId: 'staff-6',
    date: '2026-10-01',
    slot: 'lunch',
    role: 'kitchen',
    startTime: '10:00',
    endTime: '14:00',
    hours: 4.0
  },
  {
    id: 'as-3',
    periodId: 'period-2026-10-1',
    staffId: 'staff-1',
    date: '2026-10-01',
    slot: 'dinner',
    role: 'kitchen',
    startTime: '17:00',
    endTime: '21:30',
    hours: 4.5
  },
  {
    id: 'as-4',
    periodId: 'period-2026-10-1',
    staffId: 'staff-2',
    date: '2026-10-01',
    slot: 'dinner',
    role: 'hall',
    startTime: '18:00',
    endTime: '22:30',
    hours: 4.5
  },
  {
    id: 'as-5',
    periodId: 'period-2026-10-1',
    staffId: 'staff-5',
    date: '2026-10-01',
    slot: 'dinner',
    role: 'hall',
    startTime: '17:30',
    endTime: '22:00',
    hours: 4.5
  }
];
