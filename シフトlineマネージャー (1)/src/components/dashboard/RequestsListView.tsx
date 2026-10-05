import React, { useState } from 'react';
import { Staff, ShiftPeriod, ShiftSubmission } from '../../types/shift';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Smartphone,
  Calendar,
  Sparkles
} from 'lucide-react';

interface RequestsListViewProps {
  period: ShiftPeriod;
  staffList: Staff[];
  submissions: ShiftSubmission[];
  onSendLineReminder: (staffIds: string[]) => void;
  onOpenSimulatorForStaff: (staffId: string) => void;
}

export const RequestsListView: React.FC<RequestsListViewProps> = ({
  period,
  staffList,
  submissions,
  onSendLineReminder,
  onOpenSimulatorForStaff
}) => {
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'unsubmitted'>('all');

  const unsubmittedStaff = staffList.filter(
    staff => !submissions.some(sub => sub.staffId === staff.id)
  );

  const filteredStaff = staffList.filter(staff => {
    const hasSubmitted = submissions.some(sub => sub.staffId === staff.id);
    if (filter === 'submitted') return hasSubmitted;
    if (filter === 'unsubmitted') return !hasSubmitted;
    return true;
  });

  const toggleExpand = (staffId: string) => {
    setExpandedStaffId(current => (current === staffId ? null : staffId));
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase">シフト希望受付状況</span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              締切: {period.deadline}
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mt-1">
            {period.title}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            全{staffList.length}名中 <span className="font-semibold text-emerald-600">{submissions.length}名提出済</span> · 未提出 <span className="font-semibold text-amber-600">{unsubmittedStaff.length}名</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium text-neutral-600">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'}`}
            >
              全員 ({staffList.length})
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'submitted' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'}`}
            >
              提出済 ({submissions.length})
            </button>
            <button
              onClick={() => setFilter('unsubmitted')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'unsubmitted' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'}`}
            >
              未提出 ({unsubmittedStaff.length})
            </button>
          </div>

          {unsubmittedStaff.length > 0 && (
            <button
              onClick={() => onSendLineReminder(unsubmittedStaff.map(s => s.id))}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              未提出者({unsubmittedStaff.length}名)へLINEリマインド送信
            </button>
          )}
        </div>
      </div>

      {/* Staff Submission Cards Grid */}
      <div className="space-y-3">
        {filteredStaff.map(staff => {
          const submission = submissions.find(s => s.staffId === staff.id);
          const isSubmitted = !!submission;
          const isExpanded = expandedStaffId === staff.id;

          // Count stats if submitted
          const countAvailable = submission?.entries.filter(e => e.preference === 'available').length || 0;
          const countPreferredTime = submission?.entries.filter(e => e.preference === 'preferred_time').length || 0;
          const countUnavailable = submission?.entries.filter(e => e.preference === 'unavailable').length || 0;

          return (
            <div
              key={staff.id}
              className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all shadow-2xs hover:border-neutral-300"
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Staff basic info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ backgroundColor: staff.color }}
                  >
                    {staff.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-sm">{staff.name}</span>
                      {staff.isLeader && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                          リーダー
                        </span>
                      )}
                      <span className="text-xs text-neutral-500">
                        ({staff.role === 'kitchen' ? '厨房' : staff.role === 'hall' ? '接客' : '兼任'})
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                      <span>時給 ¥{staff.hourlyWage.toLocaleString()}</span>
                      <span>·</span>
                      <span>希望稼働: 約{staff.targetMonthlyHours}時間/月</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${staff.lineConnected ? 'bg-emerald-500' : 'bg-neutral-300'}`}></span>
                        <span>{staff.lineConnected ? 'LINE連携済' : 'LINE未連携'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submission State & Action Buttons */}
                <div className="flex items-center gap-2 sm:self-center self-start">
                  {isSubmitted ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          提出完了
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {submission.submittedAt}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(staff.id)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                        title="希望詳細を見る"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        未提出
                      </div>

                      <button
                        onClick={() => onSendLineReminder([staff.id])}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        LINEリマインド
                      </button>

                      <button
                        onClick={() => onOpenSimulatorForStaff(staff.id)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded transition-colors flex items-center gap-1"
                        title="このスタッフとしてLINEから希望を入力・送信してみる"
                      >
                        <Smartphone className="w-3 h-3 text-emerald-600" />
                        LINE入力代行
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitted comment teaser */}
              {isSubmitted && submission.overallComment && (
                <div className="px-4 pb-3 pt-0">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-md p-2.5 text-xs text-neutral-700 flex items-start gap-2">
                    <span className="text-neutral-400 font-semibold shrink-0">コメント:</span>
                    <span>{submission.overallComment}</span>
                  </div>
                </div>
              )}

              {/* Detailed Breakdown when expanded */}
              {isExpanded && submission && (
                <div className="border-t border-neutral-200 bg-neutral-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700">期間中の希望内訳:</span>
                    <div className="flex items-center gap-3 text-neutral-600">
                      <span className="text-emerald-700 font-medium">○ 通しOK: {countAvailable}日</span>
                      <span className="text-amber-700 font-medium">△ 昼/夜のみ: {countPreferredTime}日</span>
                      <span className="text-rose-700 font-medium">✕ 不可: {countUnavailable}日</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                    {submission.entries.map(entry => (
                      <div
                        key={entry.date}
                        className="bg-white border border-neutral-200 rounded p-2 text-center text-xs"
                      >
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {entry.date.slice(5)}
                        </div>
                        <div className="font-bold my-0.5">
                          {entry.preference === 'available' ? (
                            <span className="text-emerald-600">○</span>
                          ) : entry.preference === 'preferred_time' ? (
                            <span className="text-amber-600">△</span>
                          ) : (
                            <span className="text-rose-600">✕</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-600 truncate font-mono">
                          {entry.preference === 'available'
                            ? (entry.startTime ? entry.startTime : '通しOK')
                            : entry.startTime
                            ? (entry.startTime.includes('/') ? entry.startTime : `${entry.startTime}in`)
                            : entry.preference === 'preferred_time'
                            ? '片方のみ'
                            : '休み'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
