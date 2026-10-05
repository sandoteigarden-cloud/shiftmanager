import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import {
  Settings,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Send,
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';

export const LineConfigView: React.FC = () => {
  const [config, setConfig] = useState<{
    appUrl: string;
    webhookUrl: string;
    hasGeminiKey: boolean;
    lineConfigured: boolean;
  }>({
    appUrl: '',
    webhookUrl: '',
    hasGeminiKey: false,
    lineConfigured: false
  });

  const [copied, setCopied] = useState(false);
  const [testText, setTestText] = useState('シフト確認');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    ApiService.getConfig().then(cfg => {
      setConfig(cfg);
    });
  }, []);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunWebhookTest = async () => {
    setIsTesting(true);
    try {
      const res = await ApiService.testLineWebhook(testText);
      setTestResult(res);
    } catch (e) {
      setTestResult({ error: 'Failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase">連携設定</span>
          <span className="text-xs text-neutral-400">·</span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            LINE Developers Webhook
          </span>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mt-1">
          LINE公式アカウント & Messaging API 連携設定
        </h2>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
          店舗のLINE公式アカウントと接続することで、アルバイトスタッフが普段利用しているLINEアプリからシフト希望の提出・確認・急募エントリーを行えるようになります。
        </p>
      </div>

      {/* Webhook Endpoint Box */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Webhook URL (LINE Developersに登録するエンドポイント)</span>
          </h3>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            稼働中 (Ready)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={config.webhookUrl || `${window.location.origin}/api/line/webhook`}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs font-mono text-neutral-800 select-all"
          />
          <button
            onClick={handleCopyWebhook}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'コピー完了' : 'URLをコピー'}</span>
          </button>
        </div>

        <div className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 border border-neutral-100 rounded-md p-3">
          <div className="font-semibold text-neutral-700 mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>LINE Developers Console での設定手順:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-neutral-600 ml-1">
            <li>
              <a
                href="https://developers.line.biz/"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                LINE Developersコンソール <ExternalLink className="w-3 h-3" />
              </a>
              にログインし、店舗用の「Messaging API」チャネルを作成
            </li>
            <li>「Messaging API設定」タブを開き、上記のWebhook URLを貼り付けて保存</li>
            <li>「Webhookの利用」を <strong>オン (ON)</strong> に設定</li>
            <li>「応答メッセージ」をオフ、「Webhook」を有効化して完了</li>
          </ol>
        </div>
      </div>

      {/* Interactive Webhook Live Tester */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Webhookエンドポイントの疎通テスト</span>
        </h3>
        <p className="text-xs text-neutral-500">
          サーバーの <code>/api/line/webhook</code> へ模擬LINEテキストイベントを送信し、自動応答やWebhook受付の動作を確認できます。
        </p>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="送信するメッセージ（例: シフト確認、ヘルプ）"
            className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs text-neutral-900"
          />
          <button
            onClick={handleRunWebhookTest}
            disabled={isTesting}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isTesting ? '送信中...' : 'テスト送信'}</span>
          </button>
        </div>

        {testResult && (
          <div className="bg-neutral-900 text-emerald-400 p-3 rounded font-mono text-xs overflow-x-auto">
            {JSON.stringify(testResult, null, 2)}
          </div>
        )}
      </div>

      {/* Staff LINE Onboarding Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
          <QrCode className="w-4 h-4 text-neutral-700" />
          <span>アルバイトスタッフのLINE友だち追加・登録案内</span>
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed">
          新人アルバイトが入社した際、店頭のQRコードまたは案内チラシから店舗公式アカウントを友だち追加してもらうだけで、自動的にリッチメニューからシフト提出画面へアクセスできます。
        </p>

        <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="w-24 h-24 bg-white border border-neutral-300 rounded flex items-center justify-center p-2 shrink-0">
            {/* Visual SVG QR representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900">
              <path fill="currentColor" d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M45 10h10v20h-10z M45 45h20v10h-20z M75 45h15v15h-15z M45 70h15v20h-15z M70 70h20v20h-20z" />
            </svg>
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-neutral-900">さんど亭ガーデン 公式シフトBOT</div>
            <div className="text-neutral-500">LINE ID: @sakurado_shift</div>
            <div className="text-neutral-600 text-[11px] pt-1">
              友だち追加後、画面下の「📅 シフト希望提出」をタップするだけでシフト提出フォーム（LIFF）が立ち上がります。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
