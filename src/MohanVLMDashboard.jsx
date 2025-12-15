import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sparkles,
  Clock,
  AlertTriangle,
  Activity,
  Layers,
  ChevronRight,
  MonitorPlay,
  X,
  BrainCircuit,
  Eye,
  Briefcase,
  Settings,
  LogOut,
  ChevronUp,
  User,
  ArrowRight,
  CheckCircle2,
  MonitorX,
  FileText,
} from 'lucide-react';

// --- Styles & Animation ---
// 1. 动态呼吸背景（两团柔和的蓝色光晕）
const BREATHING_BG =
  'bg-slate-50 relative overflow-hidden before:absolute before:top-[-10%] before:right-[-10%] before:w-[520px] before:h-[520px] before:rounded-full before:bg-blue-400/60 before:blur-[90px] before:animate-pulse-slow after:absolute after:bottom-[-10%] after:left-[-10%] after:w-[520px] after:h-[520px] after:rounded-full after:bg-indigo-500/55 after:blur-[90px] after:animate-pulse-slower mohan-breathing-bg';
// 2. 磨砂玻璃卡片
const GLASS_CARD =
  'backdrop-blur-xl bg-white/70 border border-white/40 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 rounded-2xl relative group cursor-pointer active:scale-[0.99]';

// --- Mock Data & AI Response ---
const DEFAULT_QUESTION = 'Why is our Q3 Strategic Alignment dropping?';

// AI 分析结果的结构化数据
const AI_ANALYSIS_RESULT = {
  summary:
    'Strategic alignment dropped 8% due to a massive shift in engineering focus towards unplanned infrastructure maintenance.',
  // 核心：VLM 看到的物理证据
  evidence: [
    {
      id: 1,
      title: 'VLM Visual Signal: IDE Context Drift',
      value: '45% time spent outside Feature Branch context',
      desc: 'Observed high frequency of engineers working on files unrelated to Q3 roadmap initiatives.',
      icon: Eye,
    },
    {
      id: 2,
      title: 'VLM Pattern: Legacy App Dwell Time',
      value: "320 total hours on 'Old-Wiki' & 'Staging-Logs'",
      desc: 'Screen analysis detected prolonged dwell times on documentation and log tools for deprecated systems.',
      icon: Clock,
    },
  ],
  recommendation:
    'Immediate freeze on non-critical legacy maintenance. Redirect focus back to Q3 initiatives and provide dedicated support for staging environment stabilization.',
};

const CURRENT_USER = {
  name: 'Alex Chen',
  role: 'CEO / Admin',
  avatarInitials: 'AC',
  org: 'Nebula AI',
};

// Strategy Trace mock data
const STRATEGY_DATA = {
  id: 'strat-q3',
  name: 'Q3 Enterprise Market Expansion',
  owner: 'Alex Chen',
  status: 'Critical Deviation',
  alignmentScore: 42,
  lastUpdated: 'Just now',
  description: 'Launch Enterprise SSO, Audit Logs, and achieve SOC2 Compliance.',
};

const TRACE_DATA = [
  {
    id: 'dept-eng',
    name: 'Engineering',
    totalCapacity: '2,000 hrs',
    segments: [
      { type: 'strategic', label: 'Feature: SSO Dev', value: 30, color: 'bg-blue-600' },
      { type: 'drift', label: 'Tech Debt: Legacy Fixes', value: 50, color: 'bg-rose-500', isDrift: true, details: 'eng_drift' },
      { type: 'ops', label: 'Meetings & Interview', value: 20, color: 'bg-gray-300' },
    ],
  },
  {
    id: 'dept-sales',
    name: 'Sales',
    totalCapacity: '800 hrs',
    segments: [
      { type: 'strategic', label: 'Enterprise Pitching', value: 25, color: 'bg-blue-600' },
      { type: 'drift', label: 'Admin: Data Entry', value: 55, color: 'bg-rose-500', isDrift: true, details: 'sales_drift' },
      { type: 'ops', label: 'Internal Training', value: 20, color: 'bg-gray-300' },
    ],
  },
];

const DRIFT_DETAILS = {
  eng_drift: {
    title: 'Dependency Resolution Failure',
    department: 'Engineering',
    impact: '420 Hours / Week',
    severity: 'High',
    observation:
      "VLM detects consistent patterns of 'Webpack Error' and 'Module Not Found' across 12 engineer workstations. Development environment consistency is the primary blocker.",
    evidence: ["Screen_Log_2301.png (Error 500)", 'Jira_Idle_Time > 4h'],
    recommendation:
      'Immediate Infrastructure Freeze. Standardize Staging Environment Docker containers.',
  },
  sales_drift: {
    title: 'Manual Contract Processing',
    department: 'Sales',
    impact: '180 Hours / Week',
    severity: 'Medium',
    observation:
      "Sales representatives are spending 55% of screen time copying data between 'Salesforce' and 'Google Docs'. No automation detected.",
    evidence: ['Browser_Activity: Copy/Paste Loops', 'Doc_Editor_Active > 6h'],
    recommendation:
      'Implement CPQ Automation tool or assign Ops support to handle data entry.',
  },
};

const METRICS_DATA = [
  {
    title: 'Avg Cycle Time',
    value: '14.2 Days',
    sub: 'Trace: Jira Ticket \u2192 Git Merge',
    trend: '+2d Slower',
    isGood: false,
    icon: Clock,
  },
  {
    title: 'Strategic Focus',
    value: '62%',
    sub: 'Visual: Active Window in Core Apps',
    trend: '-8% Drift',
    isGood: false,
    icon: Target,
  },
  {
    title: 'Process Friction',
    value: '340 Hours',
    sub: 'Visual: Dwell time on Error Screens',
    trend: 'High Waste',
    isGood: false,
    icon: AlertTriangle,
  },
];

const VLM_RISKS = [
  {
    id: 1,
    title: 'Staging Blocked',
    evidence: "Visual Signal: Engineers dwelling on 'Error 502' screens for >4h today.",
    type: 'Critical',
  },
  {
    id: 2,
    title: 'Doc Context Switch',
    evidence: 'Pattern: High frequency switching (15/hr) between VS Code & Legacy Wiki.',
    type: 'Warning',
  },
  {
    id: 3,
    title: 'Meeting Overload',
    evidence: 'Signal: Zoom/Teams full-screen active for >6h/day per capita.',
    type: 'Info',
  },
];

export default function MohanFinalDashboard() {
  const [activeTab, setActiveTab] = useState('System Status');
  const [aiFocus, setAiFocus] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAiDrawer, setShowAiDrawer] = useState(false); // 控制抽屉开关
  const [isAiThinking, setIsAiThinking] = useState(false); // 模拟 AI 思考状态
  const [showDriftAnalysis, setShowDriftAnalysis] = useState(false); // GAP 漂移分析
  const [metricDisplayValues, setMetricDisplayValues] = useState(
    () => METRICS_DATA.map(() => ''), // 初始为空，避免先闪现最终值
  ); // 顶部三张卡片的展示数字（只在页面加载时滚动一次）
  const [showProfileMenu, setShowProfileMenu] = useState(false); // 侧边栏个人菜单
  const [selectedDrift, setSelectedDrift] = useState('eng_drift'); // Strategy Trace 选中的 drift

  const inputRef = useRef(null);
  const activeDriftDetail = DRIFT_DETAILS[selectedDrift];

  useEffect(() => {
    setMounted(true);
  }, []);

  // 顶部三张数字卡片：仅在页面初次加载时滚动动画一次
  useEffect(() => {
    const timers = [];

    METRICS_DATA.forEach((metric, idx) => {
      const str = String(metric.value);
      const match = str.match(/^([\d.]+)/);
      if (!match) return;

      const targetNum = parseFloat(match[1]);
      const suffix = str.slice(match[1].length);

      let frame = 0;
      const totalFrames = 18 + Math.floor(Math.random() * 10);
      const intervalMs = 40 + Math.random() * 40;

      const timer = setInterval(() => {
        frame += 1;
        if (frame >= totalFrames) {
          setMetricDisplayValues((prev) => {
            const next = [...prev];
            next[idx] = `${Number.isInteger(targetNum) ? targetNum : targetNum.toFixed(1)}${suffix}`;
            return next;
          });
          clearInterval(timer);
          return;
        }

        const variance = Math.max(targetNum * 0.3, 1);
        const randomVal = targetNum + (Math.random() - 0.5) * 2 * variance;
        const rounded = Number.isInteger(targetNum)
          ? Math.round(randomVal)
          : randomVal.toFixed(1);

        setMetricDisplayValues((prev) => {
          const next = [...prev];
          next[idx] = `${rounded}${suffix}`;
          return next;
        });
      }, intervalMs);

      timers.push(timer);
    });

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, []);

  // 处理 AI 提问
  const handleAiSubmit = (e) => {
    if (e.key === 'Enter' && inputValue) {
      // 模拟思考过程
      setIsAiThinking(true);
      setAiFocus(false); // 提交后移除焦点状态，停止流光
      if (inputRef.current) {
        inputRef.current.blur();
      }

      setTimeout(() => {
        setIsAiThinking(false);
        setShowAiDrawer(true); // 思考结束，打开抽屉
      }, 1500); // 1.5秒模拟延迟
    }
  };

  // --- Components ---

  // AI 分析抽屉组件
  const AiDrawer = ({ show, onClose, data }) => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
          show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white/90 backdrop-blur-2xl border-l border-white/50 shadow-2xl z-[100] p-8 flex flex-col transition-transform duration-500 ease-out-expo transform ${
          show ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 animate-pulse-slow">
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Mohan Intelligence</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
          {/* Q&A Section - 类似聊天气泡样式 */}
          <div className="flex items-start gap-3 chat-fade-in">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-50 flex items-center justify-center text-xs font-semibold shadow-sm">
              You
            </div>
            <div className="max-w-[75%] bg-slate-900 text-slate-50 rounded-2xl rounded-tl-sm px-4 py-2 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Question
              </p>
              <p className="text-sm leading-relaxed">
                {inputValue || DEFAULT_QUESTION}
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl card-fade-in" style={{ animationDelay: '120ms' }}>
            <h3 className="flex items-center gap-2 text-blue-700 font-bold mb-2">
              <Sparkles size={18} /> AI Summary
            </h3>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>

          {/* VLM Evidence Cards Section */}
          <div className="card-fade-in" style={{ animationDelay: '220ms' }}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye size={16} /> VLM Grounded Evidence
            </h3>
            <div className="space-y-4">
              {data.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white/60 border border-white/50 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <ev.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{ev.title}</h4>
                      <div className="text-2xl font-bold text-indigo-600 mb-2 tracking-tight">
                        {ev.value}
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">{ev.desc}</p>
                      <button className="mt-3 text-xs flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        <MonitorPlay size={14} /> View Screen Trace Recording
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Section */}
          <div className="card-fade-in" style={{ animationDelay: '280ms' }}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap size={16} /> Recommended Action
            </h3>
            <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50/30 pl-6 rounded-r-xl text-slate-700 italic">
              &quot;{data.recommendation}&quot;
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Metric Card Component（数字由父组件提供，只在页面加载时滚动一次）
  const MetricCard = ({ data, index, displayValue }) => {
    return (
      <div className={`${GLASS_CARD} p-5 flex flex-col justify-between h-40`}>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-white/80 rounded-lg text-slate-500 shadow-sm shrink-0">
              <data.icon size={18} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              {data.title}
            </span>
          </div>
          <div
            className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
              data.isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {data.trend} {data.isGood ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-800 tracking-tight tabular-nums">{displayValue}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium truncate opacity-80">
            {data.sub}
          </div>
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-400">
          <ChevronRight size={16} />
        </div>
      </div>
    );
  };

  // 侧边导航单项
  const NavItem = ({ label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
        isActive
          ? 'bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100'
          : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
      )}
      <Icon
        size={18}
        className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
      />
      <span>{label}</span>
    </button>
  );

  // 底部用户信息区域
  const UserProfile = () => (
    <div className="mt-auto px-2 relative">
      <div
        className={`absolute bottom-full left-0 w-full mb-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-xl p-2 transition-all duration-200 origin-bottom ${
          showProfileMenu ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <User size={14} /> My Account
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Briefcase size={14} /> Switch Workspace
        </button>
        <div className="h-px bg-slate-200 my-1" />
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <button
        onClick={() => setShowProfileMenu((v) => !v)}
        className="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:bg-white/50 hover:border-white/40 hover:shadow-sm transition-all group"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
          {CURRENT_USER.avatarInitials}
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs font-bold text-slate-800">{CURRENT_USER.name}</div>
          <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-blue-100">
            {CURRENT_USER.role}
          </div>
        </div>
        <ChevronUp
          size={14}
          className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen text-slate-900 font-sans flex ${BREATHING_BG}`}>
      <style>{`
        /* 更柔和的“深蓝 / 浅蓝渐变”呼吸：在对角线上缓慢移动并形变（不再那么夸张） */
        @keyframes pulse-slow {
          0% {
            opacity: 0.55;
            transform: translate(0px, 0px) scale(1);
            border-radius: 50%;
          }
          35% {
            opacity: 0.4;
            transform: translate(30px, -20px) scaleX(1.15) scaleY(0.95);
            border-radius: 46% 54% 52% 48%;
          }
          70% {
            opacity: 0.35;
            transform: translate(60px, 20px) scaleX(0.9) scaleY(1.1);
            border-radius: 55% 45% 48% 52%;
          }
          100% {
            opacity: 0.55;
            transform: translate(0px, 0px) scale(1);
            border-radius: 50%;
          }
        }

        @keyframes pulse-slower {
          0% {
            opacity: 0.5;
            transform: translate(-10px, 10px) scale(1);
            border-radius: 50%;
          }
          40% {
            opacity: 0.35;
            transform: translate(-30px, 20px) scaleX(1.12) scaleY(0.9);
            border-radius: 48% 52% 55% 45%;
          }
          80% {
            opacity: 0.35;
            transform: translate(-50px, -20px) scaleX(0.9) scaleY(1.12);
            border-radius: 56% 44% 47% 53%;
          }
          100% {
            opacity: 0.5;
            transform: translate(-10px, 10px) scale(1);
            border-radius: 50%;
          }
        }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        /* 流光动画 */
        @keyframes border-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-border-flow { background-size: 200% 200%; animation: border-flow 3s ease infinite; }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        /* 卡片渐显动画 */
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .card-fade-in { opacity: 0; animation: fade-in-up 0.6s ease forwards; }
        /* 从左到右的宽度展开动画（轴动画） */
        @keyframes bar-grow { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
        .bar-grow { transform-origin: left; animation: bar-grow 0.8s ease-out forwards; }
        /* 抽屉里对话气泡渐显动画 */
        @keyframes chat-fade-in { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .chat-fade-in { animation: chat-fade-in 0.35s ease-out forwards; }

        /* 使用自定义类覆盖 pseudo 的背景为较柔和的深浅蓝渐变光晕 */
        .mohan-breathing-bg::before {
          background-image: radial-gradient(
            circle at 80% 15%,
            rgba(37, 99, 235, 0.8) 0%,
            rgba(59, 130, 246, 0.65) 28%,
            rgba(56, 189, 248, 0.4) 48%,
            rgba(56, 189, 248, 0.0) 72%
          );
          opacity: 0.5; /* 右上：50% */
          z-index: 0; /* 在白色背景之上，但低于内容（内容容器有 z-10） */
        }

        .mohan-breathing-bg::after {
          background-image: radial-gradient(
            circle at 15% 85%,
            rgba(30, 64, 175, 0.55) 0%,
            rgba(79, 70, 229, 0.45) 26%,
            rgba(129, 140, 248, 0.3) 50%,
            rgba(129, 140, 248, 0.0) 76%
          );
          opacity: 0.4; /* 左下：40% */
          z-index: 0; /* 同样在内容下、背景上 */
        }
      `}</style>

      {/* --- AI Analysis Drawer --- */}
      <AiDrawer
        show={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
        data={AI_ANALYSIS_RESULT}
      />

      {/* --- Enhanced AI Omnibar --- */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-[80] transition-all duration-500 ease-out-expo ${
          aiFocus ? 'scale-105 -translate-y-6' : ''
        }`}
      >
        {/* Edge Blur / Outer Glow Effect */}
        <div
          className={`absolute -inset-4 bg-white/40 blur-2xl rounded-[30px] transition-opacity duration-500 ${
            aiFocus ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>

        <div
          className={`
          relative backdrop-blur-2xl bg-white/90 rounded-2xl shadow-2xl 
          // 基础边框
          border border-white/50 
          // 流光效果实现：使用 background-image 模拟边框，并在 focus 时应用动画
          ${aiFocus ? 'p-[2px] animate-border-flow bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600' : 'p-1.5'}
          flex items-center gap-3 overflow-hidden group transition-all duration-300
        `}
        >
          {/* Inner Container (to hide the gradient padding) */}
          <div className="flex-1 flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-xl p-1.5 h-full w-full relative z-10">
            {/* Sparkles Icon (Animated) */}
            <div
              className={`relative p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 shrink-0 transition-transform ${
                aiFocus ? 'scale-110' : ''
              }`}
            >
              <Sparkles size={20} className={aiFocus || isAiThinking ? 'animate-spin-slow' : ''} />
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                // 设置默认问题
                placeholder={DEFAULT_QUESTION}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAiSubmit}
                // 点击 placeholder 自动填充
                onClick={() => !inputValue && setInputValue(DEFAULT_QUESTION)}
                className="w-full bg-transparent border-none outline-none text-base text-slate-800 placeholder-slate-400 font-medium h-10"
                onFocus={() => setAiFocus(true)}
                onBlur={() => setAiFocus(false)}
                disabled={isAiThinking}
              />
            </div>

            <div className="relative pr-3 hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 transition-all">
              {isAiThinking ? (
                <span className="text-blue-600 flex items-center gap-1 animate-pulse">
                  <BrainCircuit size={14} /> Thinking...
                </span>
              ) : aiFocus ? (
                <span className="text-blue-600 flex items-center gap-1 transition-opacity">
                  Press ↵
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Main 布局（整体包一层 z-10，保证在背景渐变之上） */}
      <div className="relative z-10 flex min-h-screen w-full">
        <aside className="w-64 flex flex-col py-6 px-3 border-r border-white/20 bg-white/30 backdrop-blur-md h-full sticky top-0 z-20">
          <div className="px-4 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              M
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Mohan</span>
          </div>

          <nav className="flex-1 space-y-1">
            <div className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Platform
            </div>
            <NavItem
              label="System Status"
              icon={LayoutGrid}
              isActive={activeTab === 'System Status'}
              onClick={() => setActiveTab('System Status')}
            />
            <NavItem
              label="Strategy Trace"
              icon={Target}
              isActive={activeTab === 'Strategy Trace'}
              onClick={() => setActiveTab('Strategy Trace')}
            />
            <NavItem
              label="Workflow Traces"
              icon={Layers}
              isActive={activeTab === 'Workflow Traces'}
              onClick={() => setActiveTab('Workflow Traces')}
            />

            <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Organization
            </div>
            <NavItem
              label="Team Pulse"
              icon={Activity}
              isActive={activeTab === 'Team Pulse'}
              onClick={() => setActiveTab('Team Pulse')}
            />
            <NavItem
              label="Settings"
              icon={Settings}
              isActive={activeTab === 'Settings'}
              onClick={() => setActiveTab('Settings')}
            />
          </nav>

          <UserProfile />
        </aside>

        <main
          className={`flex-1 min-h-screen overflow-y-auto p-8 lg:p-10 pb-64 custom-scrollbar transition-all duration-500 ${
            showAiDrawer ? 'pr-[500px]' : ''
          }`}
        >
        <header
          className={`mb-8 flex justify-between items-center transition-all duration-700 transform ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <span>{CURRENT_USER.org}</span>
              <ChevronRight size={12} />
              <span className="text-blue-600">{activeTab}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeTab}</h1>
          </div>

          <div className="flex gap-3">
            <button className="p-2 rounded-full bg-white/50 border border-white/50 hover:bg-white text-slate-500 transition-colors">
              <Search size={18} />
            </button>
            <div className="h-9 px-4 flex items-center justify-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Healthy
            </div>
          </div>
        </header>

        {activeTab === 'System Status' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {METRICS_DATA.map((metric, idx) => (
                <MetricCard
                  key={idx}
                  data={metric}
                  index={idx}
                  displayValue={metricDisplayValues[idx] ?? metric.value}
                />
              ))}
            </div>

            <div
              className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 transform ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className={`${GLASS_CARD} lg:col-span-2 p-8 cursor-default card-fade-in`}>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Capacity Allocation Gap</h3>
                    <p className="text-slate-500 text-xs mt-1">
                      Plan (Strategy) vs. Reality (VLM Observed)
                    </p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      Strategic
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      Drift
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="relative group">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
                      <span>Q3 Strategy Plan (Ideal)</span>
                      <span>100% Capacity</span>
                    </div>
                    <div className="h-12 w-full flex rounded-xl overflow-hidden shadow-sm border border-white/50 opacity-80 grayscale-[0.5]">
                      <div
                        className="w-[70%] bg-blue-600 flex items-center justify-center text-white text-xs font-bold bar-grow"
                        style={{ animationDelay: '260ms' }}
                      >
                        70% Strategic
                      </div>
                      <div
                        className="w-[30%] bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold bar-grow"
                        style={{ animationDelay: '260ms' }}
                      >
                        30% Ops
                      </div>
                    </div>
                  </div>
                  <div className="relative group cursor-pointer">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
                      <span>Actual VLM Observation (Reality)</span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertTriangle size={12} /> Critical Deviation
                      </span>
                    </div>
                    <div className="h-12 w-full flex rounded-xl overflow-hidden shadow-md border border-white/50 relative hover:ring-2 hover:ring-rose-200 transition-all">
                      <div
                        className="w-[30%] bg-blue-600 flex items-center justify-center text-white text-xs font-bold bar-grow"
                        style={{ animationDelay: '320ms' }}
                      >
                        30%
                      </div>
                      <div
                        className="w-[40%] bg-rose-500 relative flex items-center justify-center text-white text-xs font-bold overflow-hidden bar-grow"
                        style={{ animationDelay: '320ms' }}
                        onMouseEnter={() => setShowDriftAnalysis(true)}
                        onMouseLeave={() => setShowDriftAnalysis(false)}
                      >
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                        <div className="z-10 flex items-center gap-1 animate-pulse">
                          <ArrowDownRight size={14} /> 40% DRIFT
                        </div>
                      </div>
                      <div className="w-[30%] bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                        30% Ops
                      </div>
                    </div>
                  </div>
                  {showDriftAnalysis && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs leading-snug">
                      <p className="font-semibold mb-1">Drift analysis</p>
                      <p className="text-slate-300">
                        Screen Context Analysis shows roughly{' '}
                        <span className="text-white font-medium">400h on staging config fixes</span>,
                        pulling capacity away from planned Q3 roadmap work.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className={`${GLASS_CARD} p-0 flex flex-col card-fade-in`}>
                <div className="p-5 border-b border-white/40 flex justify-between items-center bg-white/30">
                  <h3 className="font-bold text-slate-900 text-sm">Signals(Live)</h3>
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {VLM_RISKS.map((risk, idx) => (
                    <div
                      key={risk.id}
                      className="p-3 rounded-xl border border-transparent card-fade-in"
                      style={{ animationDelay: `${300 + idx * 80}ms` }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            risk.type === 'Critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : risk.type === 'Warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}
                        >
                          {risk.type}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Now</span>
                      </div>
                      <button
                        type="button"
                        className="group w-full text-left mt-1 rounded-lg px-1.5 py-1 hover:bg-white/70 hover:border-white/60 border border-transparent transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {risk.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{risk.evidence}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'Strategy Trace' ? (
          <div className="space-y-8">
            {/* Strategy context */}
            <section className="mt-2">
              <div className={`${GLASS_CARD} p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6 cursor-default`}>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-900">{STRATEGY_DATA.name}</h1>
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 uppercase tracking-wide">
                      {STRATEGY_DATA.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{STRATEGY_DATA.description}</p>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-1">
                      Alignment Score
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {STRATEGY_DATA.alignmentScore}%
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-200" />
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-1">
                      Owner
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {STRATEGY_DATA.owner.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{STRATEGY_DATA.owner}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Resource Allocation Trace */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Resource Allocation Trace</h2>
                <div className="flex space-x-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-600 rounded-sm mr-2" />
                    Strategic
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-rose-500 rounded-sm mr-2" />
                    Drift (Waste)
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-gray-300 rounded-sm mr-2" />
                    Operational
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {TRACE_DATA.map((dept) => (
                  <div
                    key={dept.id}
                    className={`${GLASS_CARD} p-5 cursor-default`}
                  >
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-bold text-slate-700">{dept.name}</span>
                      <span className="text-gray-500">Capacity: {dept.totalCapacity}</span>
                    </div>
                    <div className="flex h-12 w-full rounded-lg overflow-hidden cursor-pointer">
                      {dept.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          onClick={() => seg.isDrift && setSelectedDrift(seg.details)}
                          style={{ width: `${seg.value}%` }}
                          className={`${seg.color} flex flex-col justify-center px-3 relative transition-all duration-200 ${
                            seg.isDrift ? 'hover:brightness-90 group' : ''
                          } ${
                            seg.isDrift && selectedDrift === seg.details
                              ? 'ring-2 ring-offset-2 ring-red-500 z-10'
                              : ''
                          }`}
                        >
                          {seg.isDrift && (
                            <div
                              className="absolute inset-0 opacity-10"
                              style={{
                                backgroundImage:
                                  'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                                backgroundSize: '10px 10px',
                              }}
                            />
                          )}
                          <span className="text-xs font-bold text-white/90 z-10 truncate">
                            {seg.label}
                          </span>
                          <span className="text-[10px] text-white/70 z-10">{seg.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Drift Diagnostics */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-red-500" />
                Drift Diagnostics
              </h2>
              <div className={`${GLASS_CARD} overflow-hidden flex flex-col md:flex-row`}>
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Focus Area
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {activeDriftDetail.title}
                    </h3>
                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      {activeDriftDetail.department}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-gray-500">Resource Impact</span>
                      <p className="text-red-600 font-bold">{activeDriftDetail.impact}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Root Cause Source</span>
                      <p className="text-slate-700 font-medium flex items-center">
                        <MonitorX className="w-4 h-4 mr-1 text-gray-400" />
                        VLM Screen Analysis
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">
                      System Observation (Reality)
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {activeDriftDetail.observation}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        Digital Evidence
                      </h4>
                      <ul className="space-y-2">
                        {activeDriftDetail.evidence.map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-100 flex items-center"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Recommended Action
                      </h4>
                      <div className="text-sm text-slate-700">
                        {activeDriftDetail.recommendation}
                      </div>
                      <button className="mt-3 text-xs bg-slate-900 text-white px-3 py-2 rounded hover:bg-slate-800 transition-colors">
                        Apply Correction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[500px] text-slate-400">
            <div className="text-center">
              <Layers size={48} className="mx-auto mb-4 opacity-20" />
              <p>
                Content for &quot;
                {activeTab}
                &quot; would appear here.
              </p>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}



