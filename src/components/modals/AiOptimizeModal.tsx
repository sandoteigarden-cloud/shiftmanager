import React, { useState } from 'react';
import { Staff, ShiftPeriod, ShiftSubmission, ShiftRequirements, AssignedShift, OptimizationResult } from '../../types/shift';
import { ApiService } from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  X
} from 'lucide-react';

interface AiOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: ShiftPeriod;
  staffList: Staff[];
  submissions: ShiftSubmission[];
  requirements: ShiftRequirements;
  onApplyOptimization: (newShifts: AssignedShift[]) => void;
}

export const AiOptimizeModal: React.FC<AiOptimizeModalProps> = ({
  isOpen,
  onClose,
  period,
  staffList,
  submissions,
  requirements,
  onApplyOptimization
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  const handleStartOptimize = async () => {
    setIsProcessing(true);
    setResult(null);
    setStepLog(['1. スタッフの希望シフト（○・△・✕）とコメントを解析中...']);

    setTimeout(() => {
      setStepLog(prev => [...prev, '2. 労基法（連勤上限5日・週40時間・未成年22時制限）の検証中...']);
    }, 400);

    setTimeout(() => {
      setStepLog(prev => [...prev, '3. 金土日ディナーの必要厨房スキル & ホール要件を最適マッチング中...']);
    }, 800);

    try {
      const res = await ApiService.optimizeShifts({
        period,
        staffList,
        submissions,
        requirements
      });

      setIsAiGenerated(res.aiGenerated);
      setResult(res.data);
      setStepLog(prev => [...prev, '4. 最適シフト配置案の生成が完了しました！']);
    } catch (e) {
      console.error('Error optimizing shifts:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!result) return;

    // Convert optimized assignments to AssignedShift format
    const newShifts: AssignedShift[] = result.assignedShifts.map((as, idx) => ({
      id: `shift-opt-${Date.now()}-${idx}`,
      periodId: period.id,
      staffId: as.staffId,
      date: as.date,
      slot: as.slot,
      role: as.role,
      startTime: as.startTime,
      endTime: as.endTime,
      hours: as.slot === 'lunch' ? 4.5 : 6.0,
      note: as.reason
    }));

    onApplyOptimization(newShifts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI自動シフト編成・最適化エンジン</h3>
              <p className="text-[11px] text-neutral-400">
                希望休順守 · スキル配分 · 労基法コンプライアンス · 人件費効率化
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Rules Checklist */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 space-y-2">
            <div className="font-bold text-neutral-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>自動シフト編成における厳格なチェック基準</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>希望NG日（✕）の100%回避</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>全営業帯に厨房調理可能者を必ず配備</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>学生の学業・試験期間の完全配慮</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>未成年の22:00以降勤務禁止の徹底</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>最大連続勤務5日以内 & 週休2日確保</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>目標稼働時間と月収バランスの平準化</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          {!result && !isProcessing && (
            <div className="text-center py-6 space-y-3">
              <p className="text-neutral-600 text-xs">
                現在提出されている <strong>{submissions.length}名</strong> の希望データと店舗の必要人数をもとに、最適なシフト表を数秒で自動生成します。
              </p>
              <button
                onClick={handleStartOptimize}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-md inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI自動シフト最適化を開始する
              </button>
            </div>
          )}

          {/* Progress / Step Log */}
          {isProcessing && (
            <div className="bg-neutral-900 text-emerald-400 rounded-lg p-4 font-mono text-[11px] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold mb-2">
                <Clock className="w-4 h-4 animate-spin text-emerald-400" />
                <span>AIエンジンがシフト要件を計算中...</span>
              </div>
              {stepLog.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Results Summary */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>シフト自動生成が完了しました！</span>
                  </div>
                  <div className="font-mono text-xs font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    充足率: {result.satisfactionRate}%
                  </div>
                </div>

                <p className="text-neutral-700 text-xs leading-relaxed">
                  {result.summary}
                </p>

                {isAiGenerated && (
                  <div className="text-[10px] text-emerald-700 font-medium pt-1">
                    ✨ Gemini 3.8 Flash により最適化されました
                  </div>
                )}
              </div>

              {/* Adjustments Highlights */}
              <div className="space-y-1.5">
                <div className="font-bold text-neutral-800 text-xs">
                  AIによる配慮 & 調整ポイント:
                </div>
                <div className="space-y-1">
                  {result.adjustmentsMade.map((adj, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-50 border border-neutral-200 p-2 rounded text-[11px] text-neutral-700 flex items-start gap-2"
                    >
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{adj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unfilled warnings (if any) */}
              {result.unfilledSlots.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                  <div className="font-bold text-amber-900 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>要確認・ヘルプ急募推奨スロット ({result.unfilledSlots.length}箇所)</span>
                  </div>
                  {result.unfilledSlots.slice(0, 3).map((un, idx) => (
                    <div key={idx} className="text-[11px] text-amber-800">
                      ・{un.date} {un.slot === 'lunch' ? '昼' : '夜'}: {un.recommendation}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors"
          >
            キャンセル
          </button>

          {result ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartOptimize}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
              >
                再計算する
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                このAIシフト案をシフト表に反映する
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-neutral-400">
              ※反映前にいつでもやり直しが可能です
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
