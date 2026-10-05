import React, { useState } from 'react';
import { ShiftPeriod, ShiftRequirements } from '../../types/shift';
import {
  Settings,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Plus,
  Save,
  Sparkles
} from 'lucide-react';

interface PeriodSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: ShiftPeriod;
  requirements: ShiftRequirements;
  onSavePeriod: (period: ShiftPeriod) => void;
  onSaveRequirements: (reqs: ShiftRequirements) => void;
}

export const PeriodSettingsModal: React.FC<PeriodSettingsModalProps> = ({
  isOpen,
  onClose,
  period,
  requirements,
  onSavePeriod,
  onSaveRequirements
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'period' | 'requirements'>('period');

  // Period state
  const [title, setTitle] = useState(period.title);
  const [startDate, setStartDate] = useState(period.startDate);
  const [endDate, setEndDate] = useState(period.endDate);
  const [deadline, setDeadline] = useState(period.deadline);
  const [status, setStatus] = useState<ShiftPeriod['status']>(period.status);

  // Requirements state
  const [reqState, setReqState] = useState<ShiftRequirements>({
    lunchWeekday: { ...requirements.lunchWeekday },
    lunchWeekend: { ...requirements.lunchWeekend },
    dinnerWeekday: { ...requirements.dinnerWeekday },
    dinnerWeekend: { ...requirements.dinnerWeekend },
    customDailyOverrides: requirements.customDailyOverrides ? { ...requirements.customDailyOverrides } : {}
  });

  const [newOverrideDate, setNewOverrideDate] = useState<string>('');
  const [newOverrideSlot, setNewOverrideSlot] = useState<'both' | 'lunch' | 'dinner'>('both');
  const [newOverrideKitchen, setNewOverrideKitchen] = useState<number>(3);
  const [newOverrideHall, setNewOverrideHall] = useState<number>(4);
  const [newOverrideReason, setNewOverrideReason] = useState<string>('');
  const [showAddOverride, setShowAddOverride] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Compute target days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const isDatesChanged = startDate !== period.startDate || endDate !== period.endDate;

    const updatedPeriod: ShiftPeriod = {
      ...period,
      id: isDatesChanged ? `period-${Date.now()}` : period.id,
      title,
      startDate,
      endDate,
      deadline,
      status: isDatesChanged ? 'recruiting' : status,
      targetDaysCount: isNaN(days) ? 15 : days
    };

    onSavePeriod(updatedPeriod);
    onSaveRequirements(reqState);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  // Preset list generator (今月, 翌月, 翌々月, 3ヶ月後)
  const presetMonths = (() => {
    const now = new Date();
    const items = [
      { offset: 0, tag: '今月' },
      { offset: 1, tag: '翌月' },
      { offset: 2, tag: '翌々月' },
      { offset: 3, tag: '3ヶ月後' }
    ];

    return items.map(({ offset, tag }) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const monthStr = String(month).padStart(2, '0');

      // Deadlines (6 days before start)
      const prevD1 = new Date(year, month - 1, 1);
      prevD1.setDate(prevD1.getDate() - 6);
      const dl1 = `${prevD1.getFullYear()}-${String(prevD1.getMonth() + 1).padStart(2, '0')}-${String(prevD1.getDate()).padStart(2, '0')} 23:59`;

      const prevD2 = new Date(year, month - 1, 16);
      prevD2.setDate(prevD2.getDate() - 6);
      const dl2 = `${prevD2.getFullYear()}-${String(prevD2.getMonth() + 1).padStart(2, '0')}-${String(prevD2.getDate()).padStart(2, '0')} 23:59`;

      return {
        tag,
        year,
        month,
        firstHalf: {
          label: `${month}月 前半 (1〜15日)`,
          title: `${year}年${month}月前半 (1日〜15日)`,
          startDate: `${year}-${monthStr}-01`,
          endDate: `${year}-${monthStr}-15`,
          deadline: dl1
        },
        secondHalf: {
          label: `${month}月 後半 (16〜${lastDay}日)`,
          title: `${year}年${month}月後半 (16日〜${lastDay}日)`,
          startDate: `${year}-${monthStr}-16`,
          endDate: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
          deadline: dl2
        }
      };
    });
  })();

  const applyPreset = (preset: { title: string; startDate: string; endDate: string; deadline: string }) => {
    setTitle(preset.title);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    setDeadline(preset.deadline);
    setStatus('recruiting');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">シフト期間 & 必要人数設定</h3>
              <p className="text-[11px] text-neutral-400">
                募集カレンダーの日程や各時間帯の必要スタッフ数（厨房/ホール）を変更します
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('period')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeSubTab === 'period'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. シフト期間・締切日</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('requirements')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeSubTab === 'requirements'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. 時間帯別の必要人数</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeSubTab === 'period' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Preset buttons */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ワンクリック期間プリセット (翌々月まで対応):</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">クリックで日付と締切を自動入力</span>
                </div>

                <div className="space-y-2">
                  {presetMonths.map((m, idx) => {
                    const isFirstActive = startDate === m.firstHalf.startDate && endDate === m.firstHalf.endDate;
                    const isSecondActive = startDate === m.secondHalf.startDate && endDate === m.secondHalf.endDate;

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-white p-2 rounded border border-neutral-200">
                        <div className="sm:w-28 shrink-0 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.tag === '今月' ? 'bg-neutral-800 text-white' :
                            m.tag === '翌月' ? 'bg-emerald-100 text-emerald-800' :
                            m.tag === '翌々月' ? 'bg-sky-100 text-sky-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {m.tag}
                          </span>
                          <span className="font-bold text-neutral-900 text-xs">{m.month}月</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 flex-1">
                          <button
                            type="button"
                            onClick={() => applyPreset(m.firstHalf)}
                            className={`p-1.5 border rounded text-[11px] font-medium transition-all text-center ${
                              isFirstActive
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500 shadow-2xs'
                                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                            }`}
                          >
                            {m.firstHalf.label}
                          </button>

                          <button
                            type="button"
                            onClick={() => applyPreset(m.secondHalf)}
                            className={`p-1.5 border rounded text-[11px] font-medium transition-all text-center ${
                              isSecondActive
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500 shadow-2xs'
                                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                            }`}
                          >
                            {m.secondHalf.label}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reset warning on period date change */}
              {(startDate !== period.startDate || endDate !== period.endDate) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-950 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span>期間変更に伴う希望提出ステータスのリセット</span>
                      <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">
                        自動リセット
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800 leading-relaxed">
                      開始日または終了日が変更されるため、保存時に全スタッフの「シフト希望提出ステータス（未提出/提出済）」および「配置済みシフト」が<strong>初期状態（未提出・未配置）に自動リセット</strong>されます。新しい期間の希望募集を開始できます。
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  シフト期間タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例: 2026年10月前半 (10/1〜10/15)"
                  className="w-full border border-neutral-300 rounded px-3 py-1.5 text-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-neutral-300 rounded px-3 py-1.5 text-neutral-900 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    終了日
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-neutral-300 rounded px-3 py-1.5 text-neutral-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    アルバイト提出締切日時
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    placeholder="2026-09-25 23:59"
                    className="w-full border border-neutral-300 rounded px-3 py-1.5 text-neutral-900 font-mono"
                    required
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    ※スタッフのLINEフォームおよびリマインド時に表示されます
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    進行ステータス
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full border border-neutral-300 rounded px-3 py-1.5 text-neutral-900"
                  >
                    <option value="recruiting">希望受付中 (提出受付フェーズ)</option>
                    <option value="adjusting">シフト調整・編集中 (店長作業中)</option>
                    <option value="published">確定済・LINE一斉通知済</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'requirements' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-neutral-600 leading-relaxed text-[11px]">
                各営業日において、店舗を正常に回すために必要な <strong>厨房（キッチン）</strong> と <strong>接客（ホール）</strong> の最低人数を設定します。シフト表上の「現/必」インジケーターおよびAI自動調整時に厳格に参照されます。
              </div>

              {/* Lunch requirements */}
              <div className="border border-neutral-200 rounded-lg p-3 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div className="font-bold text-sky-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    <span>ランチ帯 (in時間: 10:00 / 10:30 / 11:00)</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">就労 4.0h</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Weekday Lunch */}
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100 space-y-2">
                    <div className="font-semibold text-neutral-800 text-[11px]">平日ランチ (月〜金)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">厨房(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.lunchWeekday.kitchen}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              lunchWeekday: { ...reqState.lunchWeekday, kitchen: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">ホール(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.lunchWeekday.hall}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              lunchWeekday: { ...reqState.lunchWeekday, hall: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekend Lunch */}
                  <div className="bg-sky-50/50 p-2.5 rounded border border-sky-100 space-y-2">
                    <div className="font-semibold text-sky-900 text-[11px]">土日・祝日ランチ</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">厨房(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.lunchWeekend.kitchen}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              lunchWeekend: { ...reqState.lunchWeekend, kitchen: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">ホール(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.lunchWeekend.hall}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              lunchWeekend: { ...reqState.lunchWeekend, hall: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dinner requirements */}
              <div className="border border-neutral-200 rounded-lg p-3 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>ディナー帯 (in時間: 16:30 / 17:00 / 17:30 / 18:00)</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">就労 4.5h</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Weekday Dinner */}
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100 space-y-2">
                    <div className="font-semibold text-neutral-800 text-[11px]">平日ディナー (月〜木)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">厨房(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.dinnerWeekday.kitchen}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              dinnerWeekday: { ...reqState.dinnerWeekday, kitchen: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">ホール(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.dinnerWeekday.hall}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              dinnerWeekday: { ...reqState.dinnerWeekday, hall: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekend Dinner */}
                  <div className="bg-amber-50/50 p-2.5 rounded border border-amber-100 space-y-2">
                    <div className="font-semibold text-amber-900 text-[11px]">金土日・祝前日ディナー</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">厨房(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.dinnerWeekend.kitchen}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              dinnerWeekend: { ...reqState.dinnerWeekend, kitchen: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">ホール(名)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={reqState.dinnerWeekend.hall}
                          onChange={e =>
                            setReqState({
                              ...reqState,
                              dinnerWeekend: { ...reqState.dinnerWeekend, hall: Number(e.target.value) }
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-center font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinpoint Custom Daily Overrides Section */}
              <div className="border border-neutral-200 rounded-lg p-3 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div>
                    <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>特定日・時間帯のピンポイント特例設定</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      特定の日付（大型宴会、貸切、連休等）限定で必要人数を変更できます
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddOverride(prev => !prev)}
                    className="text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>特例日を追加</span>
                  </button>
                </div>

                {/* Add new override form */}
                {showAddOverride && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2.5 animate-in fade-in duration-150">
                    <div className="font-semibold text-amber-950 text-xs">新規特例日の指定</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-600 mb-0.5">対象日付</label>
                        <input
                          type="date"
                          value={newOverrideDate}
                          min={startDate}
                          max={endDate}
                          onChange={e => setNewOverrideDate(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-600 mb-0.5">厨房(キッチン)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={newOverrideKitchen}
                          onChange={e => setNewOverrideKitchen(Number(e.target.value))}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-center font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-600 mb-0.5">接客(ホール)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={newOverrideHall}
                          onChange={e => setNewOverrideHall(Number(e.target.value))}
                          className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-center font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newOverrideReason}
                          onChange={e => setNewOverrideReason(e.target.value)}
                          placeholder="理由メモ (例: 30名宴会予約、貸切、花火大会)"
                          className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs text-neutral-900"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!newOverrideDate}
                        onClick={() => {
                          if (!newOverrideDate) return;
                          const currentOverrides = { ...(reqState.customDailyOverrides || {}) };
                          currentOverrides[newOverrideDate] = {
                            lunch: { kitchen: newOverrideKitchen, hall: newOverrideHall },
                            dinner: { kitchen: newOverrideKitchen, hall: newOverrideHall },
                            reason: newOverrideReason.trim() || undefined
                          };
                          setReqState({
                            ...reqState,
                            customDailyOverrides: currentOverrides
                          });
                          setNewOverrideDate('');
                          setNewOverrideReason('');
                          setShowAddOverride(false);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded text-white transition-colors ${
                          newOverrideDate ? 'bg-amber-600 hover:bg-amber-700' : 'bg-neutral-300 cursor-not-allowed'
                        }`}
                      >
                        追加する
                      </button>
                    </div>
                  </div>
                )}

                {/* Overrides list */}
                {reqState.customDailyOverrides && Object.keys(reqState.customDailyOverrides).length > 0 ? (
                  <div className="space-y-1.5">
                    {Object.entries(reqState.customDailyOverrides).map(([dateKey, ov]) => (
                      <div
                        key={dateKey}
                        className="bg-neutral-50 border border-neutral-200 rounded p-2 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                            {dateKey}
                          </span>
                          <span className="text-[11px] text-neutral-600">
                            昼: 厨房{ov.lunch?.kitchen ?? '標'}/ホール{ov.lunch?.hall ?? '標'} · 夜: 厨房{ov.dinner?.kitchen ?? '標'}/ホール{ov.dinner?.hall ?? '標'}
                          </span>
                          {ov.reason && (
                            <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-medium">
                              {ov.reason}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...(reqState.customDailyOverrides || {}) };
                            delete updated[dateKey];
                            setReqState({ ...reqState, customDailyOverrides: updated });
                          }}
                          className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                          title="この特例設定を解除"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-400 italic py-1 text-center bg-neutral-50 rounded border border-dashed border-neutral-200">
                    現在、特定日の特例設定はありません（シフト表上の各マスからも直接ワンクリックで設定可能です）
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
            >
              閉じる
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>設定を保存しました！</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>設定内容を保存して反映</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
