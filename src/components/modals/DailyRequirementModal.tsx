import React, { useState, useEffect } from 'react';
import { ShiftRequirements, DailyRequirementOverride } from '../../types/shift';
import {
  Calendar,
  Users,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
  Save,
  Tag
} from 'lucide-react';

interface DailyRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // e.g. "2026-10-04"
  requirements: ShiftRequirements;
  onSaveDailyOverride: (dateStr: string, override: DailyRequirementOverride | null) => void;
}

export const DailyRequirementModal: React.FC<DailyRequirementModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  requirements,
  onSaveDailyOverride
}) => {
  if (!isOpen || !dateStr) return null;

  const dateObj = new Date(dateStr);
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6 || dateObj.getDay() === 5;

  // Base standard requirements for this day
  const baseLunch = isWeekend ? requirements.lunchWeekend : requirements.lunchWeekday;
  const baseDinner = isWeekend ? requirements.dinnerWeekend : requirements.dinnerWeekday;

  // Existing override if any
  const existingOverride = requirements.customDailyOverrides?.[dateStr];

  const [lunchKitchen, setLunchKitchen] = useState<number>(
    existingOverride?.lunch?.kitchen ?? baseLunch.kitchen
  );
  const [lunchHall, setLunchHall] = useState<number>(
    existingOverride?.lunch?.hall ?? baseLunch.hall
  );
  const [dinnerKitchen, setDinnerKitchen] = useState<number>(
    existingOverride?.dinner?.kitchen ?? baseDinner.kitchen
  );
  const [dinnerHall, setDinnerHall] = useState<number>(
    existingOverride?.dinner?.hall ?? baseDinner.hall
  );
  const [reason, setReason] = useState<string>(existingOverride?.reason || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if date changes
  useEffect(() => {
    const cur = requirements.customDailyOverrides?.[dateStr];
    setLunchKitchen(cur?.lunch?.kitchen ?? baseLunch.kitchen);
    setLunchHall(cur?.lunch?.hall ?? baseLunch.hall);
    setDinnerKitchen(cur?.dinner?.kitchen ?? baseDinner.kitchen);
    setDinnerHall(cur?.dinner?.hall ?? baseDinner.hall);
    setReason(cur?.reason || '');
  }, [dateStr, requirements]);

  const hasOverride = !!existingOverride;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newOverride: DailyRequirementOverride = {
      lunch: {
        kitchen: Number(lunchKitchen),
        hall: Number(lunchHall)
      },
      dinner: {
        kitchen: Number(dinnerKitchen),
        hall: Number(dinnerHall)
      },
      reason: reason.trim() || undefined
    };

    onSaveDailyOverride(dateStr, newOverride);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  const handleResetToDefault = () => {
    onSaveDailyOverride(dateStr, null);
    setLunchKitchen(baseLunch.kitchen);
    setLunchHall(baseLunch.hall);
    setDinnerKitchen(baseDinner.kitchen);
    setDinnerHall(baseDinner.hall);
    setReason('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  const presetReasons = [
    '30名大型宴会予約あり',
    '店舗貸切営業',
    '近隣イベント・花火大会',
    '週末混雑予想（仕込み強化）',
    '予約少なめ（少人数体制）',
    '新メニュー導入研修'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {dateStr} ({dayOfWeek}) の必要人数ピンポイント設定
                </h3>
                {hasOverride && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-950 text-[10px] font-bold rounded">
                    特例設定中
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                この日限定の宴会・イベント・貸切等に伴う増減人数を個別に指定します
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Base standard reference */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-500">標準テンプレート値:</span>
              <span>昼(厨房{baseLunch.kitchen}/ホール{baseLunch.hall})</span>
              <span>·</span>
              <span>夜(厨房{baseDinner.kitchen}/ホール{baseDinner.hall})</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 rounded text-neutral-700">
              {isWeekend ? '週末設定' : '平日設定'}
            </span>
          </div>

          {/* Lunch slot override */}
          <div className="border border-sky-200 bg-sky-50/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span>ランチ帯 (就労4h · in時間: 10:00 / 10:30 / 11:00)</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">標準: 厨房{baseLunch.kitchen} / ホール{baseLunch.hall}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-2 rounded border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-800">厨房 (キッチン)</div>
                  <div className="text-[10px] text-neutral-400">調理・仕込み</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={lunchKitchen}
                    onChange={e => setLunchKitchen(Number(e.target.value))}
                    className="w-14 bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-center font-bold text-neutral-900 font-mono text-sm"
                  />
                  <span className="text-neutral-500 text-[11px]">名</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-800">接客 (ホール)</div>
                  <div className="text-[10px] text-neutral-400">接客・レジ</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={lunchHall}
                    onChange={e => setLunchHall(Number(e.target.value))}
                    className="w-14 bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-center font-bold text-neutral-900 font-mono text-sm"
                  />
                  <span className="text-neutral-500 text-[11px]">名</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dinner slot override */}
          <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>ディナー帯 (就労4.5h · in時間: 16:30 / 17:00 / 17:30 / 18:00)</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">標準: 厨房{baseDinner.kitchen} / ホール{baseDinner.hall}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-2 rounded border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-800">厨房 (キッチン)</div>
                  <div className="text-[10px] text-neutral-400">焼き場・刺場</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={dinnerKitchen}
                    onChange={e => setDinnerKitchen(Number(e.target.value))}
                    className="w-14 bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-center font-bold text-neutral-900 font-mono text-sm"
                  />
                  <span className="text-neutral-500 text-[11px]">名</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-800">接客 (ホール)</div>
                  <div className="text-[10px] text-neutral-400">案内・配膳・ドリンク</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={dinnerHall}
                    onChange={e => setDinnerHall(Number(e.target.value))}
                    className="w-14 bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-center font-bold text-neutral-900 font-mono text-sm"
                  />
                  <span className="text-neutral-500 text-[11px]">名</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reason / Note */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-neutral-500" />
              <span>特例の理由・メモ (シフト表にツールチップ表示されます):</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="例: 30名大型宴会予約のためホール+1名、厨房+1名"
              className="w-full bg-white border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {presetReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded transition-colors"
                >
                  +{r}
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            {hasOverride ? (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>標準設定に戻す</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                キャンセル
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>この日の設定を保存しました</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>この日の必要人数を保存</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
