import React, { useState, useEffect } from 'react';
import {
  Staff,
  ShiftPeriod,
  ShiftSubmission,
  ShiftRequirements,
  AssignedShift,
  UrgentHelpPost,
  LineChatMessage
} from './types/shift';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import { Header } from './components/layout/Header';
import { ShiftMatrixView } from './components/dashboard/ShiftMatrixView';
import { RequestsListView } from './components/dashboard/RequestsListView';
import { LineBroadcastView } from './components/dashboard/LineBroadcastView';
import { StaffManagementView } from './components/dashboard/StaffManagementView';
import { LineConfigView } from './components/dashboard/LineConfigView';
import { LineSimulatorModal } from './components/line/LineSimulatorModal';
import { AiOptimizeModal } from './components/modals/AiOptimizeModal';
import { PublishModal } from './components/modals/PublishModal';
import { CheckCircle2, AlertCircle, RefreshCw, Send, Sparkles } from 'lucide-react';

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<'matrix' | 'requests' | 'broadcast' | 'staff' | 'line_config'>('matrix');

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [period, setPeriod] = useState<ShiftPeriod | null>(null);
  const [requirements, setRequirements] = useState<ShiftRequirements | null>(null);
  const [submissions, setSubmissions] = useState<ShiftSubmission[]>([]);
  const [assignedShifts, setAssignedShifts] = useState<AssignedShift[]>([]);
  const [urgentPosts, setUrgentPosts] = useState<UrgentHelpPost[]>([]);
  const [chatMessages, setChatMessages] = useState<LineChatMessage[]>([]);
  const [notificationsLog, setNotificationsLog] = useState<any[]>([]);

  // Modals & Panels
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorInitialStaffId, setSimulatorInitialStaffId] = useState<string | undefined>();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial load from storage
  useEffect(() => {
    setStaffList(StorageService.getStaff());
    setPeriod(StorageService.getPeriod());
    setRequirements(StorageService.getRequirements());
    setSubmissions(StorageService.getSubmissions());
    setAssignedShifts(StorageService.getAssignedShifts());
    setUrgentPosts(StorageService.getUrgentPosts());
    setChatMessages(StorageService.getChatMessages());
    setNotificationsLog(StorageService.getNotificationsLog());
  }, []);

  // Update handlers
  const handleUpdateAssignedShifts = (newShifts: AssignedShift[]) => {
    setAssignedShifts(newShifts);
    StorageService.saveAssignedShifts(newShifts);
    showToast('シフト割当を更新しました', 'info');
  };

  const handleUpdateStaffList = (newList: Staff[]) => {
    setStaffList(newList);
    StorageService.saveStaff(newList);
    showToast('スタッフ名簿を更新しました');
  };

  // Submit Shift from Employee LINE View
  const handleSubmitShiftRequest = (submission: ShiftSubmission) => {
    const updated = StorageService.addOrUpdateSubmission(submission);
    setSubmissions(updated);
    showToast(`${staffList.find(s => s.id === submission.staffId)?.name} さんのシフト希望を受付・反映しました！`);
  };

  // Send Line Message in Simulator / Push
  const handleSendMessage = (msg: LineChatMessage) => {
    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    StorageService.saveChatMessages(updated);
  };

  // Send Reminder to unsubmitted staff
  const handleSendReminder = async (targetStaffIds: string[]) => {
    const names = staffList
      .filter(s => targetStaffIds.includes(s.id))
      .map(s => s.name)
      .join('、');

    const reminderTitle = '【リマインド】シフト希望提出のお願い';
    const reminderMsg = `【締切: ${period?.deadline}】\nさんど亭ガーデンのアルバイトスタッフの皆さま、次回シフトの提出期限が迫っています。LINEメニューの「📅 シフト希望提出」からご提出をお願いします！`;

    await ApiService.sendLineBroadcast({
      title: reminderTitle,
      message: reminderMsg,
      recipient: `${targetStaffIds.length}名 (${names})`
    });

    // Add message to chat simulator
    const botMsg: LineChatMessage = {
      id: `msg-remind-${Date.now()}`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: `${reminderTitle}\n\n${reminderMsg}`
    };
    handleSendMessage(botMsg);

    // Save notification log
    const logEntry = {
      id: `log-${Date.now()}`,
      title: reminderTitle,
      message: reminderMsg,
      recipient: `${targetStaffIds.length}名 (${names})`,
      sentAt: new Date().toISOString()
    };
    StorageService.addNotificationLog(logEntry);
    setNotificationsLog(StorageService.getNotificationsLog());

    showToast(`未提出スタッフ（${names}）へLINEリマインドを送信しました`);
  };

  // Confirm Publish Shifts
  const handleConfirmPublish = async (customNote: string) => {
    if (!period) return;

    const updatedPeriod: ShiftPeriod = {
      ...period,
      status: 'published'
    };
    setPeriod(updatedPeriod);
    StorageService.savePeriod(updatedPeriod);

    const title = `【さんど亭ガーデン】${period.title} 確定シフトのお知らせ`;
    const message = `${customNote}\n\n各自のLINE画面下メニュー「📋 確定シフト確認」より、今月の出勤日時をご確認いただけます。`;

    await ApiService.sendLineBroadcast({
      title,
      message,
      recipient: 'アルバイト全員'
    });

    // Add to chat simulator
    const botMsg: LineChatMessage = {
      id: `msg-pub-${Date.now()}`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'flex_shift_card',
      text: `${title}\n\n${message}`
    };
    handleSendMessage(botMsg);

    const logEntry = {
      id: `log-${Date.now()}`,
      title,
      message,
      recipient: 'アルバイトスタッフ全員 (8名)',
      sentAt: new Date().toISOString()
    };
    StorageService.addNotificationLog(logEntry);
    setNotificationsLog(StorageService.getNotificationsLog());

    setIsPublishModalOpen(false);
    showToast('シフトを確定し、スタッフ全員へLINE一斉配信しました！');
  };

  // Create Urgent Post
  const handleCreateUrgentPost = async (postData: Omit<UrgentHelpPost, 'id' | 'createdAt' | 'status'>) => {
    const newPost: UrgentHelpPost = {
      ...postData,
      id: `urgent-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newPost, ...urgentPosts];
    setUrgentPosts(updated);
    StorageService.saveUrgentPosts(updated);

    const title = `【緊急ヘルプ募集】${postData.date} ${postData.slot === 'lunch' ? '昼' : '夜'}`;
    const message = `出勤時間: ${postData.startTime}in\n職種: ${postData.role === 'kitchen' ? '厨房' : '接客'}\n理由: ${postData.reason}\n\n入れる方はLINEメニューの「🚨 急募・ヘルプ」から1タップで応募してください！`;

    await ApiService.sendLineBroadcast({
      title,
      message,
      recipient: 'アルバイト全員'
    });

    const botMsg: LineChatMessage = {
      id: `msg-urg-${Date.now()}`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'flex_urgent',
      text: `${title}\n\n${message}`
    };
    handleSendMessage(botMsg);

    const logEntry = {
      id: `log-${Date.now()}`,
      title,
      message,
      recipient: 'アルバイト全員',
      sentAt: new Date().toISOString()
    };
    StorageService.addNotificationLog(logEntry);
    setNotificationsLog(StorageService.getNotificationsLog());

    showToast('欠員急募を作成し、LINEで一斉通知しました！');
  };

  // Update Urgent Post
  const handleUpdateUrgentPost = async (updatedPost: UrgentHelpPost, notifyLine = true) => {
    const updated = urgentPosts.map(p => (p.id === updatedPost.id ? updatedPost : p));
    setUrgentPosts(updated);
    StorageService.saveUrgentPosts(updated);

    if (notifyLine) {
      const title = `【急募内容変更】${updatedPost.date} ${updatedPost.slot === 'lunch' ? '昼' : '夜'}`;
      const message = `募集条件が更新されました。\n時間: ${updatedPost.startTime}in\n職種: ${updatedPost.role === 'kitchen' ? '厨房' : '接客'}\n理由: ${updatedPost.reason}\n\n入れる方はLINEメニュー「🚨 急募・ヘルプ」からご応募ください！`;

      await ApiService.sendLineBroadcast({
        title,
        message,
        recipient: 'アルバイト全員'
      });

      const botMsg: LineChatMessage = {
        id: `msg-urg-upd-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        type: 'flex_urgent',
        text: `${title}\n\n${message}`
      };
      handleSendMessage(botMsg);

      const logEntry = {
        id: `log-${Date.now()}`,
        title,
        message,
        recipient: 'アルバイト全員',
        sentAt: new Date().toISOString()
      };
      StorageService.addNotificationLog(logEntry);
      setNotificationsLog(StorageService.getNotificationsLog());
    }

    showToast('急募ヘルプの募集内容を更新しました！');
  };

  // Delete Urgent Post
  const handleDeleteUrgentPost = (postId: string) => {
    const updated = urgentPosts.filter(p => p.id !== postId);
    setUrgentPosts(updated);
    StorageService.saveUrgentPosts(updated);
    showToast('急募案件を取り下げ・削除しました', 'info');
  };

  // Apply for urgent help from LINE
  const handleApplyUrgentHelp = (urgentId: string, staffId: string) => {
    const post = urgentPosts.find(p => p.id === urgentId);
    const staff = staffList.find(s => s.id === staffId);
    if (!post || !staff) return;

    // Add to assigned shifts
    const newShift: AssignedShift = {
      id: `shift-urgent-${Date.now()}`,
      periodId: post.periodId,
      staffId: staff.id,
      date: post.date,
      slot: post.slot,
      role: post.role,
      startTime: post.startTime,
      endTime: post.endTime,
      hours: post.slot === 'lunch' ? 4.5 : 5.5,
      isUrgentCover: true,
      note: '急募対応'
    };

    const updatedShifts = [...assignedShifts, newShift];
    setAssignedShifts(updatedShifts);
    StorageService.saveAssignedShifts(updatedShifts);

    // Remove or mark post filled
    const updatedUrgent = urgentPosts.filter(p => p.id !== urgentId);
    setUrgentPosts(updatedUrgent);
    StorageService.saveUrgentPosts(updatedUrgent);

    showToast(`${staff.name} さんが急募シフトに応募し、シフト表に即時反映されました！`);
  };

  // Apply AI Optimization
  const handleApplyAiOptimization = (newShifts: AssignedShift[]) => {
    setAssignedShifts(newShifts);
    StorageService.saveAssignedShifts(newShifts);
    showToast('AI最適化シフト案をシフト表に反映しました！');
  };

  // Open simulator for specific staff
  const handleOpenSimulatorForStaff = (staffId: string) => {
    setSimulatorInitialStaffId(staffId);
    setIsSimulatorOpen(true);
  };

  // Reset to default sample data
  const handleResetSampleData = () => {
    if (confirm('初期サンプルデータにリセットしますか？')) {
      StorageService.resetAll();
      window.location.reload();
    }
  };

  const handleSavePeriod = (newPeriod: ShiftPeriod) => {
    const isDatesChanged =
      !period ||
      period.startDate !== newPeriod.startDate ||
      period.endDate !== newPeriod.endDate;

    setPeriod(newPeriod);
    StorageService.savePeriod(newPeriod);

    if (isDatesChanged) {
      // 1. Reset all shift submissions (all staff become unsubmitted for the new period)
      setSubmissions([]);
      StorageService.saveSubmissions([]);

      // 2. Reset assigned shifts for the new cycle
      setAssignedShifts([]);
      StorageService.saveAssignedShifts([]);

      // 3. Reset urgent posts from previous period
      setUrgentPosts([]);
      StorageService.saveUrgentPosts([]);

      // 4. Send fresh announcement message to LINE simulator
      const newCycleMsg: LineChatMessage = {
        id: `msg-cycle-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        text: `【お知らせ】次回【${newPeriod.title}】のシフト希望受付を開始しました！\n【締切: ${newPeriod.deadline}】\n下のメニュー「📅 シフト希望提出」よりご提出をお願いします。`
      };
      const updatedMessages = [...chatMessages, newCycleMsg];
      setChatMessages(updatedMessages);
      StorageService.saveChatMessages(updatedMessages);

      showToast(`期間を「${newPeriod.title}」に変更しました。全スタッフの希望提出ステータスをリセットしました（未提出・新規受付中）`, 'info');
    } else {
      showToast('シフト期間・締切カレンダー設定を更新しました');
    }
  };

  const handleSaveRequirements = (newReqs: ShiftRequirements) => {
    setRequirements(newReqs);
    StorageService.saveRequirements(newReqs);
    showToast('時間帯別の必要人数要件を更新しました');
  };

  if (!period || !requirements) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-600 font-medium text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>システム読み込み中...</span>
        </div>
      </div>
    );
  }

  const unsubmittedCount = staffList.filter(
    s => !submissions.some(sub => sub.staffId === s.id)
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col font-['Noto_Sans_JP',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-3 duration-200">
          <div className="bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-neutral-700">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onToggleSimulator={() => setIsSimulatorOpen(prev => !prev)}
        isSimulatorOpen={isSimulatorOpen}
        unsubmittedCount={unsubmittedCount}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'matrix' && (
          <ShiftMatrixView
            period={period}
            staffList={staffList}
            submissions={submissions}
            assignedShifts={assignedShifts}
            requirements={requirements}
            onUpdateAssignedShifts={handleUpdateAssignedShifts}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            onSavePeriod={handleSavePeriod}
            onSaveRequirements={handleSaveRequirements}
            onUpdateStaffList={handleUpdateStaffList}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsListView
            period={period}
            staffList={staffList}
            submissions={submissions}
            onSendLineReminder={handleSendReminder}
            onOpenSimulatorForStaff={handleOpenSimulatorForStaff}
          />
        )}

        {activeTab === 'broadcast' && (
          <LineBroadcastView
            period={period}
            staffList={staffList}
            urgentPosts={urgentPosts}
            notificationsLog={notificationsLog}
            onPublishAndNotify={() => setIsPublishModalOpen(true)}
            onSendReminder={handleSendReminder}
            onCreateUrgentPost={handleCreateUrgentPost}
            onUpdateUrgentPost={handleUpdateUrgentPost}
            onDeleteUrgentPost={handleDeleteUrgentPost}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManagementView
            staffList={staffList}
            onUpdateStaffList={handleUpdateStaffList}
          />
        )}

        {activeTab === 'line_config' && <LineConfigView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">さんど亭ガーデン シフト管理</span>
            <span>·</span>
            <span>LINE Messaging API & Gemini AI 自動化</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSampleData}
              className="text-neutral-400 hover:text-rose-600 transition-colors"
            >
              サンプルデータを初期化
            </button>
            <span>·</span>
            <span className="text-neutral-400">© 2026 ShiftLine Manager</span>
          </div>
        </div>
      </footer>

      {/* LINE Mobile Client & Simulator Modal */}
      <LineSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        staffList={staffList}
        period={period}
        submissions={submissions}
        assignedShifts={assignedShifts}
        urgentPosts={urgentPosts}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
        onSubmitShiftRequest={handleSubmitShiftRequest}
        onApplyUrgentHelp={handleApplyUrgentHelp}
        initialStaffId={simulatorInitialStaffId}
      />

      {/* AI Shift Optimization Modal */}
      <AiOptimizeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        period={period}
        staffList={staffList}
        submissions={submissions}
        requirements={requirements}
        onApplyOptimization={handleApplyAiOptimization}
      />

      {/* Publish & Broadcast Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        period={period}
        staffList={staffList}
        assignedShifts={assignedShifts}
        onConfirmPublish={handleConfirmPublish}
      />
    </div>
  );
}
