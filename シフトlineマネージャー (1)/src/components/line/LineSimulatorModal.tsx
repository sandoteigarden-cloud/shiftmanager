import React, { useState } from 'react';
import {
  Staff,
  ShiftPeriod,
  ShiftSubmission,
  AssignedShift,
  UrgentHelpPost,
  LineChatMessage
} from '../../types/shift';
import {
  Smartphone,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  X,
  User,
  Sparkles,
  Info,
  Download
} from 'lucide-react';
import { generateIcsCalendar, downloadIcsFile } from '../../utils/calendarExport';

interface LineSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: Staff[];
  period: ShiftPeriod;
  submissions: ShiftSubmission[];
  assignedShifts: AssignedShift[];
  urgentPosts: UrgentHelpPost[];
  chatMessages: LineChatMessage[];
  onSendMessage: (msg: LineChatMessage) => void;
  onSubmitShiftRequest: (submission: ShiftSubmission) => void;
  onApplyUrgentHelp: (urgentId: string, staffId: string) => void;
  initialStaffId?: string;
}

export const LineSimulatorModal: React.FC<LineSimulatorModalProps> = ({
  isOpen,
  onClose,
  staffList,
  period,
  submissions,
  assignedShifts,
  urgentPosts,
  chatMessages,
  onSendMessage,
  onSubmitShiftRequest,
  onApplyUrgentHelp,
  initialStaffId
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    initialStaffId || staffList[1]?.id || staffList[0]?.id || 'staff-2'
  );
  const [showLiffModal, setShowLiffModal] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // LIFF Form State (Supports clean 4-mode selection: off / lunch / dinner / all_day with 2 in-times)
  interface LiffDayEntry {
    date: string;
    shiftType: 'off' | 'lunch' | 'dinner' | 'all_day';
    lunchInTime: string;  // e.g. "10:00"
    dinnerInTime: string; // e.g. "16:30"
    note?: string;
  }

  const [liffEntries, setLiffEntries] = useState<LiffDayEntry[]>([]);
  const [liffComment, setLiffComment] = useState('');
  // Standard default in-times for quick entry
  const [defaultLunchIn, setDefaultLunchIn] = useState('10:00');
  const [defaultDinnerIn, setDefaultDinnerIn] = useState('16:30');

  const currentStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];
  const currentSubmission = submissions.find(s => s.staffId === selectedStaffId && s.periodId === period.id);

  // Initialize LIFF dates
  const openLiff = () => {
    const dates: LiffDayEntry[] = [];
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = currentSubmission?.entries.find(e => e.date === dateStr);
      const dayIdx = d.getDay();
      const isWeekend = dayIdx === 0 || dayIdx === 6;

      if (existing) {
        const isUnavailable = existing.preference === 'unavailable';
        let shiftType: 'off' | 'lunch' | 'dinner' | 'all_day' = 'off';
        if (!isUnavailable) {
          const hasLunch = !!existing.lunchInTime || existing.slots?.includes('lunch') || (!!existing.startTime && (existing.startTime.includes('10:') || existing.startTime.includes('11:') || existing.startTime.includes('昼')));
          const hasDinner = !!existing.dinnerInTime || existing.slots?.includes('dinner') || (!!existing.startTime && (existing.startTime.includes('16:') || existing.startTime.includes('17:') || existing.startTime.includes('18:') || existing.startTime.includes('夜')));

          if (hasLunch && hasDinner) {
            shiftType = 'all_day';
          } else if (hasLunch) {
            shiftType = 'lunch';
          } else {
            shiftType = 'dinner';
          }
        }

        dates.push({
          date: dateStr,
          shiftType,
          lunchInTime: existing.lunchInTime || (existing.startTime && !existing.startTime.includes('/') ? existing.startTime : '10:00'),
          dinnerInTime: existing.dinnerInTime || (existing.startTime && !existing.startTime.includes('/') ? existing.startTime : (isWeekend ? '16:30' : '17:30')),
          note: existing.note
        });
      } else {
        // Default: weekend is all_day (通し 10:00 / 16:30); weekday dinner only
        dates.push({
          date: dateStr,
          shiftType: isWeekend ? 'all_day' : 'dinner',
          lunchInTime: '10:00',
          dinnerInTime: isWeekend ? '16:30' : '17:30'
        });
      }
    }

    setLiffEntries(dates);
    setLiffComment(currentSubmission?.overallComment || '');
    setShowLiffModal(true);
  };

  const setDayShiftType = (dateStr: string, type: 'off' | 'lunch' | 'dinner' | 'all_day') => {
    setLiffEntries(prev =>
      prev.map(item => {
        if (item.date !== dateStr) return item;
        return {
          ...item,
          shiftType: type,
          lunchInTime: item.lunchInTime || defaultLunchIn,
          dinnerInTime: item.dinnerInTime || (type === 'all_day' ? defaultDinnerIn : item.dinnerInTime)
        };
      })
    );
  };

  const setLunchInTime = (dateStr: string, time: string) => {
    setLiffEntries(prev =>
      prev.map(item => {
        if (item.date !== dateStr) return item;
        return { ...item, lunchInTime: time };
      })
    );
  };

  const setDinnerInTime = (dateStr: string, time: string) => {
    setLiffEntries(prev =>
      prev.map(item => {
        if (item.date !== dateStr) return item;
        return { ...item, dinnerInTime: time };
      })
    );
  };

  const handleApplyPreset = (preset: 'weekday_night' | 'weekend_both' | 'all_working' | 'all_all_day' | 'clear_all') => {
    setLiffEntries(prev =>
      prev.map(item => {
        const d = new Date(item.date);
        const dayIdx = d.getDay();
        const isWeekend = dayIdx === 0 || dayIdx === 6;

        if (preset === 'weekday_night') {
          return {
            ...item,
            shiftType: !isWeekend ? 'dinner' : 'off',
            dinnerInTime: '17:30'
          };
        } else if (preset === 'weekend_both') {
          return {
            ...item,
            shiftType: isWeekend ? 'all_day' : 'off',
            lunchInTime: defaultLunchIn,
            dinnerInTime: defaultDinnerIn
          };
        } else if (preset === 'all_working') {
          return {
            ...item,
            shiftType: isWeekend ? 'all_day' : 'dinner',
            lunchInTime: defaultLunchIn,
            dinnerInTime: isWeekend ? defaultDinnerIn : '17:30'
          };
        } else if (preset === 'all_all_day') {
          return {
            ...item,
            shiftType: 'all_day',
            lunchInTime: defaultLunchIn,
            dinnerInTime: defaultDinnerIn
          };
        } else {
          return {
            ...item,
            shiftType: 'off'
          };
        }
      })
    );
  };

  // Quick apply default in-times to all days
  const handleApplyDefaultsToAll = () => {
    setLiffEntries(prev =>
      prev.map(item => ({
        ...item,
        lunchInTime: defaultLunchIn,
        dinnerInTime: defaultDinnerIn
      }))
    );
  };

  // Submit Shift from LIFF
  const handleLiffSubmit = () => {
    const activeEntries = liffEntries.filter(e => e.shiftType !== 'off');

    const submission: ShiftSubmission = {
      id: `sub-${currentStaff.id}-${Date.now()}`,
      staffId: currentStaff.id,
      periodId: period.id,
      submittedAt: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      overallComment: liffComment,
      entries: liffEntries.map(e => {
        const slots: ('lunch' | 'dinner')[] = [];
        let startTimeStr: string | undefined = undefined;
        let pref: 'available' | 'preferred_time' | 'unavailable' = 'unavailable';

        if (e.shiftType === 'all_day') {
          slots.push('lunch', 'dinner');
          startTimeStr = `昼${e.lunchInTime} / 夜${e.dinnerInTime}`;
          pref = 'available'; // 通しOKの場合は○
        } else if (e.shiftType === 'lunch') {
          slots.push('lunch');
          startTimeStr = `${e.lunchInTime}`;
          pref = 'preferred_time'; // ランチ・ディナーどちらかだけの場合は△
        } else if (e.shiftType === 'dinner') {
          slots.push('dinner');
          startTimeStr = `${e.dinnerInTime}`;
          pref = 'preferred_time'; // ランチ・ディナーどちらかだけの場合は△
        }

        return {
          date: e.date,
          preference: pref,
          startTime: startTimeStr,
          lunchInTime: e.shiftType === 'all_day' || e.shiftType === 'lunch' ? e.lunchInTime : undefined,
          dinnerInTime: e.shiftType === 'all_day' || e.shiftType === 'dinner' ? e.dinnerInTime : undefined,
          slots: slots.length > 0 ? slots : ['dinner'],
          note: e.note
        };
      })
    };

    onSubmitShiftRequest(submission);
    setShowLiffModal(false);

    // Send confirmation in LINE chat with both in-times and NO end times
    const summaryLines = liffEntries.map(e => {
      const d = new Date(e.date);
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayName = dayNames[d.getDay()];
      if (e.shiftType === 'off') {
        return `・${e.date.slice(5)}(${dayName}) ✕ 休み`;
      }
      if (e.shiftType === 'all_day') {
        return `・${e.date.slice(5)}(${dayName}) ○ 通しOK (昼${e.lunchInTime} / 夜${e.dinnerInTime})`;
      }
      if (e.shiftType === 'lunch') {
        return `・${e.date.slice(5)}(${dayName}) △ 昼のみ (${e.lunchInTime}in)`;
      }
      return `・${e.date.slice(5)}(${dayName}) △ 夜のみ (${e.dinnerInTime}in)`;
    });

    const userMessage: LineChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: `【シフト希望送信完了】\n対象: ${period.title}\n希望日数: ${activeEntries.length}日\n希望シフト一覧:\n${summaryLines.join('\n')}\nコメント: ${liffComment || 'なし'}`
    };

    const botReply: LineChatMessage = {
      id: `msg-${Date.now()}-bot`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'flex_receipt',
      text: `${currentStaff.name}さん、シフト希望の受付が完了しました！店長が調整を行い、確定シフト（出勤in時間）をLINEへ個別にお送りします。`
    };

    onSendMessage(userMessage);
    setTimeout(() => {
      onSendMessage(botReply);
    }, 400);
  };

  // Send typed text from user to bot
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg: LineChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: userText
    };
    onSendMessage(userMsg);

    // Simulated Bot response based on keywords
    setTimeout(() => {
      let reply = '';
      if (userText.includes('シフト') || userText.includes('確認')) {
        const myShifts = assignedShifts.filter(as => as.staffId === currentStaff.id);
        if (myShifts.length > 0) {
          reply = `【${currentStaff.name}さんの確定シフト】\n` +
            myShifts.map(s => `・${s.date.slice(5)} ${s.slot === 'lunch' ? '昼' : '夜'} ${s.startTime || (s.slot === 'lunch' ? '10:30' : '17:00')}in`).join('\n') +
            `\n\n変更や相談がある場合は店長までお気軽にお申し付けください。`;
        } else {
          reply = `現在、${currentStaff.name}さんの確定シフトは未登録または調整中です。確定次第、LINEでお知らせします！`;
        }
      } else if (userText.includes('ヘルプ') || userText.includes('急募')) {
        if (urgentPosts.length > 0) {
          const post = urgentPosts[0];
          reply = `【現在募集中の急募】\n・日付: ${post.date}\n・時間帯: ${post.slot === 'lunch' ? 'ランチ' : 'ディナー'} (${post.startTime}in)\n・職種: ${post.role === 'kitchen' ? '厨房' : '接客'}\n・理由: ${post.reason}\n\n下の「急募エントリー」ボタンから応募できます！`;
        } else {
          reply = '現在、急募案件はございません。ご協力ありがとうございます！';
        }
      } else {
        reply = `「${userText}」を受け付けました。\nシフト希望提出や確認は、下のメニューからいつでもワンタップで行えます。`;
      }

      onSendMessage({
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        text: reply
      });
    }, 450);
  };

  // Trigger from Rich Menu: Check Shift
  const handleCheckShiftsFromMenu = () => {
    const userMsg: LineChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: '確定シフト確認'
    };
    onSendMessage(userMsg);

    setTimeout(() => {
      const myShifts = assignedShifts.filter(as => as.staffId === currentStaff.id);
      const shiftText = myShifts.length > 0
        ? `【${currentStaff.name}さんの確定シフト一覧】\n合計: ${myShifts.length}回勤務\n` +
          myShifts.map(s => {
            const slotText = s.slot === 'lunch' ? '昼' : '夜';
            const roleText = s.role === 'kitchen' ? '厨' : 'ホ';
            const inTime = s.startTime || (s.slot === 'lunch' ? '10:30' : '17:00');
            return `📅 ${s.date} ${slotText}${roleText}${inTime}in (就労${s.hours}h)`;
          }).join('\n')
        : '現在、確定済みのシフトはありません。シフト調整中ですので完了通知をお待ちください。';

      onSendMessage({
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        type: 'flex_shift_card',
        text: shiftText
      });
    }, 400);
  };

  // Trigger from Rich Menu: Urgent covers
  const handleCheckUrgentFromMenu = () => {
    const userMsg: LineChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: '急募案件を確認'
    };
    onSendMessage(userMsg);

    setTimeout(() => {
      onSendMessage({
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        type: 'flex_urgent',
        text: urgentPosts.length > 0
          ? `現在【${urgentPosts.length}件】の急募があります！ご都合のつく方はぜひご協力ください。`
          : '現在、急募案件はありません。ご協力感謝いたします。'
      });
    }, 400);
  };

  // Trigger from Rich Menu: Profile info
  const handleCheckProfileFromMenu = () => {
    const userMsg: LineChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: '登録情報の確認'
    };
    onSendMessage(userMsg);

    setTimeout(() => {
      onSendMessage({
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        text: `【${currentStaff.name}さんの登録情報】\n・担当: ${currentStaff.role === 'kitchen' ? '厨房' : currentStaff.role === 'hall' ? '接客' : '兼任'}\n・時給: ¥${currentStaff.hourlyWage.toLocaleString()}\n・月間目標稼働: ${currentStaff.targetMonthlyHours}時間\n・最大連勤制限: ${currentStaff.maxConsecutiveDays}日\n※設定変更は店長まで直接ご相談ください。`
      });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs">
      {/* Smartphone Container */}
      <div className="relative w-full max-w-[390px] h-[800px] max-h-[95vh] bg-[#708090] rounded-[44px] shadow-2xl border-4 border-neutral-800 flex flex-col overflow-hidden">
        {/* iOS Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-full z-30"></div>

        {/* Top Header / Switcher Bar */}
        <div className="bg-[#2b303c] text-white pt-8 pb-2 px-3 flex items-center justify-between text-xs z-20 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400">操作スタッフ:</span>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              className="bg-neutral-800 text-white border border-neutral-700 rounded px-1.5 py-0.5 text-xs font-semibold"
            >
              {staffList.map(s => {
                const sub = submissions.some(sub => sub.staffId === s.id && sub.periodId === period.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({sub ? '提出済' : '未提出'})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-white"
            title="閉じる"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* LINE Chat Header */}
        <div className="bg-[#242730] text-white px-3 py-2 flex items-center justify-between border-b border-neutral-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-2xs">
              サ
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1">
                <span>さんど亭ガーデン 公式シフト</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 text-[8px] flex items-center justify-center text-white">✓</span>
              </div>
              <div className="text-[10px] text-neutral-400">公式アカウント</div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400">
            {currentSubmission ? (
              <span className="text-emerald-400 font-medium">● 提出済</span>
            ) : (
              <span className="text-amber-400 font-medium">● 未提出</span>
            )}
          </div>
        </div>

        {/* LINE Chat Bubble Stream */}
        <div className="flex-1 bg-[#849ebf] overflow-y-auto p-3 space-y-3">
          <div className="text-center">
            <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full">
              今日
            </span>
          </div>

          {chatMessages.map(msg => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    サ
                  </div>
                )}

                <div className={`max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Standard Text Message */}
                  {msg.type === 'text' && (
                    <div
                      className={`p-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                        isUser
                          ? 'bg-[#8de855] text-neutral-900 rounded-tr-none'
                          : 'bg-white text-neutral-900 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Flex Message: Shift Confirmation Card */}
                  {msg.type === 'flex_shift_card' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden text-neutral-900 border border-neutral-200 w-64">
                      <div className="bg-emerald-600 text-white p-2.5">
                        <div className="text-[10px] font-semibold tracking-wider opacity-90">さんど亭ガーデン</div>
                        <div className="font-bold text-xs mt-0.5">確定シフトのお知らせ</div>
                      </div>
                      <div className="p-3 text-xs space-y-2 whitespace-pre-line leading-relaxed">
                        <div className="font-mono text-[11px] text-neutral-700 bg-neutral-50 p-2 rounded border border-neutral-100">
                          {msg.text}
                        </div>
                        <div className="space-y-1.5 pt-1">
                          <button
                            onClick={() => {
                              const myShifts = assignedShifts.filter(as => as.staffId === currentStaff.id);
                              if (myShifts.length === 0) return;
                              const ics = generateIcsCalendar(myShifts, staffList, {
                                calendarTitle: `さんど亭ガーデンシフト (${currentStaff.name})`,
                                storeName: 'さんど亭ガーデン'
                              });
                              downloadIcsFile(ics, `${currentStaff.name}_さんど亭ガーデンシフト.ics`);
                            }}
                            className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                            title="GoogleカレンダーやOutlook、iPhoneカレンダーにシフトを取り込む"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>カレンダー登録 (.ics)</span>
                          </button>
                          <button
                            onClick={openLiff}
                            className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium rounded transition-colors"
                          >
                            変更相談・再申請
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flex Message: Urgent Help Recruitment Card */}
                  {msg.type === 'flex_urgent' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden text-neutral-900 border border-neutral-200 w-64">
                      <div className="bg-rose-600 text-white p-2.5">
                        <div className="text-[10px] font-semibold opacity-90">急募・ヘルプ要請</div>
                        <div className="font-bold text-xs mt-0.5">出勤協力のお願い</div>
                      </div>
                      <div className="p-3 text-xs space-y-2">
                        {urgentPosts.length > 0 ? (
                          urgentPosts.map(p => (
                            <div key={p.id} className="bg-rose-50 border border-rose-200 rounded p-2 text-[11px] space-y-1">
                              <div className="font-bold text-rose-900">
                                {p.date} {p.slot === 'lunch' ? '昼' : '夜'} ({p.startTime}in)
                              </div>
                              <div className="text-neutral-600">
                                職種: {p.role === 'kitchen' ? '厨房' : '接客'}{p.reason ? ` · ${p.reason}` : ''}
                              </div>
                              <button
                                onClick={() => {
                                  onApplyUrgentHelp(p.id, currentStaff.id);
                                  onSendMessage({
                                    id: `msg-${Date.now()}-user`,
                                    sender: 'user',
                                    timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                                    type: 'text',
                                    text: `【急募エントリー】${p.date} ${p.slot === 'lunch' ? '昼' : '夜'}に入れます！`
                                  });
                                }}
                                className="w-full mt-1.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                このシフトに入る (応募)
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-neutral-500 text-center py-2">
                            現在募集中の急募はありません。
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flex Message: Shift Submission Receipt Card */}
                  {msg.type === 'flex_receipt' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden text-neutral-900 border border-neutral-200 w-64">
                      <div className="bg-emerald-600 text-white p-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-bold text-xs">シフト希望受付完了</span>
                      </div>
                      <div className="p-3 text-xs space-y-2">
                        <div className="text-neutral-700 leading-relaxed text-[11px]">
                          {msg.text}
                        </div>
                        <div className="bg-neutral-50 p-2 rounded text-[10px] text-neutral-500">
                          送信者: {currentStaff.name} 様
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-neutral-700/80 mb-0.5 shrink-0">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
        </div>

        {/* LINE Chat Input Row */}
        <form onSubmit={handleSendChat} className="bg-white px-2 py-1.5 flex items-center gap-2 border-t border-neutral-200 shrink-0">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="メッセージを入力（例: シフト確認、ヘルプ）"
            className="flex-1 bg-neutral-100 rounded-full px-3 py-1.5 text-xs text-neutral-900 outline-none"
          />
          <button
            type="submit"
            className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* LINE Rich Menu (リッチメニュー) */}
        <div className="bg-[#1f2229] border-t border-neutral-800 text-white grid grid-cols-2 gap-px p-1 shrink-0">
          <button
            onClick={openLiff}
            className="bg-[#2a2e38] hover:bg-[#343946] p-2.5 rounded-sm flex flex-col items-center justify-center text-center transition-colors group"
          >
            <Calendar className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold mt-1 text-white">📅 シフト希望提出</span>
            <span className="text-[9px] text-neutral-400">1分でかんたん入力</span>
          </button>

          <button
            onClick={handleCheckShiftsFromMenu}
            className="bg-[#2a2e38] hover:bg-[#343946] p-2.5 rounded-sm flex flex-col items-center justify-center text-center transition-colors group"
          >
            <CheckCircle2 className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold mt-1 text-white">📋 確定シフト確認</span>
            <span className="text-[9px] text-neutral-400">今月のスケジュール</span>
          </button>

          <button
            onClick={handleCheckUrgentFromMenu}
            className="bg-[#2a2e38] hover:bg-[#343946] p-2.5 rounded-sm flex flex-col items-center justify-center text-center transition-colors group relative"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold mt-1 text-white">🚨 急募・ヘルプ</span>
            <span className="text-[9px] text-rose-300">協力募集中</span>
            {urgentPosts.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={handleCheckProfileFromMenu}
            className="bg-[#2a2e38] hover:bg-[#343946] p-2.5 rounded-sm flex flex-col items-center justify-center text-center transition-colors group"
          >
            <User className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold mt-1 text-white">👤 登録情報の確認</span>
            <span className="text-[9px] text-neutral-400">時給・希望労働時間</span>
          </button>
        </div>

        {/* Interactive LIFF Shift Submission Modal (Full overlay inside the phone) */}
        {showLiffModal && (
          <div className="absolute inset-0 z-40 bg-neutral-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* LIFF Header */}
            <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shrink-0">
              <button
                onClick={() => setShowLiffModal(false)}
                className="text-neutral-500 hover:text-neutral-900 text-xs flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
              <div className="text-center">
                <div className="font-bold text-xs text-neutral-900">シフト希望申請フォーム</div>
                <div className="text-[10px] text-neutral-500">{currentStaff.name} 様</div>
              </div>
              <button
                onClick={() => setShowLiffModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-xs"
              >
                ✕
              </button>
            </div>

            {/* LIFF Form Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {/* Target Period & Instructions */}
              <div className="bg-white border border-neutral-200 rounded-lg p-3 space-y-1">
                <div className="text-[11px] text-neutral-500">対象期間</div>
                <div className="font-bold text-neutral-900 text-sm">{period.title}</div>
                <div className="text-[11px] text-rose-600 font-medium">
                  提出締切: {period.deadline}
                </div>
              </div>

              {/* Quick Template Presets */}
              <div className="bg-white border border-neutral-200 rounded-lg p-2.5 space-y-2">
                <div className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                  <span>かんたん一括プリセット:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('clear_all')}
                    className="text-[10px] text-rose-600 hover:text-rose-800 font-medium"
                  >
                    全日リセット
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('weekday_night')}
                    className="p-1.5 bg-neutral-50 hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 rounded text-[10px] font-bold text-neutral-700 hover:text-amber-900 transition-colors text-center"
                    title="平日夜(17:30)のみ出勤"
                  >
                    🌙 平日夜
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('weekend_both')}
                    className="p-1.5 bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 rounded text-[10px] font-bold text-neutral-700 hover:text-emerald-900 transition-colors text-center"
                    title="土日通し(10:00 / 16:30)"
                  >
                    ☀️🌙 土日通し
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('all_working')}
                    className="p-1.5 bg-neutral-50 hover:bg-sky-50 border border-neutral-200 hover:border-sky-300 rounded text-[10px] font-bold text-neutral-700 hover:text-sky-900 transition-colors text-center"
                    title="平日夜＋土日通し"
                  >
                    夜＋土日通し
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('all_all_day')}
                    className="p-1.5 bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 rounded text-[10px] font-bold text-neutral-700 hover:text-emerald-900 transition-colors text-center"
                    title="全日通し"
                  >
                    ☀️🌙 全通し
                  </button>
                </div>

                {/* Default In-Times for 通し (Lunch & Dinner) */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-md p-2 flex items-center justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                    <span>通しの標準in:</span>
                    <span className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300 text-sky-900 text-[10px]">
                      昼{defaultLunchIn}
                    </span>
                    <span className="text-neutral-400">/</span>
                    <span className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300 text-amber-900 text-[10px]">
                      夜{defaultDinnerIn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={defaultLunchIn}
                      onChange={e => setDefaultLunchIn(e.target.value)}
                      className="bg-white border border-emerald-300 text-[10px] rounded px-1 py-0.5 font-mono cursor-pointer"
                      title="標準の昼in時間"
                    >
                      <option value="10:00">昼10:00</option>
                      <option value="10:30">昼10:30</option>
                      <option value="11:00">昼11:00</option>
                      <option value="11:30">昼11:30</option>
                    </select>
                    <select
                      value={defaultDinnerIn}
                      onChange={e => setDefaultDinnerIn(e.target.value)}
                      className="bg-white border border-emerald-300 text-[10px] rounded px-1 py-0.5 font-mono cursor-pointer"
                      title="標準の夜in時間"
                    >
                      <option value="16:00">夜16:00</option>
                      <option value="16:30">夜16:30</option>
                      <option value="17:00">夜17:00</option>
                      <option value="17:30">夜17:30</option>
                      <option value="18:00">夜18:00</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleApplyDefaultsToAll}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded transition-colors whitespace-nowrap"
                      title="設定した標準時間をすべての通しシフトに一括反映"
                    >
                      反映
                    </button>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Selector */}
              <div className="bg-white border border-neutral-200 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-700 border-b border-neutral-100 pb-1">
                  <span className="font-bold">希望シフト (通しOK: ○ / 昼・夜片方: △ / 休み: ✕):</span>
                  <span className="text-[10px] text-emerald-700 font-medium">通しOKは○・片方は△</span>
                </div>

                <div className="space-y-1.5">
                  {liffEntries.map(item => {
                    const d = new Date(item.date);
                    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
                    const dayOfWeek = dayNames[d.getDay()];
                    const isSat = d.getDay() === 6;
                    const isSun = d.getDay() === 0;

                    return (
                      <div
                        key={item.date}
                        className={`p-2 rounded-lg border transition-all ${
                          item.shiftType === 'all_day'
                            ? 'bg-emerald-50/50 border-emerald-400 shadow-2xs'
                            : item.shiftType === 'lunch'
                            ? 'bg-sky-50/50 border-sky-300 shadow-2xs'
                            : item.shiftType === 'dinner'
                            ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                            : 'bg-neutral-50/70 border-neutral-200'
                        }`}
                      >
                        {/* Day Title & 4-Segment Mode Switcher */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`font-mono text-xs font-bold shrink-0 ${isSat ? 'text-sky-600' : isSun ? 'text-rose-600' : 'text-neutral-900'}`}>
                              {item.date.slice(5)} ({dayOfWeek})
                            </span>

                            {/* Status label badge */}
                            {item.shiftType === 'all_day' ? (
                              <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300 truncate">
                                ○ 通しOK (昼{item.lunchInTime} / 夜{item.dinnerInTime})
                              </span>
                            ) : item.shiftType === 'lunch' ? (
                              <span className="text-[10px] font-mono font-bold text-sky-900 bg-sky-100/90 px-1.5 py-0.5 rounded border border-sky-300 truncate">
                                △ 昼のみ ({item.lunchInTime}in)
                              </span>
                            ) : item.shiftType === 'dinner' ? (
                              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300 truncate">
                                △ 夜のみ ({item.dinnerInTime}in)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-200/80 px-1.5 py-0.5 rounded">
                                ✕ 休み
                              </span>
                            )}
                          </div>

                          {/* 4-button segmented toggle (休み / 昼 / 夜 / 通し) */}
                          <div className="flex items-center bg-white border border-neutral-200 rounded-md p-0.5 shadow-2xs shrink-0">
                            <button
                              type="button"
                              onClick={() => setDayShiftType(item.date, 'off')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                item.shiftType === 'off'
                                  ? 'bg-neutral-600 text-white shadow-2xs'
                                  : 'text-neutral-500 hover:text-neutral-900'
                              }`}
                              title="出勤不可 (✕)"
                            >
                              ✕ 休み
                            </button>
                            <button
                              type="button"
                              onClick={() => setDayShiftType(item.date, 'lunch')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                item.shiftType === 'lunch'
                                  ? 'bg-sky-600 text-white shadow-2xs'
                                  : 'text-sky-700 hover:bg-sky-50'
                              }`}
                              title="ランチのみ希望 (△)"
                            >
                              △ 昼
                            </button>
                            <button
                              type="button"
                              onClick={() => setDayShiftType(item.date, 'dinner')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                item.shiftType === 'dinner'
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'text-amber-700 hover:bg-amber-50'
                              }`}
                              title="ディナーのみ希望 (△)"
                            >
                              △ 夜
                            </button>
                            <button
                              type="button"
                              onClick={() => setDayShiftType(item.date, 'all_day')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                item.shiftType === 'all_day'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title="昼夜どちらも通しOK (○)"
                            >
                              ○ 通し
                            </button>
                          </div>
                        </div>

                        {/* In-Time Selectors: ONLY shown when working, designed to be completely uncluttered */}
                        {item.shiftType === 'all_day' && (
                          <div className="mt-2 pt-2 border-t border-emerald-200/70 flex items-center gap-2">
                            {/* Lunch In */}
                            <div className="flex-1 bg-white border border-emerald-300 rounded-md px-2 py-1 flex items-center justify-between shadow-2xs">
                              <span className="text-[10px] font-bold text-sky-900 flex items-center gap-0.5 shrink-0">
                                <span>☀️</span>
                                <span>昼in:</span>
                              </span>
                              <select
                                value={item.lunchInTime}
                                onChange={e => setLunchInTime(item.date, e.target.value)}
                                className="bg-transparent font-mono font-bold text-sky-950 text-xs focus:outline-none cursor-pointer text-right ml-1"
                              >
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                              </select>
                            </div>

                            <span className="text-neutral-400 font-bold text-xs shrink-0">+</span>

                            {/* Dinner In */}
                            <div className="flex-1 bg-white border border-emerald-300 rounded-md px-2 py-1 flex items-center justify-between shadow-2xs">
                              <span className="text-[10px] font-bold text-amber-900 flex items-center gap-0.5 shrink-0">
                                <span>🌙</span>
                                <span>夜in:</span>
                              </span>
                              <select
                                value={item.dinnerInTime}
                                onChange={e => setDinnerInTime(item.date, e.target.value)}
                                className="bg-transparent font-mono font-bold text-amber-950 text-xs focus:outline-none cursor-pointer text-right ml-1"
                              >
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                <option value="17:30">17:30</option>
                                <option value="18:00">18:00</option>
                                <option value="18:30">18:30</option>
                                <option value="19:00">19:00</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {item.shiftType === 'lunch' && (
                          <div className="mt-2 pt-2 border-t border-sky-200/70 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                              <span>☀️</span>
                              <span>昼のin時間:</span>
                            </span>
                            <select
                              value={item.lunchInTime}
                              onChange={e => setLunchInTime(item.date, e.target.value)}
                              className="bg-white border border-sky-300 font-mono font-bold text-sky-950 text-xs rounded-md px-2.5 py-1 focus:outline-none cursor-pointer shadow-2xs"
                            >
                              <option value="10:00">10:00 in</option>
                              <option value="10:30">10:30 in</option>
                              <option value="11:00">11:00 in</option>
                              <option value="11:30">11:30 in</option>
                            </select>
                          </div>
                        )}

                        {item.shiftType === 'dinner' && (
                          <div className="mt-2 pt-2 border-t border-amber-200/70 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <span>🌙</span>
                              <span>夜のin時間:</span>
                            </span>
                            <select
                              value={item.dinnerInTime}
                              onChange={e => setDinnerInTime(item.date, e.target.value)}
                              className="bg-white border border-amber-300 font-mono font-bold text-amber-950 text-xs rounded-md px-2.5 py-1 focus:outline-none cursor-pointer shadow-2xs"
                            >
                              <option value="16:00">16:00 in</option>
                              <option value="16:30">16:30 in</option>
                              <option value="17:00">17:00 in</option>
                              <option value="17:30">17:30 in</option>
                              <option value="18:00">18:00 in</option>
                              <option value="18:30">18:30 in</option>
                              <option value="19:00">19:00 in</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments / Notes */}
              <div className="bg-white border border-neutral-200 rounded-lg p-3 space-y-1.5">
                <label className="block text-[11px] font-semibold text-neutral-700">
                  店長への連絡・特記事項 (テスト期間・実習等)
                </label>
                <textarea
                  rows={2}
                  value={liffComment}
                  onChange={e => setLiffComment(e.target.value)}
                  placeholder="例: 中間テストのため10/8〜10/10は休み希望です。その分前半多めに入れます！"
                  className="w-full border border-neutral-300 rounded p-2 text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* LIFF Submit Footer */}
            <div className="bg-white border-t border-neutral-200 p-3 shrink-0">
              <button
                onClick={handleLiffSubmit}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                LINEでシフト希望を送信する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
