import { useState } from 'react';
import { Language, ThemeMode } from '../utils/i18n';
import { 
  X, 
  BookOpen, 
  Layers, 
  Globe, 
  Film, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Monitor
} from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
}

export const InfoModal = ({
  isOpen,
  onClose,
  language,
  theme
}: InfoModalProps) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'fy3' | 'terms'>('terms');

  if (!isOpen) return null;

  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col border shadow-2xl overflow-hidden ${
        isDark ? 'bg-black text-white border-neutral-700' : 'bg-white text-black border-neutral-400'
      }`}>
        {/* Header */}
        <div className={`h-14 px-6 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 font-mono text-xs font-black border ${
              isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
            }`}>
              FY3
            </span>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 border transition-colors cursor-pointer ${
              isDark ? 'border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white' : 'border-neutral-300 hover:border-neutral-600 text-neutral-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b text-xs font-bold overflow-x-auto ${
          isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-300 bg-neutral-100/60'
        }`}>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'terms'
                ? (isDark ? 'border-white text-white bg-black' : 'border-black text-black bg-white')
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isAr ? 'معلومات محرك' : 'Engine Info'}</span>
          </button>

          <button
            onClick={() => setActiveTab('fy3')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fy3'
                ? (isDark ? 'border-white text-white bg-black' : 'border-black text-black bg-white')
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isAr ? 'شرح برمجه' : 'Visual Scripting'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? (isDark ? 'border-white text-white bg-black' : 'border-black text-black bg-white')
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isAr ? 'شرح محرك' : 'Engine Guide'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXACT TERMS & TELEGRAM CONTACT */}
          {activeTab === 'terms' && (
            <div className="max-w-2xl mx-auto space-y-6 leading-relaxed select-text">
              {/* Highlight Card */}
              <div className={`p-6 border ${
                isDark ? 'border-white/40 bg-neutral-950' : 'border-black/40 bg-neutral-50'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-mono font-black text-sm px-2.5 py-0.5 border ${
                    isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                  }`}>
                    FY3
                  </span>
                  <span className="font-bold text-base">
                    {isAr ? 'محرك FY3' : 'FY3 Engine'}
                  </span>
                </div>
                
                <p className="text-sm font-semibold mb-4">
                  {isAr 
                    ? 'محرك مجاني لتطوير الألعاب ثنائية الأبعاد (2D)' 
                    : 'A free engine for 2D game development'}
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                    <div>
                      <strong className="block text-sm">
                        {isAr ? 'سهل الاستخدام:' : 'Easy to use:'}
                      </strong>
                      <span className="opacity-80">
                        {isAr 
                          ? 'مصمم خصيصاً ليناسب المبتدئين والمحترفين.' 
                          : 'Specially crafted for both beginners and experienced creators.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                    <div>
                      <strong className="block text-sm">
                        {isAr ? 'لغات البرمجة:' : 'Programming Languages:'}
                      </strong>
                      <span className="opacity-80">
                        {isAr 
                          ? 'يدعم لغة جافا سكربت (JavaScript) بالإضافة إلى لغة FY3 الخاصة بالمحرك.' 
                          : 'Supports standard JavaScript along with the visual FY3 built-in engine language.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                    <div>
                      <strong className="block text-sm">
                        {isAr ? 'متعدد الاستخدامات:' : 'Versatile:'}
                      </strong>
                      <span className="opacity-80">
                        {isAr 
                          ? 'يتيح لك إنشاء الألعاب، المواقع، والتطبيقات بكل سهولة.' 
                          : 'Allows you to create games, interactive scenes, and apps with ease.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                    <div>
                      <strong className="block text-sm">
                        {isAr ? 'تصدير سريع:' : 'Instant Export:'}
                      </strong>
                      <span className="opacity-80">
                        {isAr 
                          ? 'يدعم تصدير مشاريعك بضغطه زر واحدة.' 
                          : 'Export your entire project to a single standalone HTML file in one click.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strict Terms of Use Card */}
              <div className={`p-5 border ${
                isDark ? 'border-neutral-700 bg-neutral-900/40' : 'border-neutral-300 bg-white'
              }`}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {isAr 
                      ? 'قوانين وشروط استخدام وتعديل المحرك:' 
                      : 'Terms & Conditions for Using and Modifying the Engine:'}
                  </span>
                </h3>

                <ul className="space-y-2 text-xs list-disc list-inside opacity-90 font-medium">
                  <li>
                    {isAr ? 'يمنع إزالة حقوق المطور فليد.' : 'Strictly prohibited to remove developer rights (فليد / yonio fleed).'}
                  </li>
                  <li>
                    {isAr ? 'يمنع تغيير اسم أو شعار المحرك بأي شكل من الأشكال.' : 'Strictly prohibited to modify or alter the engine name or logo in any way.'}
                  </li>
                  <li>
                    {isAr ? 'يُسمح بالتعديل على ملفات المحرك بشرط الالتزام بالشروط أعلاه.' : 'Modification of engine files is permitted provided the above conditions are fully respected.'}
                  </li>
                </ul>
              </div>

              {/* Telegram Community & Support Contact Card */}
              <div className={`p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? 'border-white bg-black' : 'border-black bg-neutral-100'
              }`}>
                <div>
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>
                      {isAr ? 'مجتمع المحرك والدعم الفني:' : 'Community & Technical Support:'}
                    </span>
                  </h4>
                  <p className="text-xs opacity-80">
                    {isAr 
                      ? 'انضم إلى مجتمع مستخدمي محرك FY3 أو تواصل مع المطور:' 
                      : 'Join the FY3 community or contact developer directly:'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://t.me/FY3_Yunio_Fleed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-black font-mono border transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-white text-black border-white hover:bg-neutral-200' 
                        : 'bg-black text-white border-black hover:bg-neutral-800'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>مجتمع المحرك</span>
                  </a>

                  <a
                    href="https://t.me/F0_50"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-black font-mono border transition-all cursor-pointer ${
                      isDark 
                        ? 'border-neutral-700 hover:border-white text-white' 
                        : 'border-neutral-400 hover:border-black text-black'
                    }`}
                  >
                    <span>@F0_50</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FY3 VISUAL LANGUAGE & NODE SCRIPTING GUIDE (DETAILED) */}
          {activeTab === 'fy3' && (
            <div className="max-w-3xl mx-auto space-y-6 text-xs leading-relaxed select-text">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-black text-white px-2 py-0.5 font-bold font-mono text-[10px] border border-neutral-700">
                    NODE-BASED VISUAL SCRIPTING
                  </span>
                  <h3 className="font-bold text-base">
                    {isAr ? 'الدليل الشامل للغة مكعبات FY3 المرئية' : 'Comprehensive FY3 Visual Nodes Guide'}
                  </h3>
                </div>
                <p className="opacity-70">
                  {isAr 
                    ? 'لغة برمجية قائمة على العقد والمكعبات (Node-Based Visual Scripting)، صُممت لتسمح لك ببناء آليات الألعاب والفيزياء وحركة اللاعب والأزرار التفاعلية عن طريق سحب المكعبات وربطها بالوصلات بكل سلاسة.' 
                    : 'A node-based visual language designed to build game mechanics, player physics, button clicks, and camera tracking through intuitive wire connections.'}
                </p>
              </div>

              {/* Section 1: Per-Object Graphs & Wires */}
              <div className={`p-4 border space-y-2 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '1. هيكل البرمجة والوصلات (Graph Architecture & Wires)' : '1. Graph Architecture & Wires'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? '• كل كائن في المشهد له رسم بياني للمكعبات خاص به ومستقل، ويمكنك أيضاً اختيار "العالم / المشهد العام" من قائمة «كائن:» لبرمجة القواعد العامة للعبة.'
                    : '• Every object has its own independent node graph, plus a global scene graph available from the "Target:" selector.'}
                </p>
                <p className="opacity-80">
                  {isAr
                    ? '• نقاط الربط (Sockets): تقع على جانبي كل مكعب (المدخلات على اليسار والمخرجات على اليمين). يمكنك السحب والإفلات المباشر أو النقر السريع للربط بوصلة انسيابية، كما يمكنك حذف أي وصلة بنقرة واحدة على الدائرة في منتصف الوصلة.'
                    : '• Sockets: Drag or click connection sockets between nodes. Delete any wire by clicking the center circle.'}
                </p>
                <p className="opacity-80">
                  {isAr
                    ? '• التحرك والتقريب في ساحة المكعبات: انقر واسحب بزر الماوس الأيمن للتحرك في كافة الاتجاهات (فوق، تحت، يمين، يسار)، واستخدم عجلة الماوس للتقريب والتبعيد بسلاسة.'
                    : '• Canvas Navigation: Right-click drag to pan in all directions, and scroll the mouse wheel to zoom in and out.'}
                </p>
              </div>

              {/* Section 2: Detailed Blocks Catalog */}
              <div className={`p-4 border space-y-4 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '2. شرح تفصيلي لجميع مكعبات FY3 المتوفرة' : '2. Complete FY3 Node Catalog'}
                </h4>

                {/* Event & Trigger Nodes */}
                <div className="space-y-2">
                  <span className="font-bold text-white block border-b border-neutral-800 pb-1">
                    {isAr ? '🔘 مكعبات الأحداث والضغط (Input & Events):' : '🔘 Input & Event Blocks:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white mb-0.5">مكعب ضغط زر / نقر كائن:</strong>
                      <span className="opacity-80">
                        {isAr ? 'اختر مفتاح كيبورد (W, A, S, D, Space, الأسهم...) أو اختر كائن/صورة محددة لتكون زراً قابلاً للنقر في الشاشة.' : 'Trigger on keyboard key or on clicking a scene object / button.'}
                      </span>
                    </div>
                    <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white mb-0.5">بداية المشهد (On Start):</strong>
                      <span className="opacity-80">
                        {isAr ? 'يعمل لمرة واحدة فور تشغيل اللعبة، ممتاز لتشغيل الكاميرا وتجهيز الإعدادات.' : 'Executes once when scene starts; ideal for camera follow setup.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Separate Movement Nodes */}
                <div className="space-y-2">
                  <span className="font-bold text-white block border-b border-neutral-800 pb-1">
                    {isAr ? '🏃 مكعبات الحركة الـ 4 المنفصلة (4 Movement Nodes):' : '🏃 4 Dedicated Movement Blocks:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">حركة +X (يمين):</strong>
                      <span className="opacity-80">تحريك الكائن لليمين مع تحديد السرعة بالأرقام.</span>
                    </div>
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">حركة -X (يسار):</strong>
                      <span className="opacity-80">تحريك الكائن لليسار مع تحديد السرعة بالأرقام.</span>
                    </div>
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">حركة +Y (أسفل):</strong>
                      <span className="opacity-80">تحريك الكائن للأسفل مع تحديد السرعة بالأرقام.</span>
                    </div>
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">حركة -Y (أعلى / قفز):</strong>
                      <span className="opacity-80">تحريك الكائن للأعلى أو قفز بسرعة محددة.</span>
                    </div>
                  </div>
                </div>

                {/* Camera & Physics */}
                <div className="space-y-2">
                  <span className="font-bold text-white block border-b border-neutral-800 pb-1">
                    {isAr ? '📷 الكاميرا والفيزياء (Camera & Physics):' : '📷 Camera & Physics Blocks:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white mb-0.5">تتبع الكاميرا (Camera Follow):</strong>
                      <span className="opacity-80">
                        تتبع الكاميرا للكائن المختار بسلاسة وانسيابية مع ضبط السرعة وبعد الكاميرا.
                      </span>
                    </div>
                    <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white mb-0.5">صلب، ديناميكي، شفاف، جاذبية:</strong>
                      <span className="opacity-80">
                        تحديد طبيعة الكائن (جدار صلب مانع للاختراق، جسم ديناميكي مرتد، حساس شفاف Trigger، أو متأثر بالجاذبية).
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gameplay & Utility */}
                <div className="space-y-2">
                  <span className="font-bold text-white block border-b border-neutral-800 pb-1">
                    {isAr ? '⏱️ أسلوب اللعب والمؤثرات (Gameplay & VFX):' : '⏱️ Gameplay, Audio & Transitions:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">مؤقت وتكرار:</strong>
                      <span className="opacity-80">تأخير زمني بالثواني أو تكرار أوامر مستمر.</span>
                    </div>
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">نقاط وانتقال مشهد:</strong>
                      <span className="opacity-80">إضافة نقاط أو نقل اللاعب إلى مشهد ثانٍ.</span>
                    </div>
                    <div className={`p-2 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                      <strong className="block text-white">تشغيل أصوات:</strong>
                      <span className="opacity-80">تشغيل مؤثرات القفز، الليزر، الانفجار، والفوز.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Practical Visual Scripting Example */}
              <div className={`p-4 border space-y-3 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '3. مثال عملي: برمجة حركة لاعب كاملة بالمكعبات' : '3. Practical Example: Complete Player Movement Graph'}
                </h4>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <span className="text-neutral-400 block mb-1">الخطوة 1: تتبع الكاميرا عند البداية</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">بداية المشهد</span>
                      <span>➔ وصلة ➔</span>
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">تتبع الكاميرا [اللاعب]</span>
                    </div>
                  </div>

                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <span className="text-neutral-400 block mb-1">الخطوة 2: الحركة باليمين واليسار</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">مكعب ضغط [حرف D أو سهم يمين]</span>
                        <span>➔ وصلة ➔</span>
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">حركة +X [السرعة: 120]</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">مكعب ضغط [حرف A أو سهم يسار]</span>
                        <span>➔ وصلة ➔</span>
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">حركة -X [السرعة: 120]</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <span className="text-neutral-400 block mb-1">الخطوة 3: القفز للأعلى</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">مكعب ضغط [مسافة Space]</span>
                      <span>➔ وصلة ➔</span>
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white font-bold">حركة -Y (أعلى) [السرعة: 250]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE ENGINE TEXTUAL GUIDE (شرح محرك) */}
          {activeTab === 'guide' && (
            <div className="max-w-3xl mx-auto space-y-6 text-xs leading-relaxed select-text">
              <div>
                <h3 className="font-bold text-base mb-1">
                  {isAr ? 'شرح محرك ألعاب FY3 v1.0.1 الشامل' : 'FY3 Engine Comprehensive Documentation'}
                </h3>
                <p className="opacity-70">
                  {isAr 
                    ? 'شرح تفصيلي كامل لكافة قدرات وميزات محرك FY3، اللغات المدعومة، البيئة اللانهائية، نظام الطبقات، والفيزياء والتصدير.' 
                    : 'Comprehensive documentation of the FY3 game engine architecture, supported programming languages, infinite world, and export pipeline.'}
                </p>
              </div>

              {/* 1. Overview & Supported Languages */}
              <div className={`p-4 border space-y-2.5 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '1. ما هو محرك FY3 ولغات البرمجة المدعومة؟' : '1. Overview & Supported Languages'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? 'محرك FY3 هو بيئة متكاملة وخفيفة الوزن ومفتوحة لتطوير ألعاب الويب وتطبيقات ثنائية الأبعاد (2D Web Games). تم تطوير المحرك بواسطة يونيو فليد (yonio fleed) • @F0_50 ليمكن المطورين والهواة من تصميم ألعاب كاملة تعمل على أي جهاز وهاتف.'
                    : 'FY3 is a modern 2D game engine crafted by yonio fleed (@F0_50) enabling creators to produce production-ready web and mobile games.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <strong className="block text-white mb-1">لغة جافا سكريبت (JavaScript):</strong>
                    <span className="opacity-80">
                      دعم كامل ومباشر لكتابة دوال دورة حياة اللعبة (onStart, onUpdate, onCollision) مع وصول لكافة مدخلات الفأرة ولوحة المفاتيح والصوتيات.
                    </span>
                  </div>
                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <strong className="block text-white mb-1">لغة مكعبات FY3 (Visual Scripting):</strong>
                    <span className="opacity-80">
                      لغة مكعبات بصرية مبتكرة لا تتطلب كتابة كود، تعتمد على ربط وحدات المنطق والحركة والفيزياء والتصادمات بالأسلاك البنفسجية لكل كائن.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Infinite World Canvas & Controls */}
              <div className={`p-4 border space-y-2.5 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '2. ساحة العمل والعالم اللانهائي (Infinite World Canvas)' : '2. Infinite World Canvas'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? 'ساحة تصميم بلا حدود تمتد في كافة الاتجاهات (X, Y) بدون أي قيود على مساحة اللعبة:'
                    : 'A true boundless canvas expanding infinitely in both X and Y directions:'}
                </p>
                <ul className="list-disc list-inside space-y-1.5 opacity-80 pl-2">
                  <li>
                    {isAr 
                      ? 'التحرك في العالم اللانهائي: انقر بزر الماوس الأيمن واسحب (Right-Click Drag) في أي مكان للتحرك بحرية في جميع الاتجاهات الأربعة.' 
                      : 'Pan: Right-click and drag in any direction across the canvas.'}
                  </li>
                  <li>
                    {isAr 
                      ? 'التقريب والتبعيد: استخدم عجلة الماوس (Mouse Wheel Scroll) للتكبير والتصغير بسلاسة حول موقع المؤشر.' 
                      : 'Zoom: Scroll the mouse wheel to zoom in and out centered on your mouse cursor.'}
                  </li>
                  <li>
                    {isAr 
                      ? 'خلفية عالم موحدة ومتناسقة تملأ الشاشة بالكامل بدون خطوط أو حدود تعيق التصميم.' 
                      : 'Pure boundless world background color with clean grid overlay.'}
                  </li>
                </ul>
              </div>

              {/* 3. Layers & UI System */}
              <div className={`p-4 border space-y-2.5 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '3. نظام الطبقات (World Layers vs UI Layers)' : '3. Advanced Dual Layer System'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? 'يوفر المحرك نوعين أساسيين من الطبقات لتنظيم محتوى اللعبة:'
                    : 'Organize your game entities cleanly into two primary layer types:'}
                </p>
                <div className="space-y-2">
                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <strong className="block text-white mb-0.5">طبقات العالم (World Layers):</strong>
                    <span className="opacity-80">
                      تحتوي على شخصيات اللعبة، المنصات، الأعداء، والعناصر القابلة للتفاعل. تتحرك هذه الطبقات تلقائياً بالتزامن مع حركة كاميرا اللعبة.
                    </span>
                  </div>
                  <div className={`p-2.5 border ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-300'}`}>
                    <strong className="block text-white mb-0.5">طبقات الواجهة الثابتة (UI / HUD Layers):</strong>
                    <span className="opacity-80">
                      طبقات تثبت دائماً على شاشة اللاعب ولا تتحرك مع الكاميرا؛ مخصصة لأزرار اللمس بالهاتف، عداد النقاط، شريط الطاقة، والقوائم.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Smart Camera & Physics */}
              <div className={`p-4 border space-y-2.5 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '4. نظام الكاميرا الذكية والفيزياء والتصادم' : '4. Smart Camera & Physics Engine'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? '• تتبع ناعم بالكاميرا (Smooth Lerp): تتتبع الكاميرا اللاعب تلقائياً بانسيابية عالية دون اهتزاز.'
                    : '• Smooth Camera Follow: Automatically tracks target objects with configurable smoothness.'}
                </p>
                <p className="opacity-80">
                  {isAr
                    ? '• فيزياء وتصادمات: يدعم المحرك المصادمات الصندوقية (Box Colliders) والدائرية (Circle Colliders)، والجاذبية الأرضية، وقوى الارتداد (Bounce) والانطلاق والسرعة المتجهة (vx, vy).'
                    : '• Physics & Collisions: Full support for bounding box and circular colliders, gravity, bounce, and velocity.'}
                </p>
              </div>

              {/* 5. Animation Studio & Multi-Scenes */}
              <div className={`p-4 border space-y-2.5 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '5. استوديو الرسوم المتحركة وإدارة المشاهد المتعددة' : '5. Sprite Animation Studio & Multi-Scene Manager'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? '• استوديو الأنميشن: تقسيم وتجهيز الرسوم المتحركة للكائنات (مشي، قفز، هجوم، سقوط) مع تحكم في زمن كل إطار وتكرار الحركة ومعاينتها فورياً.'
                    : '• Animation Studio: Split sprite frames, tune frame duration, loop modes, and preview live.'}
                </p>
                <p className="opacity-80">
                  {isAr
                    ? '• مدير المشاهد: إنشاء مشاهد متعددة (القائمة الرئيسية، المرحلة الأولى، مرحلة الزعيم، شاشة الفوز)، مع إمكانية الانتقال البرمجي السلس بينها.'
                    : '• Multi-Scenes: Build multi-level games with instant scene switching.'}
                </p>
              </div>

              {/* 6. Instant Export & Fullscreen Play */}
              <div className={`p-4 border space-y-2.5 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'}`}>
                <h4 className="font-bold text-sm text-white">
                  {isAr ? '6. التصدير الفوري ومشغل اللعبة الكامل' : '6. Instant Export & Fullscreen Playback'}
                </h4>
                <p className="opacity-80">
                  {isAr
                    ? '• تصدير سريع بضغطة زر: تصدير اللعبة بالكامل كملف مستقل (Single HTML5 File) مدمج به كافة الصور والأكواد والأصوات ليعمل على أي حاسوب أو متصفح أو هاتف دون الحاجة للإنترنت أو خوادم خارجية.'
                    : '• Single Click Standalone Export: Exports entire game to an offline-ready standalone HTML5 file.'}
                </p>
                <p className="opacity-80">
                  {isAr
                    ? '• شاشة اللعب التفاعلية الكاملة: عند الضغط على زر البدء، تملأ شاشة اللعبة المتصفح بنسبة أبعاد مثالية متكيفة مع عداد فريمات FPS وزر إعادة تشغيل فوري.'
                    : '• Fullscreen Playback: Adaptive responsive player with real-time FPS counter and instant reload.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
        }`}>
          <span className="font-mono opacity-60 text-[11px]">
            {isAr ? 'محرك FY3 • المطور فليد' : 'FY3 Engine • Dev Fleed'}
          </span>
          <button
            onClick={onClose}
            className={`border px-5 py-1.5 font-bold transition-colors cursor-pointer ${
              isDark ? 'border-white bg-white text-black hover:bg-neutral-200' : 'border-black bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
