import React, { useState } from 'react';
import { GameProject } from '../types/engine';
import { generateStandaloneGameHtml } from '../utils/standaloneExporter';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  FileCode, 
  Play,
  FileJson
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GameProject;
  language: Language;
  theme: ThemeMode;
  onShowToast: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  language,
  theme,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  const t = translations[language];

  // 1. Download HTML file
  const handleDownloadHtml = () => {
    try {
      const htmlContent = generateStandaloneGameHtml(project);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, '_')}_FY3.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      onShowToast('تم بدء تنزيل ملف اللعبة المستقل (HTML)');
    } catch (err: any) {
      onShowToast('حدث خطأ أثناء إنشاء ملف اللعبة');
    }
  };

  // 2. Play immediately in new tab
  const handlePlayInNewTab = () => {
    try {
      const htmlContent = generateStandaloneGameHtml(project);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        // In case popups are blocked, download instead
        handleDownloadHtml();
      } else {
        onShowToast('تم فتح اللعبة للتشغيل في نافذة جديدة');
      }
    } catch {
      handleDownloadHtml();
    }
  };

  // 3. Copy Code to clipboard
  const handleCopyCode = async () => {
    try {
      const htmlContent = generateStandaloneGameHtml(project);
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      onShowToast('تم نسخ كود اللعبة بالكامل إلى الحافظة');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('تعذر النسخ تلقائياً');
    }
  };

  // 4. Download FY3 Project JSON
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${project.title.replace(/\s+/g, '_')}.fy3.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onShowToast('تم تنزيل ملف مشروع المحرك (JSON)');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-xl border p-6 flex flex-col ${
        theme === 'dark' ? 'bg-black text-white border-white' : 'bg-white text-black border-black shadow-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-700/50">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>تصدير وتشغيل لعبة "{project.title}"</span>
            </h2>
            <p className="text-xs opacity-70 mt-1">
              اختر طريقة تصدير لعبتك للتشغيل المستقل بدون إنترنت أو مشاركتها مع أصدقائك.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:opacity-70 transition-opacity cursor-pointer border border-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="py-6 space-y-3 font-mono">
          {/* Option 1: Direct Download HTML */}
          <button
            onClick={handleDownloadHtml}
            className={`w-full p-4 border text-right flex items-center justify-between transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div className="text-right">
                <div className="font-bold text-sm">تحميل ملف اللعبة المباشر (.HTML)</div>
                <div className="text-[11px] opacity-80 font-sans">ملف ويب كامل مدمج به كل الصور والأصوات والأكواد جاهز للفتح بنقرة واحدة</div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 border border-current">تنزيل</span>
          </button>

          {/* Option 2: Run in new window */}
          <button
            onClick={handlePlayInNewTab}
            className={`w-full p-4 border text-right flex items-center justify-between transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-700 text-white'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300 text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5" />
              <div className="text-right">
                <div className="font-bold text-sm">تشغيل اللعبة فوراً في نافذة جديدة</div>
                <div className="text-[11px] opacity-70 font-sans">معاينة واختبار اللعبة المستقلة كما ستظهر للاعبين في المتصفح</div>
              </div>
            </div>
            <Play className="w-4 h-4" />
          </button>

          {/* Option 3: Copy Standalone HTML Code */}
          <button
            onClick={handleCopyCode}
            className={`w-full p-4 border text-right flex items-center justify-between transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-700 text-white'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300 text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5" />
              <div className="text-right">
                <div className="font-bold text-sm">نسخ كود HTML الكامل</div>
                <div className="text-[11px] opacity-70 font-sans">نسخ الشفرة البرمجية الكاملة للعبة لوضعها في موقعك أو تعديلها</div>
              </div>
            </div>
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Option 4: Download Engine Project JSON */}
          <button
            onClick={handleDownloadJson}
            className={`w-full p-3 border text-right flex items-center justify-between transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-4 h-4" />
              <span className="text-xs">تنزيل ملف مشروع المحرك الكامل (.fy3.json)</span>
            </div>
            <span className="text-[10px] opacity-60">حفظ نسخة احتياطية</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-700/50 flex items-center justify-between text-xs opacity-60 font-mono">
          <span>{t.engineName} v{t.version}</span>
          <span>{t.developerCredit}</span>
        </div>
      </div>
    </div>
  );
};
