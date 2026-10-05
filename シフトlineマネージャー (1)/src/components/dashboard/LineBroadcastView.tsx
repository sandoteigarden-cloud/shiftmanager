import React, { useState } from 'react';
import { Staff, ShiftPeriod, UrgentHelpPost } from '../../types/shift';
import {
  Send,
  Bell,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Coins,
  History,
  Smartphone,
  Edit2,
  Trash2
} from 'lucide-react';
import { UrgentHelpEditModal } from '../modals/UrgentHelpEditModal';

interface LineBroadcastViewProps {
  period: ShiftPeriod;
  staffList: Staff[];
  urgentPosts: UrgentHelpPost[];
  notificationsLog: any[];
  onPublishAndNotify: () => void;
  onSendReminder: (staffIds: string[]) => void;
  onCreateUrgentPost: (post: Omit<UrgentHelpPost, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateUrgentPost?: (post: UrgentHelpPost, notifyLine?: boolean) => void;
  onDeleteUrgentPost?: (postId: string) => void;
  onOpenSimulator: () => void;
}

export const LineBroadcastView: React.FC<LineBroadcastViewProps> = ({
  period,
  staffList,
  urgentPosts,
  notificationsLog,
  onPublishAndNotify,
  onSendReminder,
  onCreateUrgentPost,
  onUpdateUrgentPost,
  onDeleteUrgentPost,
  onOpenSimulator
}) => {
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [editingUrgentPost, setEditingUrgentPost] = useState<UrgentHelpPost | null>(null);
  const [urgentDate, setUrgentDate] = useState('2026-10-04');
  const [urgentSlot, setUrgentSlot] = useState<'lunch' | 'dinner'>('dinner');
  const [urgentRole, setUrgentRole] = useState<'kitchen' | 'hall'>('hall');
  const [urgentStart, setUrgentStart] = useState('17:30');
  const [urgentEnd, setUrgentEnd] = useState('23:00');
  const [urgentBonus, setUrgentBonus] = useState(150);
  const [urgentReason, setUrgentReason] = useState('団体ご予約追加のため、ホール急募！');

  const handleCreateUrgent = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateUrgentPost({
      periodId: period.id,
      date: urgentDate,
      slot: urgentSlot,
      role: urgentRole,
      startTime: urgentStart,
      endTime: urgentEnd,
      bonusWagePerHour: Number(urgentBonus),
      reason: urgentReason
    });
    setShowUrgentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase">LINE公式アカウント連携</span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              自動配信センター
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mt-1">
            LINE自動通知 & 欠員急募配信
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            シフトの締切リマインド、完成したシフトの個別自動配信、急な欠員ヘルプ募集をLINEで一斉通知できます。
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5" />
          LINE受信プレビューを開く
        </button>
      </div>

      {/* 3 Core Broadcast Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Shift Confirmation Notice */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                1. 確定シフトの一斉配信
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                作成・調整が完了したシフトを確定し、スタッフ全員のLINEへ個別の確定スケジュールカード（日時・時間・ポジション）を一斉送信します。
              </p>
            </div>

            {/* Visual Flex Message Teaser */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded p-2.5 text-[11px] space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                【さんど亭ガーデン】確定シフトのお知らせ
              </div>
              <div className="text-neutral-600">
                10月前半のシフトが確定しました。あなたの出勤日は計6回です。
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={onPublishAndNotify}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              確定シフトをLINE一斉配信
            </button>
          </div>
        </div>

        {/* Card 2: Shift Request Reminder */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                2. 提出締切リマインド通知
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                シフト希望が未提出のアルバイトスタッフに対し、LINE公式アカウントから締切期限と申請URLボタン付きメッセージを自動送信します。
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded p-2.5 text-[11px] space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                【リマインド】シフト提出のお願い
              </div>
              <div className="text-neutral-600">
                締切は【{period.deadline}】までです。下のボタンから1分で提出できます！
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={() => onSendReminder(staffList.map(s => s.id))}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              未提出者へリマインド配信
            </button>
          </div>
        </div>

        {/* Card 3: Urgent Shift Recruitment */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                3. 突発欠員・ヘルプ急募配信
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                急な宴会予約や当日・前日の体調不良による欠員が発生した際、LINEで即時エントリー募集をかけられます。
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded p-2.5 text-[11px] space-y-1">
              <div className="font-bold text-rose-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                【緊急ヘルプ募集】
              </div>
              <div className="text-neutral-600">
                10/4(土) 17:30〜23:00 ホール1名急募！LINEから1タップで応募可能。
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={() => setShowUrgentModal(true)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              欠員急募を作成してLINE送信
            </button>
          </div>
        </div>
      </div>

      {/* Currently Active Urgent Posts */}
      {urgentPosts.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>募集中の急募案件 ({urgentPosts.length}件)</span>
            </h3>
            <span className="text-xs text-neutral-500">
              スタッフのLINEメニュー「急募・ヘルプ」に掲載中
            </span>
          </div>

          <div className="space-y-2">
            {urgentPosts.map(post => (
              <div
                key={post.id}
                className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-neutral-300 transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-bold text-neutral-900">
                    <span className="font-mono text-sm">{post.date}</span>
                    <span className="text-neutral-400">·</span>
                    <span>{post.slot === 'lunch' ? 'ランチ' : 'ディナー'} ({post.startTime}〜{post.endTime})</span>
                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] rounded">
                      {post.role === 'kitchen' ? '厨房 (キッチン)' : '接客 (ホール)'}
                    </span>
                    {post.status === 'filled' ? (
                      <span className="px-1.5 py-0.2 bg-neutral-200 text-neutral-700 text-[10px] rounded">
                        充足済・受付終了
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LINE募集中
                      </span>
                    )}
                  </div>
                  <div className="text-neutral-600 mt-1">
                    <strong className="text-neutral-700">募集理由:</strong> {post.reason}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingUrgentPost(post)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded font-medium flex items-center gap-1 text-xs transition-colors shadow-2xs"
                    title="急募の内容を変更"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-neutral-600" />
                    <span>内容を編集</span>
                  </button>

                  {onDeleteUrgentPost && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`【${post.date} ${post.slot === 'lunch' ? '昼' : '夜'}】の急募案件を取り下げ・削除しますか？`)) {
                          onDeleteUrgentPost(post.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="この募集を取り下げる"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast History Log Table */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            <h3 className="font-bold text-neutral-900 text-sm">
              LINE配信・通知履歴
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {notificationsLog.length}件の送信履歴
          </span>
        </div>

        {notificationsLog.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            まだ配信履歴がありません。「確定シフト一斉配信」や「リマインド配信」を試してみてください。
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notificationsLog.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{log.title}</span>
                    <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      宛先: {log.recipient || '全員'}
                    </span>
                  </div>
                  <div className="text-neutral-600 mt-0.5 whitespace-pre-line text-[11px]">
                    {log.message.slice(0, 100)}...
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    配信完了
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {new Date(log.sentAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Urgent Recruitment Creation Modal */}
      {showUrgentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>突発欠員・ヘルプ急募の作成 & LINE配信</span>
              </h3>
              <button
                onClick={() => setShowUrgentModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUrgent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    募集日
                  </label>
                  <input
                    type="date"
                    value={urgentDate}
                    onChange={e => setUrgentDate(e.target.value)}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    募集時間帯
                  </label>
                  <select
                    value={urgentSlot}
                    onChange={e => {
                      const newSlot = e.target.value as 'lunch' | 'dinner';
                      setUrgentSlot(newSlot);
                      if (newSlot === 'lunch') {
                        setUrgentStart('10:30');
                        setUrgentEnd('15:00');
                      } else {
                        setUrgentStart('17:30');
                        setUrgentEnd('23:00');
                      }
                    }}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  >
                    <option value="dinner">ディナー帯 (夜)</option>
                    <option value="lunch">ランチ帯 (昼)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    職種
                  </label>
                  <select
                    value={urgentRole}
                    onChange={e => setUrgentRole(e.target.value as any)}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  >
                    <option value="hall">ホール (接客)</option>
                    <option value="kitchen">キッチン (厨房)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    開始時刻
                  </label>
                  <input
                    type="time"
                    value={urgentStart}
                    onChange={e => setUrgentStart(e.target.value)}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    終了時刻
                  </label>
                  <input
                    type="time"
                    value={urgentEnd}
                    onChange={e => setUrgentEnd(e.target.value)}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  募集理由・スタッフへのメッセージ
                </label>
                <textarea
                  rows={2}
                  value={urgentReason}
                  onChange={e => setUrgentReason(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  required
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {[
                    '団体ご予約追加のため、ホール急募！',
                    '突発欠員のため、急遽募集します！',
                    '週末混雑予想のため、キッチン仕込みヘルプ急募！',
                    '体調不良スタッフ発生のため、代打お願いします！'
                  ].map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUrgentReason(r)}
                      className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded transition-colors text-left"
                    >
                      +{r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowUrgentModal(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  LINEで一斉急募を配信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Urgent Recruitment Edit Modal */}
      {editingUrgentPost && onUpdateUrgentPost && (
        <UrgentHelpEditModal
          isOpen={!!editingUrgentPost}
          onClose={() => setEditingUrgentPost(null)}
          post={editingUrgentPost}
          onSave={(updated, notify) => onUpdateUrgentPost(updated, notify)}
          onDelete={postId => {
            if (onDeleteUrgentPost) onDeleteUrgentPost(postId);
          }}
        />
      )}
    </div>
  );
};
