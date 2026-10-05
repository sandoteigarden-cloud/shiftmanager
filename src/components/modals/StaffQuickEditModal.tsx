import React, { useState, useEffect } from 'react';
import { Staff } from '../../types/shift';
import {
  Users,
  X,
  Save,
  CheckCircle2,
  ExternalLink,
  Coins,
  Clock,
  Briefcase,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface StaffQuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSaveStaff: (updatedStaff: Staff) => void;
  onGoToStaffManagement?: () => void;
}

export const StaffQuickEditModal: React.FC<StaffQuickEditModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSaveStaff,
  onGoToStaffManagement
}) => {
  if (!isOpen || !staff) return null;

  const [formData, setFormData] = useState<Staff>({ ...staff });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({ ...staff });
    }
  }, [staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSaveStaff(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ backgroundColor: formData.color }}
            >
              {formData.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">{formData.name} さんの情報編集</h3>
                {formData.isLeader && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-950 text-[10px] font-bold rounded">
                    リーダー
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                時給、希望稼働時間、労基法ルール等の変更
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Name & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                氏名
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                担当職種
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900"
              >
                <option value="hall">接客 (ホール)</option>
                <option value="kitchen">厨房 (キッチン)</option>
                <option value="both">厨房 / 接客 兼任</option>
              </select>
            </div>
          </div>

          {/* Wage & Target Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-neutral-400" />
                <span>時給 (円)</span>
              </label>
              <input
                type="number"
                min="900"
                max="5000"
                step="10"
                value={formData.hourlyWage}
                onChange={e => setFormData({ ...formData, hourlyWage: Number(e.target.value) })}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>目標月間時間</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.targetMonthlyHours}
                  onChange={e => setFormData({ ...formData, targetMonthlyHours: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-bold"
                  required
                />
                <span className="text-neutral-500 font-medium">h/月</span>
              </div>
            </div>
          </div>

          {/* Consecutive days & Student restriction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                最大連続勤務
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.maxConsecutiveDays}
                  onChange={e => setFormData({ ...formData, maxConsecutiveDays: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-bold"
                  required
                />
                <span className="text-neutral-500 font-medium">日</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                電話番号
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.isStudent}
                onChange={e => setFormData({ ...formData, isStudent: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-neutral-700 font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                <span>学生アルバイト</span>
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.isLeader}
                onChange={e => setFormData({ ...formData, isLeader: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-neutral-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>リーダー役</span>
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              勤務条件・備考メモ
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="例: 月水金は18:00以降可能、テスト期間休み等"
              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900"
            />
          </div>

          {/* Link to Full Staff Management */}
          {onGoToStaffManagement && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToStaffManagement();
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium hover:underline"
              >
                <span>全スタッフの一覧・条件管理画面（名簿）を開く</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
            >
              キャンセル
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>保存しました</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>スタッフ情報を保存</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
