import React, { useState } from 'react';
import { Staff, ShiftPeriod, AssignedShift } from '../../types/shift';
import { generateIcsCalendar, downloadIcsFile } from '../../utils/calendarExport';
import {
  Calendar as CalendarIcon,
  Download,
  CheckCircle2,
  ExternalLink,
  Users,
  User,
  Info,
  X
} from 'lucide-react';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: ShiftPeriod;
  staffList: Staff[];
  assignedShifts: AssignedShift[];
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  period,
  staffList,
  assignedShifts
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter shifts based on selection
  const targetShifts = selectedStaffId === 'all'
    ? assignedShifts
    : assignedShifts.filter(s => s.staffId === selectedStaffId);

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  const handleDownload = () => {
    const title = selectedStaffId === 'all'
      ? `さんど亭ガーデン_全店舗シフト_${period.startDate}_${period.endDate}`
      : `さんど亭ガーデン_${selectedStaff?.name || 'スタッフ'}_シフト_${period.startDate}_${period.endDate}`;

    const calendarName = selectedStaffId === 'all'
      ? `さんど亭ガーデン 全員シフト (${period.startDate}〜${period.endDate})`
      : `さんど亭ガーデン ${selectedStaff?.name || ''} シフト (${period.startDate}〜${period.endDate})`;

    const icsContent = generateIcsCalendar(targetShifts, staffList, {
      calendarTitle: calendarName,
      storeName: 'さんど亭ガーデン',
      storeLocation: 'さんど亭ガーデン（店舗）'
    });

    downloadIcsFile(icsContent, `${title}.ics`);
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">カレンダー形式 (.ics) エクスポート</h3>
              <p className="text-[11px] text-neutral-400">
                Googleカレンダー / Outlook / Appleカレンダーに直接取り込めます
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Export Scope Selector */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-800">
              エクスポート対象を選択:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStaffId('all')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedStaffId === 'all'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold ring-1 ring-sky-500'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>全員のシフト ({assignedShifts.length}件)</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-normal mt-1">
                  店舗全体の勤務スケジュールを一括保存
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedStaffId === 'all') {
                    setSelectedStaffId(staffList[0]?.id || 'all');
                  }
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedStaffId !== 'all'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold ring-1 ring-sky-500'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>特定スタッフのみ</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-normal mt-1">
                  個人ごとの出勤スケジュールを出力
                </div>
              </button>
            </div>
          </div>

          {/* Individual Staff Dropdown (if individual selected) */}
          {selectedStaffId !== 'all' && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-1.5 animate-in fade-in duration-150">
              <label className="block font-semibold text-neutral-700">
                スタッフを選択:
              </label>
              <select
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-medium"
              >
                {staffList.map(s => {
                  const count = assignedShifts.filter(as => as.staffId === s.id).length;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role === 'kitchen' ? '厨房' : s.role === 'hall' ? '接客' : '兼任'}) - {count}回勤務
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Details Preview Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700">エクスポート内容の確認:</span>
              <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded text-[11px]">
                {targetShifts.length} コマの予定
              </span>
            </div>
            <div className="text-neutral-600 space-y-1 text-[11px] leading-relaxed">
              <div>・形式: <strong>iCalendar (.ics 標準規格)</strong></div>
              <div>・対象期間: {period.startDate} 〜 {period.endDate}</div>
              <div>・内容: 出勤時間帯（開始〜終了時刻）、ポジション（厨房/ホール）、店舗名、時給情報</div>
            </div>
          </div>

          {/* How to import guide */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-3 text-[11px] text-sky-950 space-y-1.5 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-sky-900">
              <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>各カレンダーアプリへの取り込み方法:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-700 pl-1">
              <li>
                <strong>Google カレンダー:</strong> 設定（歯車アイコン）＞「インポート/エクスポート」からダウンロードした <code>.ics</code> ファイルをアップロード
              </li>
              <li>
                <strong>Outlook:</strong> 「予定表の追加」＞「ファイルからインポート」を選択、またはダウンロードしたファイルをダブルクリック
              </li>
              <li>
                <strong>iPhone / Mac / Android:</strong> ダウンロードしたファイルをタップするだけで標準カレンダーに一括追加されます
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
          >
            キャンセル
          </button>

          <button
            onClick={handleDownload}
            disabled={targetShifts.length === 0}
            className={`px-5 py-2 text-white font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-sm ${
              exportedSuccess
                ? 'bg-emerald-600'
                : targetShifts.length === 0
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {exportedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>ダウンロード完了！</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>.ics カレンダーをダウンロード</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
