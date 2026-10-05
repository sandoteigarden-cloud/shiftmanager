import React, { useState, useMemo } from 'react';
import { Staff, ShiftPeriod, AssignedShift, ShiftRequirements } from '../../types/shift';
import {
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Copy,
  Info
} from 'lucide-react';

interface DailyShiftPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: ShiftPeriod;
  staffList: Staff[];
  assignedShifts: AssignedShift[];
  requirements: ShiftRequirements;
  initialDate?: string;
}

export const DailyShiftPrintModal: React.FC<DailyShiftPrintModalProps> = ({
  isOpen,
  onClose,
  period,
  staffList,
  assignedShifts,
  requirements,
  initialDate
}) => {
  // Generate all dates in the period
  const periodDates = useMemo(() => {
    const dates: string[] = [];
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [period.startDate, period.endDate]);

  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate && periodDates.includes(initialDate) ? initialDate : periodDates[0] || '2026-10-01'
  );

  const [printAllPages, setPrintAllPages] = useState<boolean>(false);
  const [dailyNote, setDailyNote] = useState<string>('【本日の連絡事項】宴会ご予約あり。おすすめの旬魚仕込み重点。交代時は店長まで報告お願いします。');
  const [showStampCol, setShowStampCol] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentIndex = periodDates.indexOf(selectedDate);

  const handlePrevDay = () => {
    if (currentIndex > 0) {
      setSelectedDate(periodDates[currentIndex - 1]);
    }
  };

  const handleNextDay = () => {
    if (currentIndex < periodDates.length - 1) {
      setSelectedDate(periodDates[currentIndex + 1]);
    }
  };

  // Helper to get formatted date string: e.g. 2026年10月4日 (土曜日)
  const formatJapaneseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const fullDayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const dayOfWeek = dayNames[d.getDay()];
    const fullDayOfWeek = fullDayNames[d.getDay()];
    const isSat = d.getDay() === 6;
    const isSun = d.getDay() === 0;

    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      dayOfWeek,
      fullDayOfWeek,
      isSat,
      isSun,
      isWeekend: isSat || isSun
    };
  };

  // Render a single day sheet
  const renderDaySheet = (dateStr: string, isForPrintAll = false) => {
    const dateInfo = formatJapaneseDate(dateStr);
    const shiftsToday = assignedShifts.filter(s => s.date === dateStr);

    // Left column: Lunch shifts
    const lunchShifts = shiftsToday.filter(s => s.slot === 'lunch');
    const lunchKitchen = lunchShifts.filter(s => s.role === 'kitchen');
    const lunchHall = lunchShifts.filter(s => s.role === 'hall');

    // Right column: Dinner shifts
    const dinnerShifts = shiftsToday.filter(s => s.slot === 'dinner');
    const dinnerKitchen = dinnerShifts.filter(s => s.role === 'kitchen');
    const dinnerHall = dinnerHallShifts(dinnerShifts);

    function dinnerHallShifts(shifts: AssignedShift[]) {
      return shifts.filter(s => s.role === 'hall');
    }

    // Requirements for today
    const override = requirements.customDailyOverrides?.[dateStr];
    const baseLunch = dateInfo.isWeekend ? requirements.lunchWeekend : requirements.lunchWeekday;
    const baseDinner = dateInfo.isWeekend ? requirements.dinnerWeekend : requirements.dinnerWeekday;

    const reqLunch = {
      kitchen: override?.lunch?.kitchen !== undefined ? override.lunch.kitchen : baseLunch.kitchen,
      hall: override?.lunch?.hall !== undefined ? override.lunch.hall : baseLunch.hall
    };
    const reqDinner = {
      kitchen: override?.dinner?.kitchen !== undefined ? override.dinner.kitchen : baseDinner.kitchen,
      hall: override?.dinner?.hall !== undefined ? override.dinner.hall : baseDinner.hall
    };

    return (
      <div
        key={dateStr}
        className={`bg-white text-neutral-900 border border-neutral-300 rounded-lg p-6 shadow-sm mx-auto w-full max-w-[850px] font-['Noto_Sans_JP',sans-serif] ${
          isForPrintAll ? 'print-page-break mb-8' : ''
        }`}
      >
        {/* Header: Store Name & Title */}
        <div className="border-b-2 border-neutral-900 pb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 tracking-wider">さんど亭ガーデン</span>
              <span className="text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 font-medium">店舗貼り出し用 出勤シフト表</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-950 mt-1 flex items-baseline gap-2">
              <span>{dateInfo.year}年{dateInfo.month}月{dateInfo.day}日</span>
              <span className={`text-xl font-bold ${
                dateInfo.isSat ? 'text-sky-700' : dateInfo.isSun ? 'text-rose-700' : 'text-neutral-800'
              }`}>
                ({dateInfo.fullDayOfWeek})
              </span>
            </h1>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-500 font-mono">
              発行日: {new Date().toLocaleDateString('ja-JP')}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded text-xs font-semibold">
              <span>出勤人数:</span>
              <span className="font-mono font-bold text-neutral-900">
                昼 {lunchShifts.length}名 / 夜 {dinnerShifts.length}名 (計 {shiftsToday.length}名)
              </span>
            </div>
            {override?.reason && (
              <div className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded mt-1 border border-amber-300">
                ★特例: {override.reason}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Section: Left Lunch, Right Dinner */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* ================= LEFT COLUMN: ランチ帯 ================= */}
          <div className="border border-neutral-800 rounded-md overflow-hidden flex flex-col">
            {/* Column Header */}
            <div className="bg-sky-700 text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm tracking-wide">ランチ営業</span>
              </div>
              <div className="text-xs font-mono font-semibold text-sky-100">
                10:30 〜 15:00
              </div>
            </div>

            {/* Sub-header requirements */}
            <div className="bg-sky-50 border-b border-neutral-300 px-3 py-1.5 flex items-center justify-between text-xs text-neutral-700">
              <span className="font-semibold text-neutral-800">
                出勤予定: <span className="font-mono font-bold">{lunchShifts.length}名</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                (必要: 厨{reqLunch.kitchen} / ホ{reqLunch.hall})
              </span>
            </div>

            {/* Staff list tables */}
            <div className="p-2 space-y-3 flex-1 flex flex-col justify-between">
              {/* Kitchen Section */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded flex items-center justify-between mb-1.5 border border-neutral-200">
                  <span>🍳 厨房 (キッチン)</span>
                  <span className="font-mono font-bold text-neutral-900">{lunchKitchen.length}名</span>
                </div>

                <div className="space-y-1.5">
                  {lunchKitchen.map(s => {
                    const staff = staffList.find(st => st.id === s.staffId);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-300 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-neutral-950 min-w-[70px]">
                            {staff?.name || 'スタッフ'}
                          </span>
                          {staff?.isLeader && (
                            <span className="px-1 py-0.2 bg-amber-400 text-neutral-950 font-black text-[9px] rounded">
                              L
                            </span>
                          )}
                          {s.isUrgentCover && (
                            <span className="px-1 py-0.2 bg-rose-600 text-white font-bold text-[9px] rounded">
                              急募
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-bold text-neutral-900 text-xs">
                            {s.startTime || '10:30'} in
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {s.hours}h
                          </span>
                          {showStampCol && (
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] text-neutral-300 font-bold"
                              title="出勤確認印"
                            >
                              印
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {lunchKitchen.length === 0 && (
                    <div className="p-2 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 italic">
                      厨房の配置なし
                    </div>
                  )}
                </div>
              </div>

              {/* Hall Section */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded flex items-center justify-between mb-1.5 border border-neutral-200">
                  <span>🛎️ 接客 (ホール)</span>
                  <span className="font-mono font-bold text-neutral-900">{lunchHall.length}名</span>
                </div>

                <div className="space-y-1.5">
                  {lunchHall.map(s => {
                    const staff = staffList.find(st => st.id === s.staffId);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-300 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-neutral-950 min-w-[70px]">
                            {staff?.name || 'スタッフ'}
                          </span>
                          {staff?.isLeader && (
                            <span className="px-1 py-0.2 bg-amber-400 text-neutral-950 font-black text-[9px] rounded">
                              L
                            </span>
                          )}
                          {s.isUrgentCover && (
                            <span className="px-1 py-0.2 bg-rose-600 text-white font-bold text-[9px] rounded">
                              急募
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-bold text-neutral-900 text-xs">
                            {s.startTime || '10:30'} in
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {s.hours}h
                          </span>
                          {showStampCol && (
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] text-neutral-300 font-bold"
                              title="出勤確認印"
                            >
                              印
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {lunchHall.length === 0 && (
                    <div className="p-2 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 italic">
                      ホールの配置なし
                    </div>
                  )}
                </div>
              </div>

              {/* Blank lines for handwritten adjustments/urgent additions */}
              <div className="border-t border-neutral-200 pt-2 space-y-1.5">
                <div className="text-[10px] text-neutral-500 font-medium flex items-center justify-between">
                  <span>追加・変更メモ欄:</span>
                </div>
                <div className="h-6 border-b border-neutral-300 border-dashed"></div>
                <div className="h-6 border-b border-neutral-300 border-dashed"></div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ディナー帯 ================= */}
          <div className="border border-neutral-800 rounded-md overflow-hidden flex flex-col">
            {/* Column Header */}
            <div className="bg-amber-800 text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm tracking-wide">ディナー営業</span>
              </div>
              <div className="text-xs font-mono font-semibold text-amber-100">
                17:00 〜 23:00
              </div>
            </div>

            {/* Sub-header requirements */}
            <div className="bg-amber-50 border-b border-neutral-300 px-3 py-1.5 flex items-center justify-between text-xs text-neutral-700">
              <span className="font-semibold text-neutral-800">
                出勤予定: <span className="font-mono font-bold">{dinnerShifts.length}名</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                (必要: 厨{reqDinner.kitchen} / ホ{reqDinner.hall})
              </span>
            </div>

            {/* Staff list tables */}
            <div className="p-2 space-y-3 flex-1 flex flex-col justify-between">
              {/* Kitchen Section */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded flex items-center justify-between mb-1.5 border border-neutral-200">
                  <span>🍳 厨房 (キッチン)</span>
                  <span className="font-mono font-bold text-neutral-900">{dinnerKitchen.length}名</span>
                </div>

                <div className="space-y-1.5">
                  {dinnerKitchen.map(s => {
                    const staff = staffList.find(st => st.id === s.staffId);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-300 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-neutral-950 min-w-[70px]">
                            {staff?.name || 'スタッフ'}
                          </span>
                          {staff?.isLeader && (
                            <span className="px-1 py-0.2 bg-amber-400 text-neutral-950 font-black text-[9px] rounded">
                              L
                            </span>
                          )}
                          {s.isUrgentCover && (
                            <span className="px-1 py-0.2 bg-rose-600 text-white font-bold text-[9px] rounded">
                              急募
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-bold text-neutral-900 text-xs">
                            {s.startTime || '17:00'} in
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {s.hours}h
                          </span>
                          {showStampCol && (
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] text-neutral-300 font-bold"
                              title="出勤確認印"
                            >
                              印
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {dinnerKitchen.length === 0 && (
                    <div className="p-2 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 italic">
                      厨房の配置なし
                    </div>
                  )}
                </div>
              </div>

              {/* Hall Section */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded flex items-center justify-between mb-1.5 border border-neutral-200">
                  <span>🛎️ 接客 (ホール)</span>
                  <span className="font-mono font-bold text-neutral-900">{dinnerHall.length}名</span>
                </div>

                <div className="space-y-1.5">
                  {dinnerHall.map(s => {
                    const staff = staffList.find(st => st.id === s.staffId);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-300 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-neutral-950 min-w-[70px]">
                            {staff?.name || 'スタッフ'}
                          </span>
                          {staff?.isLeader && (
                            <span className="px-1 py-0.2 bg-amber-400 text-neutral-950 font-black text-[9px] rounded">
                              L
                            </span>
                          )}
                          {s.isUrgentCover && (
                            <span className="px-1 py-0.2 bg-rose-600 text-white font-bold text-[9px] rounded">
                              急募
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-bold text-neutral-900 text-xs">
                            {s.startTime || '17:30'} in
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {s.hours}h
                          </span>
                          {showStampCol && (
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] text-neutral-300 font-bold"
                              title="出勤確認印"
                            >
                              印
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {dinnerHall.length === 0 && (
                    <div className="p-2 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 italic">
                      ホールの配置なし
                    </div>
                  )}
                </div>
              </div>

              {/* Blank lines for handwritten adjustments/urgent additions */}
              <div className="border-t border-neutral-200 pt-2 space-y-1.5">
                <div className="text-[10px] text-neutral-500 font-medium flex items-center justify-between">
                  <span>追加・変更メモ欄:</span>
                </div>
                <div className="h-6 border-b border-neutral-300 border-dashed"></div>
                <div className="h-6 border-b border-neutral-300 border-dashed"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Memo & Stamp Box */}
        <div className="mt-4 pt-3 border-t-2 border-neutral-900 grid grid-cols-4 gap-3 text-xs">
          <div className="col-span-3 bg-neutral-50 border border-neutral-300 rounded p-2.5">
            <div className="font-bold text-neutral-800 text-[11px] mb-1">
              📝 本日の連絡・申し送り事項 / 宴会予約状況:
            </div>
            <div className="text-neutral-700 text-xs whitespace-pre-line leading-relaxed min-h-[36px]">
              {dailyNote || '特記事項なし'}
            </div>
          </div>

          <div className="col-span-1 border border-neutral-300 rounded p-2 text-center flex flex-col justify-between">
            <div className="text-[10px] text-neutral-500 font-semibold">店長・責任者確認印</div>
            <div className="w-12 h-12 rounded-full border border-neutral-400 mx-auto my-1 flex items-center justify-center text-[10px] text-neutral-300">
              確認印
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-100 rounded-xl shadow-2xl border border-neutral-300 w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Top Control Bar (Screen only, hidden when printing) */}
        <div className="bg-neutral-900 text-white p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">印刷 / 貼り出し用プレビュー (1日分·2段組)</h2>
              <p className="text-[11px] text-neutral-400">
                左側ランチ帯 · 右側ディナー帯に名前を書き出す掲示用A4フォーマット
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-sm"
              title="ブラウザの印刷ダイアログを開く (PDF保存も可能)"
            >
              <Printer className="w-4 h-4" />
              <span>印刷する (Ctrl+P / ⌘+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Selector & Options Strip (Screen only) */}
        <div className="bg-white border-b border-neutral-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 no-print">
          {/* Day Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={currentIndex <= 0}
              className={`p-1.5 rounded border flex items-center gap-1 font-medium transition-colors ${
                currentIndex <= 0
                  ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>前日</span>
            </button>

            {/* Quick date dropdown */}
            <div className="relative">
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 font-bold font-mono text-neutral-900 text-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {periodDates.map(dateStr => {
                  const info = formatJapaneseDate(dateStr);
                  const count = assignedShifts.filter(s => s.date === dateStr).length;
                  return (
                    <option key={dateStr} value={dateStr}>
                      {info.month}月{info.day}日 ({info.dayOfWeek}) - {count}名出勤
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={currentIndex >= periodDates.length - 1}
              className={`p-1.5 rounded border flex items-center gap-1 font-medium transition-colors ${
                currentIndex >= periodDates.length - 1
                  ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>翌日</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Options Toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700">
              <input
                type="checkbox"
                checked={showStampCol}
                onChange={e => setShowStampCol(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>出勤印 (認印枠) を表示</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700">
              <input
                type="checkbox"
                checked={printAllPages}
                onChange={e => setPrintAllPages(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>期間内全日 ({periodDates.length}日分) を一括印刷</span>
            </label>
          </div>
        </div>

        {/* Note Editor Banner (Screen only) */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs no-print">
          <span className="font-bold text-amber-950 whitespace-nowrap shrink-0 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>連絡事項メモの編集:</span>
          </span>
          <input
            type="text"
            value={dailyNote}
            onChange={e => setDailyNote(e.target.value)}
            placeholder="本日の予約や注意事項を入力（印刷物下部に反映されます）"
            className="flex-1 bg-white border border-amber-300 rounded px-2.5 py-1 text-xs text-neutral-900"
          />
        </div>

        {/* Main Printable Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-200/70 flex flex-col items-center">
          <div id="printable-daily-shift-sheet" className="w-full">
            {printAllPages ? (
              // Print all days in sequence
              periodDates.map(d => renderDaySheet(d, true))
            ) : (
              // Print single day (Left: Lunch, Right: Dinner)
              renderDaySheet(selectedDate)
            )}
          </div>
        </div>

        {/* Bottom Status & Info Bar (Screen only) */}
        <div className="bg-white border-t border-neutral-200 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-500 shrink-0 no-print">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>A4用紙（縦向き）の1枚にぴったり収まるレイアウトです。プリンター設定で「ヘッダーとフッター」をオフにすると綺麗に出力できます。</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1 text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
            >
              閉じる
            </button>
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded transition-colors flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>印刷を実行</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
