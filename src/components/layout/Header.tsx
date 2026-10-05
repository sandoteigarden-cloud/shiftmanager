import React from 'react';
import { Sparkles, Smartphone, Calendar, Send, Users, Settings, MessageSquare, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'matrix' | 'requests' | 'broadcast' | 'staff' | 'line_config';
  onSelectTab: (tab: 'matrix' | 'requests' | 'broadcast' | 'staff' | 'line_config') => void;
  onOpenAiModal: () => void;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
  unsubmittedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAiModal,
  onToggleSimulator,
  isSimulatorOpen,
  unsubmittedCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            サ
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap">
            さんど亭ガーデン · シフトLINEマネージャー
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('matrix')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            シフト作成・調整
          </button>

          <button
            onClick={() => onSelectTab('requests')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            希望受付一覧
            {unsubmittedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded">
                未提出 {unsubmittedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('broadcast')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'broadcast'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            LINE通知・急募
          </button>

          <button
            onClick={() => onSelectTab('staff')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            スタッフ管理
          </button>

          <button
            onClick={() => onSelectTab('line_config')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'line_config'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            LINE連携設定
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAiModal}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="提出された希望と労基法、必要人数をもとにAIが自動でシフトを編成"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">AI自動シフト調整</span>
            <span className="sm:hidden">AI調整</span>
          </button>

          <button
            onClick={onToggleSimulator}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isSimulatorOpen
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSimulatorOpen ? 'LINE画面を閉じる' : '従業員LINE画面'}</span>
            <span className="sm:hidden">{isSimulatorOpen ? 'LINE閉じる' : 'LINE'}</span>
          </button>
        </div>
      </div>

      {/* Mobile sub navigation bar (visible below md screen width) */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 border-t border-neutral-200 bg-neutral-50/70 scrollbar-none">
        <button
          onClick={() => onSelectTab('matrix')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
            activeTab === 'matrix'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Calendar className="w-3 h-3" />
          シフト作成
        </button>

        <button
          onClick={() => onSelectTab('requests')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
            activeTab === 'requests'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          希望受付
          {unsubmittedCount > 0 && (
            <span className="ml-0.5 px-1 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded">
              {unsubmittedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('broadcast')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Send className="w-3 h-3" />
          LINE通知
        </button>

        <button
          onClick={() => onSelectTab('staff')}
          className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
            activeTab === 'staff'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-3 h-3 text-emerald-600" />
          スタッフ管理
        </button>

        <button
          onClick={() => onSelectTab('line_config')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
            activeTab === 'line_config'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Settings className="w-3 h-3" />
          LINE設定
        </button>
      </div>
    </header>
  );
};
