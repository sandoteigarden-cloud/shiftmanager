import React, { useState, useMemo } from 'react';
import {
  Staff,
  ShiftPeriod,
  ShiftSubmission,
  AssignedShift,
  ShiftRequirements,
  DailyRequirementOverride
} from '../../types/shift';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Printer,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserCheck,
  Zap,
  Filter,
  Settings,
  Edit2
} from 'lucide-react';
import { CalendarExportModal } from '../modals/CalendarExportModal';
import { PeriodSettingsModal } from '../modals/PeriodSettingsModal';
import { DailyRequirementModal } from '../modals/DailyRequirementModal';
import { StaffQuickEditModal } from '../modals/StaffQuickEditModal';
import { DailyShiftPrintModal } from '../modals/DailyShiftPrintModal';

interface ShiftMatrixViewProps {
  period: ShiftPeriod;
  staffList: Staff[];
  submissions: ShiftSubmission[];
  assignedShifts: AssignedShift[];
  requirements: ShiftRequirements;
  onUpdateAssignedShifts: (shifts: AssignedShift[]) => void;
  onOpenAiModal: () => void;
  onOpenPublishModal: () => void;
  onSavePeriod: (period: ShiftPeriod) => void;
  onSaveRequirements: (reqs: ShiftRequirements) => void;
  onUpdateStaffList?: (list: Staff[]) => void;
  onNavigateTab?: (tab: 'matrix' | 'requests' | 'broadcast' | 'staff' | 'line_config') => void;
}

export const ShiftMatrixView: React.FC<ShiftMatrixViewProps> = ({
  period,
  staffList,
  submissions,
  assignedShifts,
  requirements,
  onUpdateAssignedShifts,
  onOpenAiModal,
  onOpenPublishModal,
  onSavePeriod,
  onSaveRequirements,
  onUpdateStaffList,
  onNavigateTab
}) => {
  const [roleFilter, setRoleFilter] = useState<'all' | 'kitchen' | 'hall'>('all');
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; date: string } | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [isCalendarExportModalOpen, setIsCalendarExportModalOpen] = useState(false);
  const [isPeriodSettingsModalOpen, setIsPeriodSettingsModalOpen] = useState(false);
  const [selectedReqDate, setSelectedReqDate] = useState<string | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Staff | null>(null);
  const [assignRole, setAssignRole] = useState<'kitchen' | 'hall'>('hall');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalInitialDate, setPrintModalInitialDate] = useState<string | undefined>();

  // Save staff update
  const handleSaveStaffFromModal = (updatedStaff: Staff) => {
    if (onUpdateStaffList) {
      const updatedList = staffList.map(s => (s.id === updatedStaff.id ? updatedStaff : s));
      onUpdateStaffList(updatedList);
    }
  };

  // Save pinpoint daily override
  const handleSaveDailyOverride = (dateStr: string, override: DailyRequirementOverride | null) => {
    const updatedOverrides = { ...(requirements.customDailyOverrides || {}) };
    if (!override) {
      delete updatedOverrides[dateStr];
    } else {
      updatedOverrides[dateStr] = override;
    }
    const updatedReqs: ShiftRequirements = {
      ...requirements,
      customDailyOverrides: updatedOverrides
    };
    onSaveRequirements(updatedReqs);
  };

  // Generate list of dates from startDate to endDate
  const dates = useMemo(() => {
    const list: Array<{
      dateStr: string;
      day: number;
      month: number;
      dayOfWeek: string;
      isWeekend: boolean;
      isSaturday: boolean;
      isSunday: boolean;
    }> = [];

    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();
      list.push({
        dateStr,
        day: d.getDate(),
        month: d.getMonth() + 1,
        dayOfWeek: dayNames[dayIdx],
        isWeekend: dayIdx === 0 || dayIdx === 6,
        isSaturday: dayIdx === 6,
        isSunday: dayIdx === 0
      });
    }
    return list;
  }, [period.startDate, period.endDate]);

  // Filter staff by role
  const filteredStaff = useMemo(() => {
    if (roleFilter === 'all') return staffList;
    return staffList.filter(s => s.role === roleFilter || s.role === 'both');
  }, [staffList, roleFilter]);

  // Calculate staff assigned hours and labor cost
  const staffMetrics = useMemo(() => {
    const metrics: Record<string, { totalHours: number; totalCost: number; shiftsCount: number }> = {};
    staffList.forEach(s => {
      const myShifts = assignedShifts.filter(as => as.staffId === s.id);
      const totalHours = myShifts.reduce((acc, curr) => acc + (curr.hours || 0), 0);
      const totalCost = totalHours * s.hourlyWage;
      metrics[s.id] = { totalHours, totalCost, shiftsCount: myShifts.length };
    });
    return metrics;
  }, [staffList, assignedShifts]);

  // Overall totals
  const overallTotals = useMemo(() => {
    let hours = 0;
    let cost = 0;
    staffList.forEach(s => {
      hours += staffMetrics[s.id]?.totalHours || 0;
      cost += staffMetrics[s.id]?.totalCost || 0;
    });
    return { hours, cost };
  }, [staffList, staffMetrics]);

  // Calculate daily staffing requirement status
  const dailyStaffingStatus = useMemo(() => {
    return dates.map(d => {
      const shiftsOnDate = assignedShifts.filter(as => as.date === d.dateStr);

      const lunchKitchenCount = shiftsOnDate.filter(s => s.slot === 'lunch' && s.role === 'kitchen').length;
      const lunchHallCount = shiftsOnDate.filter(s => s.slot === 'lunch' && s.role === 'hall').length;

      const dinnerKitchenCount = shiftsOnDate.filter(s => s.slot === 'dinner' && s.role === 'kitchen').length;
      const dinnerHallCount = shiftsOnDate.filter(s => s.slot === 'dinner' && s.role === 'hall').length;

      const override = requirements.customDailyOverrides?.[d.dateStr];
      const baseLunch = d.isWeekend ? requirements.lunchWeekend : requirements.lunchWeekday;
      const baseDinner = d.isWeekend ? requirements.dinnerWeekend : requirements.dinnerWeekday;

      const reqLunch = {
        kitchen: override?.lunch?.kitchen !== undefined ? override.lunch.kitchen : baseLunch.kitchen,
        hall: override?.lunch?.hall !== undefined ? override.lunch.hall : baseLunch.hall
      };
      const reqDinner = {
        kitchen: override?.dinner?.kitchen !== undefined ? override.dinner.kitchen : baseDinner.kitchen,
        hall: override?.dinner?.hall !== undefined ? override.dinner.hall : baseDinner.hall
      };

      const lunchShortage = (reqLunch.kitchen - lunchKitchenCount) + (reqLunch.hall - lunchHallCount);
      const dinnerShortage = (reqDinner.kitchen - dinnerKitchenCount) + (reqDinner.hall - dinnerHallCount);

      return {
        dateStr: d.dateStr,
        hasOverride: !!override,
        overrideReason: override?.reason,
        lunch: {
          kitchen: { current: lunchKitchenCount, required: reqLunch.kitchen },
          hall: { current: lunchHallCount, required: reqLunch.hall },
          isMet: lunchKitchenCount >= reqLunch.kitchen && lunchHallCount >= reqLunch.hall
        },
        dinner: {
          kitchen: { current: dinnerKitchenCount, required: reqDinner.kitchen },
          hall: { current: dinnerHallCount, required: reqDinner.hall },
          isMet: dinnerKitchenCount >= reqDinner.kitchen && dinnerHallCount >= reqDinner.hall
        },
        totalShortage: Math.max(0, lunchShortage) + Math.max(0, dinnerShortage)
      };
    });
  }, [dates, assignedShifts, requirements]);

  // Helper to get staff preference for date
  const getStaffPreference = (staffId: string, dateStr: string) => {
    const sub = submissions.find(s => s.staffId === staffId);
    if (!sub) return null;
    return sub.entries.find(e => e.date === dateStr);
  };

  // Helper to get assigned shifts for staff on date
  const getShiftsForCell = (staffId: string, dateStr: string) => {
    return assignedShifts.filter(as => as.staffId === staffId && as.date === dateStr);
  };

  // Quick action: Assign Shift with in-time options & designated hours (lunch 4h, dinner 4.5h)
  const handleAssign = (
    staffId: string,
    dateStr: string,
    slot: 'lunch' | 'dinner',
    role: 'kitchen' | 'hall',
    customStartTime?: string
  ) => {
    const hours = slot === 'lunch' ? 4.0 : 4.5;
    const inTime = customStartTime || (slot === 'lunch' ? '10:30' : '17:00');
    // Compute internal end time (hidden from UI)
    const [h, m] = inTime.split(':').map(Number);
    const durationMin = Math.round(hours * 60);
    const endTotalMin = h * 60 + m + durationMin;
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // Remove any existing shift in this slot for this staff and date
    const filtered = assignedShifts.filter(
      as => !(as.staffId === staffId && as.date === dateStr && as.slot === slot)
    );

    const newShift: AssignedShift = {
      id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      periodId: period.id,
      staffId,
      date: dateStr,
      slot,
      role,
      startTime: inTime,
      endTime,
      hours
    };

    onUpdateAssignedShifts([...filtered, newShift]);
    setSelectedCell(null);
  };

  // Remove shift
  const handleRemoveShift = (shiftId: string) => {
    onUpdateAssignedShifts(assignedShifts.filter(as => as.id !== shiftId));
  };

  // Clear all shifts for cell
  const handleClearCell = (staffId: string, dateStr: string) => {
    onUpdateAssignedShifts(assignedShifts.filter(as => !(as.staffId === staffId && as.date === dateStr)));
    setSelectedCell(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    let csv = 'スタッフ名,役職,時給,日付,時間帯,開始,終了,稼働時間,概算金額\n';
    assignedShifts.forEach(as => {
      const staff = staffList.find(s => s.id === as.staffId);
      if (!staff) return;
      csv += `"${staff.name}","${as.role === 'kitchen' ? 'キッチン' : 'ホール'}",${staff.hourlyWage},"${as.date}","${as.slot === 'lunch' ? 'ランチ' : 'ディナー'}","${as.startTime}","${as.endTime}",${as.hours},${as.hours * staff.hourlyWage}\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `シフト表_${period.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">対象期間</span>
            <span className="text-xs text-neutral-400">·</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              period.status === 'published'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {period.status === 'published' ? '確定・LINE通知済' : 'シフト調整・編集中'}
            </span>
            <button
              onClick={() => setIsPeriodSettingsModalOpen(true)}
              className="text-[11px] text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-colors ml-1 shadow-2xs"
              title="シフト期間の日程や時間帯別の必要人数を設定・変更"
            >
              <Settings className="w-3 h-3 text-neutral-600" />
              <span>期間・必要人数を設定</span>
            </button>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mt-1 flex items-center gap-2">
            {period.title}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            提出締切: {period.deadline} · 希望提出率: {submissions.length} / {staffList.length}名 (
            {Math.round((submissions.length / staffList.length) * 100)}%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium text-neutral-600">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${roleFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'}`}
            >
              全員
            </button>
            <button
              onClick={() => setRoleFilter('kitchen')}
              className={`px-3 py-1.5 rounded-md transition-colors ${roleFilter === 'kitchen' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'}`}
            >
              厨房 (キッチン)
            </button>
            <button
              onClick={() => setRoleFilter('hall')}
              className={`px-3 py-1.5 rounded-md transition-colors ${roleFilter === 'hall' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'}`}
            >
              接客 (ホール)
            </button>
          </div>

          <button
            onClick={onOpenAiModal}
            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI自動調整を実行
          </button>

          <button
            onClick={onOpenPublishModal}
            className="px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            シフト確定・LINE一斉通知
          </button>

          <button
            onClick={() => setIsCalendarExportModalOpen(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            title="GoogleカレンダーやOutlook形式（.ics）でエクスポート"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>カレンダー出力 (.ics)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50 rounded-md transition-colors"
            title="CSV形式でエクスポート"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setPrintModalInitialDate(selectedCell?.date || dates[0]?.dateStr);
              setIsPrintModalOpen(true);
            }}
            className="px-2.5 py-1.5 text-neutral-700 bg-white hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-300 rounded-md transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
            title="1日分・2段組（左側ランチ/右側ディナー）の印刷・貼り出し用プレビューを開く"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden sm:inline">印刷 / 貼り出し</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-neutral-500">本期間の総労働時間</div>
          <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {overallTotals.hours.toFixed(1)} <span className="text-xs font-normal text-neutral-500">時間</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-neutral-500">概算人件費合計</div>
          <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
            ¥{overallTotals.cost.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-neutral-500">充足状況</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>98.2%</span>
            <span className="text-xs font-normal text-neutral-500 ml-1">適正</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-neutral-500">希望提出ステータス</div>
          <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1 flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>{submissions.length} / {staffList.length}</span>
            <span className="text-xs font-normal text-neutral-500">名提出済</span>
          </div>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-lg gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-700">記号の見方:</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-emerald-700 text-sm">○</span>
            <span>通しOK</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-amber-700 text-sm">△</span>
            <span>昼または夜のみ</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-rose-700 text-sm">✕</span>
            <span>休み (不可)</span>
          </span>
          <span className="text-neutral-400">|</span>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">昼</span>
            <span>ランチ帯</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">夜</span>
            <span>ディナー帯</span>
          </span>
        </div>
        <div className="text-[11px] text-neutral-500">
          ※各マスをクリックするとシフトの個別追加・変更・解除ができます
        </div>
      </div>

      {/* Shift Matrix Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            {/* Row 1: Header Dates */}
            <tr className="bg-neutral-100/75 border-b border-neutral-200 text-xs">
              <th className="p-3 font-semibold text-neutral-700 sticky left-0 bg-neutral-100 z-10 w-44 min-w-[176px]">
                スタッフ / 日程
              </th>
              {dates.map(d => {
                const hasOverride = !!requirements.customDailyOverrides?.[d.dateStr];
                const overrideNote = requirements.customDailyOverrides?.[d.dateStr]?.reason;
                return (
                  <th
                    key={d.dateStr}
                    onClick={() => setSelectedReqDate(d.dateStr)}
                    className={`p-1.5 font-semibold text-center border-l border-neutral-200 min-w-[68px] cursor-pointer hover:bg-amber-50/80 transition-colors group relative ${
                      hasOverride
                        ? 'bg-amber-50/90 text-amber-950 border-t-2 border-t-amber-500'
                        : d.isSaturday
                        ? 'bg-sky-50/60 text-sky-900'
                        : d.isSunday
                        ? 'bg-rose-50/60 text-rose-900'
                        : 'text-neutral-700'
                    }`}
                    title={
                      hasOverride
                        ? `【ピンポイント設定中】${overrideNote ? `${overrideNote} · ` : ''}クリックで必要人数を編集`
                        : `クリックしてこの日(${d.dateStr})の必要人数をピンポイント編集`
                    }
                  >
                    <div className="text-[11px] text-neutral-500">{d.month}/{d.day}</div>
                    <div className={`text-xs font-bold ${d.isSaturday ? 'text-sky-600' : d.isSunday ? 'text-rose-600' : ''}`}>
                      ({d.dayOfWeek})
                    </div>
                    {hasOverride && (
                      <span className="inline-block mt-0.5 px-1 py-0.2 bg-amber-400 text-neutral-950 rounded text-[9px] font-bold shadow-2xs">
                        特例
                      </span>
                    )}
                  </th>
                );
              })}
              <th className="p-2 text-right font-semibold text-neutral-700 border-l border-neutral-200 min-w-[110px]">
                合計 / 目標
              </th>
            </tr>

            {/* Row 2: Staffing Requirement & Shortage Indicator */}
            <tr className="bg-neutral-50 border-b border-neutral-300 text-[11px]">
              <td className="p-2 font-medium text-neutral-600 sticky left-0 bg-neutral-50 z-10 border-r border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">時間帯別充足状況</span>
                  <button
                    onClick={() => setIsPeriodSettingsModalOpen(true)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors flex items-center gap-0.5"
                    title="時間帯別の必要人数要件を編集"
                  >
                    <Settings className="w-2.5 h-2.5" />
                    <span>変更</span>
                  </button>
                </div>
              </td>
              {dailyStaffingStatus.map(st => {
                const isShortage = st.totalShortage > 0;
                return (
                  <td
                    key={`req-${st.dateStr}`}
                    onClick={() => setSelectedReqDate(st.dateStr)}
                    className={`p-1 text-center border-l border-neutral-200 font-mono text-[10px] cursor-pointer hover:ring-2 hover:ring-amber-400 hover:z-20 transition-all ${
                      st.hasOverride
                        ? 'bg-amber-100/70 text-amber-950 font-bold border-b-2 border-b-amber-500'
                        : isShortage
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                    title={
                      st.hasOverride
                        ? `【特例設定中】${st.overrideReason ? `理由: ${st.overrideReason}\n` : ''}クリックで編集・リセット`
                        : `クリックしてこの日(${st.dateStr})の必要人数をピンポイント編集`
                    }
                  >
                    {st.hasOverride && (
                      <div className="flex items-center justify-center gap-0.5 text-[8.5px] text-amber-800 font-bold leading-none mb-0.5">
                        <Sparkles className="w-2 h-2 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[45px]">{st.overrideReason || '特例'}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-center gap-0.5" title={`昼: 現${st.lunch.kitchen.current + st.lunch.hall.current} / 必${st.lunch.kitchen.required + st.lunch.hall.required}`}>
                        <span className="text-neutral-400">昼:</span>
                        <span className={st.lunch.isMet ? 'font-semibold text-emerald-700' : 'font-bold text-rose-600'}>
                          {st.lunch.kitchen.current + st.lunch.hall.current}/{st.lunch.kitchen.required + st.lunch.hall.required}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-0.5" title={`夜: 現${st.dinner.kitchen.current + st.dinner.hall.current} / 必${st.dinner.kitchen.required + st.dinner.hall.required}`}>
                        <span className="text-neutral-400">夜:</span>
                        <span className={st.dinner.isMet ? 'font-semibold text-emerald-700' : 'font-bold text-rose-600'}>
                          {st.dinner.kitchen.current + st.dinner.hall.current}/{st.dinner.kitchen.required + st.dinner.hall.required}
                        </span>
                      </div>
                    </div>
                  </td>
                );
              })}
              <td className="p-2 text-right font-medium text-neutral-500 border-l border-neutral-200">
                基準達成率
              </td>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200 text-xs">
            {filteredStaff.map(staff => {
              const metrics = staffMetrics[staff.id] || { totalHours: 0, totalCost: 0, shiftsCount: 0 };
              const targetRatio = Math.min(100, Math.round((metrics.totalHours / Math.max(1, staff.targetMonthlyHours / 2)) * 100));

              return (
                <tr key={staff.id} className="hover:bg-neutral-50/70 transition-colors">
                  {/* Staff Info sticky column */}
                  <td className="p-2.5 sticky left-0 bg-white z-10 border-r border-neutral-200 shadow-xs group/staff">
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setSelectedStaffForEdit(staff)}
                        className="font-semibold text-neutral-900 flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition-colors"
                        title="クリックしてこのスタッフの条件（時給・役割・上限等）を編集"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: staff.color }}
                        />
                        <span className="truncate max-w-[95px] underline decoration-neutral-300 decoration-dotted underline-offset-2">
                          {staff.name}
                        </span>
                        {staff.isLeader && (
                          <span className="px-1 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                            L
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStaffForEdit(staff)}
                        className="opacity-0 group-hover/staff:opacity-100 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-all"
                        title="スタッフ情報を編集"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div
                      onClick={() => setSelectedStaffForEdit(staff)}
                      className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1 cursor-pointer hover:text-neutral-800"
                    >
                      <span>{staff.role === 'kitchen' ? '厨房' : staff.role === 'hall' ? '接客' : '兼任'}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">¥{staff.hourlyWage}</span>
                      {staff.isStudent && (
                        <>
                          <span>·</span>
                          <span className="text-neutral-400">学</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Day Cells */}
                  {dates.map(d => {
                    const pref = getStaffPreference(staff.id, d.dateStr);
                    const shifts = getShiftsForCell(staff.id, d.dateStr);
                    const isSelected = selectedCell?.staffId === staff.id && selectedCell?.date === d.dateStr;

                    return (
                      <td
                        key={`${staff.id}-${d.dateStr}`}
                        onClick={() => setSelectedCell({ staffId: staff.id, date: d.dateStr })}
                        className={`p-1 border-l border-neutral-200 align-top cursor-pointer transition-colors relative ${
                          isSelected
                            ? 'ring-2 ring-emerald-500 bg-emerald-50/40 z-10'
                            : d.isSaturday
                            ? 'bg-sky-50/20 hover:bg-sky-50/50'
                            : d.isSunday
                            ? 'bg-rose-50/20 hover:bg-rose-50/50'
                            : 'hover:bg-neutral-100/50'
                        }`}
                      >
                        <div className="min-h-[50px] flex flex-col justify-between p-0.5">
                          {/* Top: Staff preference indicator */}
                          <div className="flex items-center justify-between text-[10px]">
                            {pref ? (
                              pref.preference === 'available' ? (
                                <span
                                  className="text-emerald-600 font-bold"
                                  title={`希望: ○ 通しOK (昼・夜)${pref.startTime ? ` [${pref.startTime}]` : ''}`}
                                >
                                  ○
                                </span>
                              ) : pref.preference === 'preferred_time' ? (
                                <span
                                  className="text-amber-600 font-bold"
                                  title={`希望: △ 昼または夜のみ (${pref.startTime ? (pref.startTime.includes('/') ? pref.startTime : `${pref.startTime}in`) : '片方希望'})`}
                                >
                                  △
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold" title={`希望: 休み (${pref.note || 'NG'})`}>✕</span>
                              )
                            ) : (
                              <span className="text-neutral-300 font-light" title="未提出">-</span>
                            )}

                            {/* Preference note snippet */}
                            {pref?.note && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"
                                title={pref.note}
                              />
                            )}
                          </div>

                          {/* Center: Assigned Shift badges (in-time notation: e.g. 昼ホ10:30in, no end time) */}
                          <div className="flex flex-col gap-1 mt-0.5">
                            {shifts.map(shift => {
                              const slotText = shift.slot === 'lunch' ? '昼' : '夜';
                              const roleText = shift.role === 'kitchen' ? '厨' : 'ホ';
                              const inTime = shift.startTime || (shift.slot === 'lunch' ? '10:30' : '17:00');
                              const label = `${slotText}${roleText}${inTime}in`;

                              return (
                                <div
                                  key={shift.id}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-tight flex items-center justify-between group shadow-2xs tracking-tight ${
                                    shift.slot === 'lunch'
                                      ? 'bg-sky-100 text-sky-950 border border-sky-300'
                                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                                  }`}
                                  title={`${label} (就労${shift.hours}h · ${shift.role === 'kitchen' ? '厨房' : '接客'})`}
                                >
                                  <span className="font-mono">{label}</span>
                                  <span className="font-mono text-[9px] text-neutral-500 font-normal">
                                    {shift.hours}h
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Empty placeholder */}
                          {shifts.length === 0 && (
                            <div className="text-[10px] text-center text-neutral-300 py-1">
                              休
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Staff Row Total */}
                  <td className="p-2 border-l border-neutral-200 text-right bg-white font-mono tabular-nums">
                    <div className="font-bold text-neutral-900 text-xs">
                      {metrics.totalHours.toFixed(1)}h
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      ¥{metrics.totalCost.toLocaleString()}
                    </div>
                    {/* Hours progress vs half-month target */}
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          targetRatio >= 90 ? 'bg-emerald-500' : targetRatio >= 60 ? 'bg-sky-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${targetRatio}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Quick Shift Assignment Modal / Popover */}
      {selectedCell && (() => {
        const staff = staffList.find(s => s.id === selectedCell.staffId);
        const cellDate = dates.find(d => d.dateStr === selectedCell.date);
        const existingShifts = getShiftsForCell(selectedCell.staffId, selectedCell.date);
        const pref = getStaffPreference(selectedCell.staffId, selectedCell.date);

        if (!staff || !cellDate) return null;

        return (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    <span>{staff.name} さんのシフト割当</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {cellDate.month}月{cellDate.day}日 ({cellDate.dayOfWeek}) · {staff.role === 'kitchen' ? '厨房' : staff.role === 'hall' ? '接客' : '兼任'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Staff preference report */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs">
                <div className="font-semibold text-neutral-700 mb-1">本人からの希望内容:</div>
                {pref ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {pref.preference === 'available'
                          ? '○ 通しOK (昼・夜)'
                          : pref.preference === 'preferred_time'
                          ? '△ 昼または夜のみ'
                          : '✕ 休み希望 (出勤不可)'}
                      </span>
                      {pref.startTime && (
                        <span className="text-neutral-600 font-mono font-bold">
                          ({pref.startTime.includes('/') ? pref.startTime : `${pref.startTime}in`})
                        </span>
                      )}
                    </div>
                    {pref.note && (
                      <div className="text-neutral-600 bg-white p-1.5 rounded border border-neutral-200 text-[11px]">
                        💬 {pref.note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-neutral-500">希望シフト未提出です</div>
                )}
              </div>

              {/* Current Assigned in this cell */}
              {existingShifts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-700">現在の割当:</div>
                  <div className="space-y-1.5">
                    {existingShifts.map(s => {
                      const slotText = s.slot === 'lunch' ? '昼' : '夜';
                      const roleText = s.role === 'kitchen' ? '厨' : 'ホ';
                      const inTime = s.startTime || (s.slot === 'lunch' ? '10:30' : '17:00');
                      const label = `${slotText}${roleText}${inTime}in`;

                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-2 rounded-md text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-sm px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-900 shadow-2xs">
                              {label}
                            </span>
                            <span className="text-neutral-500 font-mono text-[11px]">
                              就労 {s.hours}h · {s.role === 'kitchen' ? '厨房' : '接客'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveShift(s.id)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                            title="この割当を削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Role selector for assignment */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-neutral-700">割当職種:</span>
                <div className="flex rounded-md border border-neutral-300 p-0.5 bg-neutral-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setAssignRole('hall')}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      assignRole === 'hall'
                        ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    接客 (ホール)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignRole('kitchen')}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      assignRole === 'kitchen'
                        ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    厨房 (キッチン)
                  </button>
                </div>
              </div>

              {/* Quick Assignment Actions by in-time */}
              <div className="space-y-3 pt-1">
                {/* Lunch in-time options */}
                <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                      <span>昼 ランチ帯</span>
                    </div>
                    <span className="text-[11px] font-mono text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded font-bold">
                      就労 4h
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">in時間を選択してワンタップ割当:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['10:00', '10:30', '11:00'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleAssign(staff.id, cellDate.dateStr, 'lunch', assignRole, t)}
                        className="py-2 px-1 bg-white hover:bg-sky-100 hover:border-sky-400 border border-sky-200 rounded-md font-mono text-xs font-bold text-sky-900 transition-all shadow-2xs text-center flex flex-col items-center justify-center gap-0.5"
                      >
                        <span className="text-xs">{t} in</span>
                        <span className="text-[9px] text-sky-700 font-normal">
                          昼{assignRole === 'kitchen' ? '厨' : 'ホ'}{t}in
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dinner in-time options */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>夜 ディナー帯</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                      就労 4.5h
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">in時間を選択してワンタップ割当:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['16:30', '17:00', '17:30', '18:00'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleAssign(staff.id, cellDate.dateStr, 'dinner', assignRole, t)}
                        className="py-2 px-1 bg-white hover:bg-amber-100 hover:border-amber-400 border border-amber-200 rounded-md font-mono text-xs font-bold text-amber-900 transition-all shadow-2xs text-center flex flex-col items-center justify-center gap-0.5"
                      >
                        <span className="text-xs">{t} in</span>
                        <span className="text-[9px] text-amber-700 font-normal">
                          夜{assignRole === 'kitchen' ? '厨' : 'ホ'}{t}in
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                <button
                  onClick={() => handleClearCell(staff.id, cellDate.dateStr)}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  この日を休みにする
                </button>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-1.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 rounded-md transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Calendar Export Modal (.ics for Google/Outlook) */}
      <CalendarExportModal
        isOpen={isCalendarExportModalOpen}
        onClose={() => setIsCalendarExportModalOpen(false)}
        period={period}
        staffList={staffList}
        assignedShifts={assignedShifts}
      />

      {/* Period & Requirements Settings Modal */}
      <PeriodSettingsModal
        isOpen={isPeriodSettingsModalOpen}
        onClose={() => setIsPeriodSettingsModalOpen(false)}
        period={period}
        requirements={requirements}
        onSavePeriod={onSavePeriod}
        onSaveRequirements={onSaveRequirements}
      />

      {/* Pinpoint Daily Requirement Modal */}
      {selectedReqDate && (
        <DailyRequirementModal
          isOpen={!!selectedReqDate}
          onClose={() => setSelectedReqDate(null)}
          dateStr={selectedReqDate}
          requirements={requirements}
          onSaveDailyOverride={handleSaveDailyOverride}
        />
      )}

      {/* Staff Quick Edit Modal */}
      {selectedStaffForEdit && (
        <StaffQuickEditModal
          isOpen={!!selectedStaffForEdit}
          onClose={() => setSelectedStaffForEdit(null)}
          staff={selectedStaffForEdit}
          onSaveStaff={handleSaveStaffFromModal}
          onGoToStaffManagement={onNavigateTab ? () => onNavigateTab('staff') : undefined}
        />
      )}

      {/* Daily Shift Bulletin & Print Modal (1日分・2段組: 左ランチ・右ディナー) */}
      <DailyShiftPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        period={period}
        staffList={staffList}
        assignedShifts={assignedShifts}
        requirements={requirements}
        initialDate={printModalInitialDate}
      />
    </div>
  );
};
