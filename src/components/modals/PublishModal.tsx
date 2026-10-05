import React, { useState } from 'react';
import { Staff, ShiftPeriod, AssignedShift } from '../../types/shift';
import { Send, CheckCircle2, Calendar, Users, X, Smartphone } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: ShiftPeriod;
  staffList: Staff[];
  assignedShifts: AssignedShift[];
  onConfirmPublish: (customMessage: string) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  period,
  staffList,
  assignedShifts,
  onConfirmPublish
}) => {
  const [customNote, setCustomNote] = useState(
    'いつも勤務ありがとうございます！10月前半のシフトが確定しました。各自LINEのメニュー「確定シフト確認」より詳細をご確認ください。交代や相談がある場合は店長までお早めに！'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">シフトの確定 & LINE一斉通知</h3>
              <p className="text-[11px] text-neutral-400">
                スタッフ全員のLINEアカウントへ確定スケジュールを配信します
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-neutral-500">対象期間</div>
              <div className="font-bold text-neutral-900 mt-0.5">{period.title.split(' ')[0]}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500">配信対象</div>
              <div className="font-bold text-neutral-900 mt-0.5">{staffList.length} 名全員</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500">総配置シフト</div>
              <div className="font-bold text-neutral-900 mt-0.5">{assignedShifts.length} コマ</div>
            </div>
          </div>

          {/* LINE Message Preview */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-700">
              スタッフへの配信メッセージ（編集可）:
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="w-full border border-neutral-300 rounded p-2.5 text-xs text-neutral-900"
            />
          </div>

          {/* Visual Flex Preview */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>各スタッフのLINE受信イメージ:</span>
            </div>
            <div className="bg-white border border-emerald-200 rounded p-2.5 space-y-1 text-[11px] text-neutral-800">
              <div className="font-bold text-emerald-800">【さんど亭ガーデン】確定シフトのお知らせ</div>
              <div className="text-neutral-600">{customNote}</div>
              <div className="pt-1 border-t border-neutral-100 text-[10px] text-neutral-500 font-mono">
                ※各自の出勤予定日・開始終了時刻が自動でパーソナライズされて送信されます。
              </div>
            </div>
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
            onClick={() => onConfirmPublish(customNote)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" />
            確定してLINE一斉配信を実行
          </button>
        </div>
      </div>
    </div>
  );
};
