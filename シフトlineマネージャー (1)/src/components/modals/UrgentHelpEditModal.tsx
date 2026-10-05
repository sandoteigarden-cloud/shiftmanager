import React, { useState, useEffect } from 'react';
import { UrgentHelpPost } from '../../types/shift';
import {
  AlertTriangle,
  Clock,
  Coins,
  Send,
  Trash2,
  X,
  CheckCircle2,
  Save,
  Tag,
  Check
} from 'lucide-react';

interface UrgentHelpEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: UrgentHelpPost | null;
  onSave: (updatedPost: UrgentHelpPost, notifyLine: boolean) => void;
  onDelete: (postId: string) => void;
}

export const UrgentHelpEditModal: React.FC<UrgentHelpEditModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
  onDelete
}) => {
  if (!isOpen || !post) return null;

  const [date, setDate] = useState(post.date);
  const [slot, setSlot] = useState<'lunch' | 'dinner'>(post.slot);
  const [role, setRole] = useState<'kitchen' | 'hall'>(post.role);
  const [startTime, setStartTime] = useState(post.startTime);
  const [endTime, setEndTime] = useState(post.endTime);
  const [bonusWagePerHour, setBonusWagePerHour] = useState(post.bonusWagePerHour);
  const [reason, setReason] = useState(post.reason);
  const [status, setStatus] = useState<'open' | 'filled'>(post.status);
  const [notifyLine, setNotifyLine] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (post) {
      setDate(post.date);
      setSlot(post.slot);
      setRole(post.role);
      setStartTime(post.startTime);
      setEndTime(post.endTime);
      setBonusWagePerHour(post.bonusWagePerHour);
      setReason(post.reason);
      setStatus(post.status);
      setNotifyLine(true);
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UrgentHelpPost = {
      ...post,
      date,
      slot,
      role,
      startTime,
      endTime,
      bonusWagePerHour: Number(bonusWagePerHour),
      reason,
      status
    };

    onSave(updated, notifyLine);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 450);
  };

  const handleDelete = () => {
    if (confirm(`【${post.date} ${post.slot === 'lunch' ? '昼' : '夜'}】の急募案件を取り下げ・削除しますか？`)) {
      onDelete(post.id);
      onClose();
    }
  };

  const presetReasons = [
    '団体ご予約追加のため、ホール急募！',
    '突発欠員のため、急遽募集します！',
    '週末混雑予想のため、キッチン仕込みヘルプ急募！',
    '体調不良スタッフ発生のため、代打お願いします！'
  ];

  const bonusPresets = [100, 150, 200, 300, 500];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">急募ヘルプ募集内容の編集</h3>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  status === 'open' ? 'bg-emerald-500 text-white' : 'bg-neutral-600 text-neutral-200'
                }`}>
                  {status === 'open' ? '募集中' : '締切済'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                募集日時、メッセージ内容の変更とLINE再通知
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Status & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                募集対象日
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                募集ステータス
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-semibold"
              >
                <option value="open">🟢 募集中 (LINE応募受付)</option>
                <option value="filled">⚪ 受付終了・充足済</option>
              </select>
            </div>
          </div>

          {/* Slot & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                募集時間帯
              </label>
              <select
                value={slot}
                onChange={e => {
                  const newSlot = e.target.value as 'lunch' | 'dinner';
                  setSlot(newSlot);
                  if (newSlot === 'lunch') {
                    setStartTime('10:30');
                    setEndTime('15:00');
                  } else {
                    setStartTime('17:30');
                    setEndTime('23:00');
                  }
                }}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900"
              >
                <option value="dinner">ディナー帯 (夜)</option>
                <option value="lunch">ランチ帯 (昼)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                職種
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900"
              >
                <option value="hall">接客 (ホール)</option>
                <option value="kitchen">厨房 (キッチン)</option>
              </select>
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>勤務開始時刻</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>勤務終了時刻</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-mono"
                required
              />
            </div>
          </div>

          {/* Message / Reason */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span>募集理由・スタッフへのメッセージ</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="理由やお願いメッセージを入力"
              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900"
              required
            />
            <div className="flex flex-wrap gap-1">
              {presetReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded transition-colors text-left"
                >
                  +{r}
                </button>
              ))}
            </div>
          </div>

          {/* Notify LINE toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={notifyLine}
                onChange={e => setNotifyLine(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-neutral-900 flex items-center gap-1">
                  <Send className="w-3 h-3 text-emerald-600" />
                  <span>更新内容をLINE公式アカウントでスタッフ全員に再通知する</span>
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  チェックを入れると、変更後の募集条件がLINEシミュレーターおよび登録スタッフに送信されます
                </span>
              </div>
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>募集を取り下げる</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
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
                    <span>更新を保存しました</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>募集内容を保存</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
