import React, { useState } from 'react';
import { Staff } from '../../types/shift';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Clock,
  Coins,
  ShieldAlert
} from 'lucide-react';

interface StaffManagementViewProps {
  staffList: Staff[];
  onUpdateStaffList: (list: Staff[]) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staffList,
  onUpdateStaffList
}) => {
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'hall',
    isLeader: false,
    hourlyWage: 1150,
    targetMonthlyHours: 60,
    maxConsecutiveDays: 4,
    isStudent: false,
    phone: '',
    lineConnected: true,
    color: '#10b981',
    notes: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      id: `staff-${Date.now()}`,
      name: '',
      role: 'hall',
      isLeader: false,
      hourlyWage: 1150,
      targetMonthlyHours: 60,
      maxConsecutiveDays: 4,
      isStudent: false,
      phone: '090-0000-0000',
      lineUserId: `U${Math.random().toString(36).substring(2, 10)}`,
      lineConnected: true,
      color: '#10b981',
      notes: ''
    });
    setIsAddingNew(true);
    setEditingStaff(null);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ ...staff });
    setIsAddingNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isAddingNew) {
      const newStaff = {
        ...formData,
        id: `staff-${Date.now()}`
      } as Staff;
      onUpdateStaffList([...staffList, newStaff]);
    } else if (editingStaff) {
      const updated = staffList.map(s => (s.id === editingStaff.id ? ({ ...s, ...formData } as Staff) : s));
      onUpdateStaffList(updated);
    }

    setIsAddingNew(false);
    setEditingStaff(null);
  };

  const handleDelete = (staffId: string) => {
    if (confirm('このスタッフを削除してもよろしいですか？')) {
      onUpdateStaffList(staffList.filter(s => s.id !== staffId));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            アルバイトスタッフ名簿 & 条件管理
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            時給、担当職種（キッチン/ホール）、希望稼働時間、労基法上限（連続勤務・学生制限）、LINE連携設定を管理します。
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          新規スタッフ登録
        </button>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {staffList.map(staff => (
          <div
            key={staff.id}
            className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3 shadow-2xs hover:border-neutral-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ backgroundColor: staff.color }}
                >
                  {staff.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-900 text-sm">{staff.name}</span>
                    {staff.isLeader && (
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                        リーダー
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-neutral-700">
                      {staff.role === 'kitchen' ? '厨房 (キッチン)' : staff.role === 'hall' ? '接客 (ホール)' : '厨房/接客 兼任'}
                    </span>
                    {staff.isStudent && (
                      <span className="text-[10px] bg-sky-50 text-sky-700 px-1 py-0.2 rounded">
                        学生
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(staff)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(staff.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-100">
              <div className="text-neutral-500">
                時給: <span className="font-mono font-bold text-neutral-900">¥{staff.hourlyWage.toLocaleString()}</span>
              </div>
              <div className="text-neutral-500">
                目標稼働: <span className="font-mono font-bold text-neutral-900">{staff.targetMonthlyHours}h/月</span>
              </div>
              <div className="text-neutral-500">
                最大連勤: <span className="font-mono font-bold text-neutral-900">{staff.maxConsecutiveDays}日</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">LINE:</span>
                <span className={`text-[11px] font-medium flex items-center gap-0.5 ${staff.lineConnected ? 'text-emerald-600' : 'text-neutral-400'}`}>
                  {staff.lineConnected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {staff.lineConnected ? '連携済' : '未連携'}
                </span>
              </div>
            </div>

            {staff.notes && (
              <div className="bg-neutral-50 p-2 rounded text-[11px] text-neutral-600 border border-neutral-100">
                {staff.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(isAddingNew || editingStaff) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-neutral-900 text-base">
                {isAddingNew ? '新規スタッフ登録' : 'スタッフ情報の編集'}
              </h3>
              <button
                onClick={() => { setIsAddingNew(false); setEditingStaff(null); }}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">氏名</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 山田 太郎"
                  className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">担当職種</label>
                  <select
                    value={formData.role || 'hall'}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  >
                    <option value="hall">接客 (ホール)</option>
                    <option value="kitchen">厨房 (キッチン)</option>
                    <option value="both">厨房 / ホール 兼任</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">時給 (円)</label>
                  <input
                    type="number"
                    step="50"
                    value={formData.hourlyWage || 1150}
                    onChange={e => setFormData({ ...formData, hourlyWage: Number(e.target.value) })}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">月間希望労働時間 (h)</label>
                  <input
                    type="number"
                    value={formData.targetMonthlyHours || 60}
                    onChange={e => setFormData({ ...formData, targetMonthlyHours: Number(e.target.value) })}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">最大連続勤務日数</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.maxConsecutiveDays || 4}
                    onChange={e => setFormData({ ...formData, maxConsecutiveDays: Number(e.target.value) })}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLeader || false}
                    onChange={e => setFormData({ ...formData, isLeader: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-neutral-700">時間帯リーダー</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isStudent || false}
                    onChange={e => setFormData({ ...formData, isStudent: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-neutral-700">学生スタッフ（平日昼間制限）</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">連絡先電話番号</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="090-0000-0000"
                  className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">特記事項・スキルメモ</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="例: 調理経験あり、焼き場対応可、テスト期間あり"
                  className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingStaff(null); }}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-md transition-colors"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
