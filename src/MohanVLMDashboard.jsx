import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  // 布局与基础图标
  LayoutGrid,
  BrainCircuit,
  History,
  Shield,
  Settings,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Copy,
  Clock,
  MessageSquare,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Layers,
  Send,
  X,
  Bot,
  User,
  Paperclip,
  // 状态图标
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  PenTool,
  // Total Recall 页面用到的图标
  Search,
  Video,
  Monitor,
  MonitorPlay,
  MonitorX,
  Command,
  CornerUpLeft,
  CornerDownRight,
  Filter,
  Calendar,
  Eye,
  EyeOff,
  Download,
  MoreHorizontal,
  Hash,
  Link,
  Image,
  // 其他图标
  Target,
  Activity,
  Briefcase,
  LogOut,
  Mail,
  AlertCircle,
  Coffee,
  Users,
  Battery,
  Sun,
  Moon,
  ArrowUp,
} from 'lucide-react';

// --- Styles & Animation ---
// 1. 动态呼吸背景（两团柔和的蓝色光晕）
const BREATHING_BG =
  'bg-slate-50 relative overflow-hidden before:fixed before:top-[-10%] before:right-[-10%] before:w-[520px] before:h-[520px] before:rounded-full before:bg-blue-400/60 before:blur-[90px] before:animate-pulse-slow after:fixed after:bottom-[-10%] after:left-[-10%] after:w-[520px] after:h-[520px] after:rounded-full after:bg-indigo-500/55 after:blur-[90px] after:animate-pulse-slower mohan-breathing-bg';
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

// Employee View Data
const MEMORY_STREAM = [
  {
    id: 't1',
    time: '10:30 AM',
    duration: '1h 15m',
    title: 'Deep Work: Payment Gateway',
    app: 'VS Code',
    ai_summary: 'Refactored `auth_controller.ts`. Fixed the race condition bug reported in T-402.',
    intent: 'High Focus',
    color: 'bg-blue-500',
  },
  {
    id: 't2',
    time: '11:50 AM',
    duration: '20m',
    title: 'Design Sync',
    app: 'Figma',
    ai_summary: "Reviewed 'Mobile Checkout v2'. Commented on corner radius consistency.",
    intent: 'Collaboration',
    color: 'bg-blue-400',
  },
];

const MEMORY_SPARKS = [
  {
    id: 's1',
    type: 'Resume',
    icon: FileText,
    text: "Resuming 'Q3 Deck'?",
    sub: 'You closed it yesterday at slide 14.',
    action: 'Open',
  },
  {
    id: 's2',
    type: 'Reply',
    icon: MessageSquare,
    text: 'Draft reply to Sarah?',
    sub: 'She asked about the API docs 2h ago.',
    action: 'Draft',
  },
];

const BLOCKED_APPS = [
  { name: 'WeChat', icon: '💬', active: true },
  { name: 'Spotify', icon: '🎵', active: true },
  { name: 'Incognito Window', icon: '🕶️', active: true },
  { name: 'Banking Apps', icon: '🏦', active: true },
];

// Chat History Mock Data
const INITIAL_CHAT_HISTORY = [];

// Manager 视角的 AI 响应
const MANAGER_AI_RESPONSE = {
  id: 'msg_ceo_1',
  sender: 'ai',
  role: 'system',
  content: 'Analyzing **Q3 Strategic Alignment** drop...',
  cardData: {
    type: 'drift_alert',
    title: 'Root Cause Detected',
    highlight: '450 Hours Burned',
    description:
      "The stall is NOT a manpower issue. Analysis shows massive time loss on 'API Schema Validation' errors.",
    stats: [
      { label: 'Impact', value: 'High', color: 'text-red-600' },
      { label: 'Recovery', value: '3 Days', color: 'text-blue-600' },
    ],
    action: 'Pause feature dev',
  },
};

// Employee 视角的 AI 响应 - 记忆查找
const EMPLOYEE_MEMORY_RESPONSE = {
  id: 'msg_emp_mem',
  sender: 'ai',
  content: "I found the deck you worked on last Tuesday. It's titled **'Q3_Strategy_v2.pptx'**.",
  attachments: [
    { type: 'file', name: 'Q3_Strategy_v2.pptx', path: '~/Google Drive/Work/' },
  ],
};

// Employee 视角的 AI 响应 - 报告生成
const EMPLOYEE_REPORT_RESPONSE = {
  id: 'msg_emp_report',
  sender: 'ai',
  content: 'Here is a draft of your **Daily Standup**:',
  reportData: {
    date: 'Oct 24, 2025',
    bullets: [
      '✅ **Deep Work:** Refactored `PaymentGateway` logic.',
      '🤝 **Collab:** Synced with Design team.',
      '🚧 **Blocker:** Waiting for Staging DB access.',
    ],
  },
};

// Total Recall 2.0: 预置更多数据以展示筛选效果
const ALL_MEMORIES = [
  // --- Meetings ---
  {
    id: 'm1',
    category: 'Meetings',
    type: 'meeting',
    app: 'Zoom',
    timestamp: 'Tue, Oct 22 • 14:30',
    title: 'Meeting with Sarah: Budget Review',
    context_text: "Sarah is sharing screen. Slide title: 'Q3 Financial Projections'. Visual trend: Upward.",
    image_color: 'bg-blue-900',
    keywords: ['Budget', 'Finance'],
    related_to: 'Linked to Excel below',
  },
  {
    id: 'm4',
    category: 'Meetings',
    type: 'meeting',
    app: 'Google Meet',
    timestamp: 'Wed, Oct 23 • 10:00',
    title: 'All Hands: Q4 Kickoff',
    context_text: "Alex (CEO) presenting roadmap. Key phrase: 'Focus on Enterprise'.",
    image_color: 'bg-sky-700',
    keywords: ['Roadmap', 'Strategy'],
    related_to: null,
  },
  // --- Docs ---
  {
    id: 'm2',
    category: 'Docs',
    type: 'doc',
    app: 'Excel',
    timestamp: 'Tue, Oct 22 • 14:45',
    title: 'Q3_Budget_Final_v2.xlsx',
    context_text: "Active Cell C4: '$450,000'. You highlighted this row during the meeting.",
    image_color: 'bg-emerald-50',
    keywords: ['$450k', 'Cost'],
    related_to: 'Opened during Meeting',
  },
  {
    id: 'm5',
    category: 'Docs',
    type: 'doc',
    app: 'Notion',
    timestamp: 'Mon, Oct 21 • 16:20',
    title: 'PRD: Mohan Employee View',
    context_text: "Editing section: 'Privacy Controls'. Added requirement for local-first index.",
    image_color: 'bg-slate-50',
    keywords: ['PRD', 'Product'],
    related_to: null,
  },
  {
    id: 'm6',
    category: 'Docs',
    type: 'doc',
    app: 'Figma',
    timestamp: 'Thu, Oct 19 • 11:00',
    title: 'Design System v2.0',
    context_text: "Viewing frame 'Dark Mode Colors'. You copied the hex code #4F46E5.",
    image_color: 'bg-purple-900',
    keywords: ['Design', 'Hex'],
    related_to: null,
  },
  // --- Chat ---
  {
    id: 'm3',
    category: 'Chat',
    type: 'chat',
    app: 'Slack',
    timestamp: 'Mon, Oct 21 • 09:45',
    title: 'DM with David',
    context_text: "David: 'Are we locking the launch date to Nov 15?' You replied: 'Yes.'",
    image_color: 'bg-purple-50',
    keywords: ['Launch', 'Date'],
    related_to: null,
  },
  {
    id: 'm7',
    category: 'Chat',
    type: 'chat',
    app: 'Teams',
    timestamp: 'Fri, Oct 20 • 15:30',
    title: 'Group: Engineering Sync',
    context_text: "Deployment bot: 'Staging build failed'. Discussion followed on API timeouts.",
    image_color: 'bg-indigo-50',
    keywords: ['Error', 'Deploy'],
    related_to: null,
  },
];

// Total Recall 2.0: 智能聚类 (用于顶部 Tab)
const SMART_CLUSTERS = [
  { id: 'All', label: 'All Memories', count: 7 },
  { id: 'Meetings', label: 'Meetings', count: 2 },
  { id: 'Docs', label: 'Documents', count: 3 },
  { id: 'Chat', label: 'Conversations', count: 2 },
];

// My Rhythm 页面数据
const RHYTHM_DATA = {
  // 核心：每日能量波 (模拟 9AM - 6PM 的专注度评分 0-100)
  energyWave: [
    { time: '09:00', value: 40, label: 'Ramp Up' },
    { time: '10:00', value: 85, label: 'Peak Flow' },
    { time: '11:00', value: 90, label: 'Peak Flow' },
    { time: '12:00', value: 60, label: 'Lunch Dip' },
    { time: '13:00', value: 50, label: 'Recovery' },
    { time: '14:00', value: 75, label: 'Focus' },
    { time: '15:00', value: 80, label: 'Focus' },
    { time: '16:00', value: 40, label: 'Meeting' },
    { time: '17:00', value: 30, label: 'Admin' },
  ],
  stats: {
    goldenHour: '10:00 AM - 12:00 PM',
    focusScore: 82, // out of 100
    meetingDrain: 'Low', // Low, Medium, High
    contextSwitch: 12, // times per hour
  },
  insights: [
    {
      type: 'positive',
      icon: Sun,
      title: 'Morning Person',
      desc: 'You accomplish 70% of your deep work before 1pm. Protect these hours.',
    },
    {
      type: 'warning',
      icon: Battery,
      title: 'Post-Lunch Dip',
      desc: 'Your focus drops by 40% at 2pm. Good time for low-energy meetings.',
    },
  ],
};

// My Rhythm View Component
const MyRhythmViewContent = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- SVG 坐标计算逻辑 ---
  // 使用虚拟坐标系 800x200 保证绘图精度
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 200;

  const generatePoints = () => {
    return RHYTHM_DATA.energyWave.map((slot, index) => {
      // X轴：(当前索引 * 步长) + 半个步长 -> 确保对齐柱子中心
      const step = SVG_WIDTH / RHYTHM_DATA.energyWave.length;
      const x = index * step + step / 2;

      // Y轴：数值翻转 (SVG中0在顶部，所以用 总高度 - 数值高度)
      const y = SVG_HEIGHT - (slot.value / 100) * SVG_HEIGHT;

      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="w-full animate-fade-in pb-32">
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
          My Rhythm
          <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">
            Cognitive Load
          </span>
        </h1>
        <p className="text-slate-500 text-sm">
          Understand your energy patterns to work smarter, not longer.
        </p>
      </div>

      {/* --- HERO: HYBRID CHART (柱状 + 折线 + 面积) --- */}
      <div className="mb-8 bg-white rounded-3xl border border-slate-200 shadow-lg shadow-blue-100/50 overflow-hidden relative group">
        {/* Layer 0: Background Grid (背景网格) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="h-full w-full grid grid-cols-9 gap-0 px-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-r border-slate-50/80 h-full last:border-r-0" />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col justify-between py-12 px-0">
            <div className="border-b border-slate-50 w-full" />
            <div className="border-b border-slate-50 w-full" />
            <div className="border-b border-slate-50 w-full" />
          </div>
        </div>

        <div className="relative z-10 p-8 pb-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <Activity className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Daily Energy Curve</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Your Golden Hours are <span className="text-blue-600">{RHYTHM_DATA.stats.goldenHour}</span>
              </h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-slate-900">{RHYTHM_DATA.stats.focusScore}</div>
              <div className="text-xs text-slate-400 uppercase font-bold mt-1">Focus Score</div>
            </div>
          </div>

          {/* Visualization Container */}
          <div className="relative h-56 w-full">
            {/* Layer 2: SVG Curve & Area (最上层，但不可点击) */}
            {/* z-20 确保线条压在柱子上，pointer-events-none 确保鼠标能穿透去 Hover 柱子 */}
            <svg
              className="absolute inset-0 w-full h-full z-20 pointer-events-none px-4"
              preserveAspectRatio="none"
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            >
              <defs>
                <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                {/* 定义阴影滤镜让线条更清晰 */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1" />
                </filter>
              </defs>

              {/* 面积填充 */}
              <polygon
                points={`0,${SVG_HEIGHT} ${generatePoints()} ${SVG_WIDTH},${SVG_HEIGHT}`}
                fill="url(#gradientArea)"
                className={`transition-opacity duration-1000 delay-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* 折线本身 */}
              <polyline
                points={generatePoints()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#shadow)"
                className="transition-all duration-[1.5s] ease-out"
                style={{
                  strokeDasharray: '2000',
                  strokeDashoffset: animate ? '0' : '2000',
                }}
              />

              {/* 关键点 (Dots) */}
              {animate &&
                RHYTHM_DATA.energyWave.map((slot, index) => {
                  const step = SVG_WIDTH / RHYTHM_DATA.energyWave.length;
                  const x = index * step + step / 2;
                  const y = SVG_HEIGHT - (slot.value / 100) * SVG_HEIGHT;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="animate-fade-in"
                    />
                  );
                })}
            </svg>

            {/* Layer 1: Interactive Bars (交互层) */}
            <div className="absolute inset-0 z-10 flex items-end justify-between w-full h-full px-4">
              {RHYTHM_DATA.energyWave.map((slot, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-end h-full group/bar relative"
                >
                  {/* Hit Area (扩大 Hover 区域) */}
                  <div className="absolute inset-x-1 top-0 bottom-0 cursor-pointer z-30 hover:bg-blue-50/30 rounded-lg transition-colors" />

                  {/* The Bar Visual (视觉柱子) */}
                  <div
                    className={`w-8 md:w-12 rounded-t-lg transition-all duration-700 ease-out relative pointer-events-none opacity-60 group-hover/bar:opacity-90 ${
                      slot.value > 80
                        ? 'bg-gradient-to-t from-blue-100 to-blue-300'
                        : 'bg-gradient-to-t from-slate-100 to-slate-200'
                    }`}
                    style={{
                      height: animate ? `${slot.value}%` : '0%',
                      transitionDelay: `${index * 50}ms`,
                    }}
                  />

                  {/* Tooltip (Hover) */}
                  <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all shadow-xl z-50 whitespace-nowrap pointer-events-none translate-y-2 group-hover/bar:translate-y-0">
                    <div className="font-bold text-blue-200">{slot.value}% Focus</div>
                    <div className="text-slate-300 font-normal">{slot.label}</div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                  </div>

                  {/* Time Label */}
                  <span className="absolute -bottom-6 text-[10px] font-bold text-slate-400 group-hover/bar:text-blue-600 transition-colors">
                    {slot.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-6" />
        </div>
      </div>

      {/* --- METRICS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <ArrowUp className="w-3 h-3 mr-1" /> Top 10%
            </span>
          </div>
          <div className="text-sm text-slate-500 font-medium mb-1">Deep Work Ratio</div>
          <div className="text-2xl font-bold text-slate-900">3.5 Hours</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out ${
                animate ? 'w-[70%]' : 'w-0'
              }`}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
              Normal
            </span>
          </div>
          <div className="text-sm text-slate-500 font-medium mb-1">Context Switches</div>
          <div className="text-2xl font-bold text-slate-900">
            12 <span className="text-sm text-slate-400 font-normal">/ hr</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Mostly between <span className="font-bold text-slate-600">Slack</span> and{' '}
            <span className="font-bold text-slate-600">VS Code</span>.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              Healthy
            </span>
          </div>
          <div className="text-sm text-slate-500 font-medium mb-1">Meeting Load</div>
          <div className="text-2xl font-bold text-slate-900">
            15% <span className="text-sm text-slate-400 font-normal">of day</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            You have <span className="font-bold text-slate-600">4.5h</span> of free maker time today.
          </p>
        </div>
      </div>

      {/* --- INSIGHTS CARDS (Bottom) --- */}
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
        <Zap className="w-4 h-4 mr-2 text-yellow-500" /> AI Suggestions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RHYTHM_DATA.insights.map((insight, i) => {
          const IconComponent = insight.icon;
          return (
            <div key={i} className="flex p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 ${
                  insight.type === 'positive' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{insight.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{insight.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

// Workflow Trace mock data
const TRACE_LIST = [
  {
    id: 'TRC-9201',
    title: 'Acme Corp - Contract Renewal',
    type: 'Contract Approval',
    startTime: 'Oct 12, 09:00',
    duration: '14d 5h',
    status: 'Critical', // Critical, Warning, Success
    owner: 'Sarah J.',
    latency: '+380%',
  },
  {
    id: 'TRC-9202',
    title: 'Q3 Feature Deployment #402',
    type: 'DevOps Pipeline',
    startTime: 'Oct 12, 11:30',
    duration: '45m',
    status: 'Success',
    owner: 'DevOps Bot',
    latency: 'Normal',
  },
  {
    id: 'TRC-9203',
    title: 'Senior Engineer Hiring: Candidate A',
    type: 'Hiring Pipeline',
    startTime: 'Oct 10, 14:00',
    duration: '5d 2h',
    status: 'Warning',
    owner: 'HR Team',
    latency: '+15%',
  },
];

const WORKFLOW_TIMELINE = {
  id: 'TRC-9201',
  summary: {
    totalDuration: '14d 5h',
    expectedDuration: '3d 0h',
    bottleneckStage: 'Legal Review',
  },
  stages: [
    {
      id: 'stage-01',
      name: 'Draft Creation',
      tool: 'Salesforce CPQ',
      duration: '2h 15m',
      type: 'active',
      owner: 'Sarah J.',
      timelineWidth: '5%',
      timelineOffset: '0%',
    },
    {
      id: 'stage-02',
      name: 'Manager Approval',
      tool: 'Slack / Email',
      duration: '4h 0m',
      type: 'queue',
      owner: 'Mike Ross',
      timelineWidth: '8%',
      timelineOffset: '5%',
    },
    {
      id: 'stage-03',
      name: 'Legal Review',
      tool: 'Outlook / Word',
      duration: '12d 6h',
      type: 'blocked',
      owner: 'Legal Dept',
      timelineWidth: '75%',
      timelineOffset: '13%',
      alert: true,
      insightKey: 'legal_block',
    },
    {
      id: 'stage-04',
      name: 'Client Signature',
      tool: 'DocuSign',
      duration: 'Pending',
      type: 'pending',
      owner: 'External',
      timelineWidth: '10%',
      timelineOffset: '88%',
    },
  ],
};

const WORKFLOW_INSIGHTS = {
  legal_block: {
    title: 'Unstructured Communication Loop',
    severity: 'High',
    impact: '12 Days Lost',
    rootCause: 'Toolchain Break (Salesforce ➔ Email)',
    observation:
      "VLM analysis detected 14 email exchanges containing file attachments named 'Contract_v1' through 'Contract_v14'. No version control system was used.",
    evidence: [
      { type: 'email', label: 'Subject: Re: Re: Changes to Section 4...' },
      { type: 'file', label: 'Attachment: Acme_Renewal_v14_FINAL.docx' },
    ],
    recommendation:
      "Migrate this account's renewal process to the CLM (Contract Lifecycle Management) module to enforce version control.",
  },
};

// Team Pulse mock data
const HEALTH_METRICS = [
  {
    id: 'm1',
    label: 'Deep Work Ratio',
    value: '32%',
    trend: '-5%',
    trendDir: 'down', // down is bad
    status: 'Warning',
    icon: BrainCircuit,
    description: 'Time spent in uninterrupted production blocks (>30m)',
  },
  {
    id: 'm2',
    label: 'Context Fragmentation',
    value: 'High',
    subValue: '28 switches/hr',
    trend: '+12%',
    trendDir: 'up', // up is bad
    status: 'Critical',
    icon: Zap,
    description: 'Average frequency of application toggling per hour',
  },
  {
    id: 'm3',
    label: 'Meeting Load',
    value: '4.5h',
    subValue: 'per day/person',
    trend: '+0.5h',
    trendDir: 'up', // up is bad
    status: 'Critical',
    icon: Users,
    description: 'Average time spent in Zoom/Teams calls',
  },
  {
    id: 'm4',
    label: 'Burnout Risk',
    value: 'Medium',
    subValue: '15% after-hours',
    trend: 'Stable',
    trendDir: 'flat',
    status: 'Healthy',
    icon: Activity,
    description: 'Percentage of workforce active after 8:00 PM',
  },
];

const DEPT_COMPOSITION = [
  {
    name: 'Engineering',
    focus: 45, // Green
    collab: 25, // Yellow
    friction: 30, // Red
    totalMembers: 42,
    details: 'High friction detected in deployment phases.',
  },
  {
    name: 'Product',
    focus: 20,
    collab: 60,
    friction: 20,
    totalMembers: 12,
    details: 'Meeting overload is severely impacting maker time.',
  },
  {
    name: 'Sales',
    focus: 15,
    collab: 45,
    friction: 40,
    totalMembers: 28,
    details: 'Administrative data entry is consuming 40% of capacity.',
  },
  {
    name: 'Marketing',
    focus: 40,
    collab: 40,
    friction: 20,
    totalMembers: 8,
    details: 'Balanced workflow, but high Slack distraction.',
  },
];

const TEAM_INSIGHTS = [
  {
    id: 'i1',
    dept: 'Engineering',
    type: 'Tool Fatigue',
    severity: 'High',
    title: 'IDE Context Switching',
    content:
      'Engineers are switching between VS Code and Jira/Slack approx. 40 times/hour. This reduces cognitive depth by estimated 25%.',
    action: 'Recommendation: Enable Jira integration for VS Code.',
  },
  {
    id: 'i2',
    dept: 'Product',
    type: 'Meeting Overload',
    severity: 'Critical',
    title: 'Fragmented Maker Time',
    content:
      'Designers average only 1 continuous block of >2h focus time per week due to scattered stand-ups and syncs.',
    action: "Recommendation: Implement 'No Meeting Wednesdays'.",
  },
  {
    id: 'i3',
    dept: 'Sales',
    type: 'Process Friction',
    severity: 'High',
    title: 'CRM Data Entry Lag',
    content:
      "Sales reps spend 2.5h/day manually copying data from Email to Salesforce. This is classified as 'Drift'.",
    action: 'Recommendation: Automate email logging.',
  },
];

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
  const [userRole, setUserRole] = useState('Manager'); // 'Manager' or 'Employee'
  const [activeTab, setActiveTab] = useState('System Status');
  const [employeeActiveTab, setEmployeeActiveTab] = useState('Focus HUD'); // Employee view tabs
  const [isRecording, setIsRecording] = useState(true); // Employee view recording state
  const [sessionMinutes, setSessionMinutes] = useState(52); // 累计的分钟数
  const [searchQuery, setSearchQuery] = useState('Q3 Plan'); // Total Recall search query
  const [activeFilter, setActiveFilter] = useState('All'); // Total Recall filter
  const [recallTab, setRecallTab] = useState('All'); // Total Recall smart cluster tab
  const [aiFocus, setAiFocus] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAiDrawer, setShowAiDrawer] = useState(false); // 控制抽屉开关
  const [isAiThinking, setIsAiThinking] = useState(false); // 模拟 AI 思考状态
  const [isAssistantOpen, setIsAssistantOpen] = useState(false); // 控制悬浮助手窗口
  const [chatHistory, setChatHistory] = useState([]); // 聊天历史
  const [isTyping, setIsTyping] = useState(false); // AI 正在输入
  const [showDriftAnalysis, setShowDriftAnalysis] = useState(false); // GAP 漂移分析
  const [metricDisplayValues, setMetricDisplayValues] = useState(
    () => METRICS_DATA.map(() => ''), // 初始为空，避免先闪现最终值
  ); // 顶部三张卡片的展示数字（只在页面加载时滚动一次）
  const [showProfileMenu, setShowProfileMenu] = useState(false); // 侧边栏个人菜单
  const [selectedDrift, setSelectedDrift] = useState('eng_drift'); // Strategy Trace 选中的 drift
  const [selectedTraceId, setSelectedTraceId] = useState('TRC-9201'); // Workflow 选中的 trace
  const [selectedStageId, setSelectedStageId] = useState('stage-03'); // Workflow 选中的 stage
  const [workflowFilterText, setWorkflowFilterText] = useState('');
  const [selectedDept, setSelectedDept] = useState('Engineering'); // Team Pulse 选中的部门

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const activeDriftDetail = DRIFT_DETAILS[selectedDrift];
  const activeWorkflowInsight =
    selectedStageId &&
    WORKFLOW_TIMELINE.stages.find((s) => s.id === selectedStageId)?.alert &&
    WORKFLOW_INSIGHTS[
      WORKFLOW_TIMELINE.stages.find((s) => s.id === selectedStageId)?.insightKey || ''
    ]
      ? WORKFLOW_INSIGHTS[
          WORKFLOW_TIMELINE.stages.find((s) => s.id === selectedStageId)?.insightKey || ''
        ]
      : null;
  const activeTeamInsights = selectedDept
    ? TEAM_INSIGHTS.filter((i) => i.dept === selectedDept)
    : TEAM_INSIGHTS;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 员工视角：真实时间累计（每60秒增加1分钟）
  useEffect(() => {
    if (userRole === 'Employee' && isRecording) {
      const interval = setInterval(() => {
        setSessionMinutes((prev) => prev + 1);
      }, 60000); // 每60秒（1分钟）增加1

      return () => clearInterval(interval);
    }
  }, [userRole, isRecording]);

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

  // 新的聊天消息处理函数（用于悬浮助手）
  const handleSendMessage = (text, scenario = null) => {
    if (!text.trim()) return;

    // 1. 添加用户消息
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      content: text,
    };
    setChatHistory((prev) => [...prev, newMsg]);
    setInputValue('');

    // 2. 如果窗口没打开，打开窗口
    if (!isAssistantOpen) setIsAssistantOpen(true);

    // 3. 模拟 AI 思考和回复
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let response;
      if (userRole === 'Manager') {
        response = { ...MANAGER_AI_RESPONSE, id: Date.now() + 1 };
      } else {
        if (scenario === 'report') {
          response = { ...EMPLOYEE_REPORT_RESPONSE, id: Date.now() + 1 };
        } else {
          response = { ...EMPLOYEE_MEMORY_RESPONSE, id: Date.now() + 1 };
        }
      }
      setChatHistory((prev) => [...prev, response]);
    }, 1000);
  };

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAssistantOpen]);

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
  const NavItem = ({ label, icon: Icon, isActive, onClick }) => {
    const isEmployee = userRole === 'Employee';
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
          isActive
            ? isEmployee
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-50'
              : 'bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100'
            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
        }`}
      >
        {isActive && (
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${
              isEmployee ? 'bg-blue-600' : 'bg-blue-600'
            }`}
          />
        )}
        <Icon
          size={18}
          className={isActive ? (isEmployee ? 'text-blue-600' : 'text-blue-600') : 'text-slate-400 group-hover:text-slate-600'}
        />
        <span>{label}</span>
      </button>
    );
  };

  // Total Recall 辅助组件
  const FilterPill = ({ label, icon: Icon, active, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
          active
            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        {Icon && <Icon className={`w-3 h-3 mr-1.5 ${active ? 'text-blue-200' : 'text-slate-400'}`} />}
        {label}
      </button>
    );
  };

  const AppIcon = ({ app }) => {
    if (app === 'Zoom') return <Video className="w-3 h-3 text-blue-500" />;
    if (app === 'Slack') return <MessageSquare className="w-3 h-3 text-purple-500" />;
    if (app === 'Notion') return <FileText className="w-3 h-3 text-slate-800" />;
    return <Monitor className="w-3 h-3 text-gray-500" />;
  };

  // 底部用户信息区域
  const UserProfile = () => (
    <div className="mt-auto px-3 py-2 relative z-20">
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
        type="button"
        onClick={(e) => {
          console.log('Avatar clicked, current role:', userRole);
          e.preventDefault();
          e.stopPropagation();
          const newRole = userRole === 'Manager' ? 'Employee' : 'Manager';
          console.log('Switching to role:', newRole);
          setUserRole(newRole);
          setShowProfileMenu(false);
          // 重置状态，给新角色一个干净的界面
          setIsAssistantOpen(false);
          setChatHistory([]);
          setInputValue('');
        }}
        className="w-full flex items-center gap-3 p-4 rounded-xl border border-transparent hover:bg-blue-50 hover:border-blue-100 transition-all group cursor-pointer relative z-30 min-h-[64px]"
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white ${
            userRole === 'Manager'
              ? 'bg-gradient-to-tr from-slate-700 to-slate-600'
              : 'bg-gradient-to-tr from-blue-500 to-blue-400 group-hover:shadow-blue-200'
          }`}
        >
          {userRole === 'Manager' ? CURRENT_USER.avatarInitials : 'AC'}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-bold text-slate-800">{CURRENT_USER.name}</div>
          <div className="text-[10px] font-medium text-slate-500 group-hover:text-blue-600 flex items-center uppercase tracking-wide">
            {userRole === 'Manager' ? CURRENT_USER.role : 'My Edge'} <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </div>
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

      {/* --- Floating Assistant Window (悬浮助手) --- */}
      {/* 位置在底部输入框上方，模拟 Popover 效果 */}
      <div
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 flex flex-col transition-all duration-300 origin-bottom ${
          isAssistantOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
        }`}
        style={{ maxHeight: '60vh' }}
      >
        {/* Window Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <Sparkles className={`w-4 h-4 ${userRole === 'Manager' ? 'text-blue-600' : 'text-blue-600'}`} />
            <span className="font-bold text-sm text-slate-800">Mohan AI</span>
          </div>
          <button
            onClick={() => setIsAssistantOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30 custom-scrollbar">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-1 text-white shadow-sm bg-gradient-to-br ${
                    userRole === 'Manager' ? 'from-blue-500 to-blue-600' : 'from-blue-500 to-blue-600'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[85%]">
                {/* Standard Text Bubble */}
                {msg.content && (
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Manager Special: Data Card */}
                {msg.cardData && (
                  <div className="mt-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-fade-in">
                    <div className="bg-red-50/50 px-4 py-2 border-b border-red-100 flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-xs font-bold text-red-700 uppercase">{msg.cardData.title}</span>
                    </div>
                    <div className="p-4">
                      <div className="text-xl font-bold text-slate-900 mb-1">{msg.cardData.highlight}</div>
                      <p className="text-xs text-slate-500 mb-4">{msg.cardData.description}</p>
                      <div className="flex gap-2 mb-4">
                        {msg.cardData.stats.map((stat, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-500 border border-slate-100"
                          >
                            {stat.label}: <span className={stat.color}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Employee Special: Report */}
                {msg.reportData && (
                  <div className="mt-3 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden group card-fade-in">
                    <div className="bg-blue-50/50 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
                      <div className="flex items-center text-blue-700 font-bold text-xs uppercase">
                        <FileJson className="w-3 h-3 mr-2" /> Daily Standup
                      </div>
                      <Copy className="w-3 h-3 text-blue-400 cursor-pointer hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="p-4 space-y-2 text-sm text-slate-700">
                      {msg.reportData.bullets.map((bullet, i) => (
                        <div key={i} className="pl-2 border-l-2 border-blue-100">
                          {bullet.replace(/\*\*/g, '')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employee Special: Attachment */}
                {msg.attachments && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-blue-500 mr-2" />
                        <div className="flex-1 text-xs font-bold text-slate-700 truncate">{file.name}</div>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-xs text-slate-400 ml-11 animate-pulse">AI thinking...</div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* --- Bottom Input Bar (触发器) --- */}
      <div className="fixed bottom-8 left-0 right-0 flex flex-col items-center justify-center z-30 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          {/* 快捷问题气泡 (Suggestion Pills) */}
          {!isAssistantOpen && !inputValue && (
            <div className="flex items-center space-x-3 mb-4">
              {userRole === 'Manager' ? (
                <button
                  onClick={() => handleSendMessage('Why is our Q3 Strategic Alignment dropping?')}
                  className="px-4 py-2 bg-white/90 backdrop-blur border border-blue-200 text-blue-700 text-sm font-medium rounded-full shadow-lg hover:bg-blue-50 transition-all flex items-center"
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  Why is Q3 Alignment dropping?
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleSendMessage('Draft my daily standup', 'report')}
                    className="px-4 py-2 bg-white/90 backdrop-blur border border-blue-200 text-blue-700 text-sm font-medium rounded-full shadow-lg hover:bg-blue-50 transition-all flex items-center"
                  >
                    <PenTool className="w-3 h-3 mr-2" /> Draft Standup
                  </button>
                  <button
                    onClick={() => handleSendMessage('Find Q3 deck', 'memory')}
                    className="px-4 py-2 bg-white/90 backdrop-blur border border-blue-200 text-blue-700 text-sm font-medium rounded-full shadow-lg hover:bg-blue-50 transition-all flex items-center"
                  >
                    <History className="w-3 h-3 mr-2" /> Find Q3 Deck
                  </button>
                </>
              )}
            </div>
          )}

          {/* The Input Capsule */}
          <div className="w-[600px] relative transition-all duration-300 shadow-2xl opacity-100 translate-y-0">
            <div
              className={`relative bg-white rounded-2xl border flex items-center p-2 ${
                userRole === 'Manager' ? 'border-blue-200' : 'border-blue-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                  userRole === 'Manager' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder={
                  userRole === 'Manager' ? 'Ask about strategy...' : 'Ask your memory...'
                }
                className="flex-1 bg-transparent border-none text-base text-slate-700 placeholder-slate-400 focus:ring-0 h-10 outline-none"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                className={`p-2 rounded-lg text-white shadow-sm transition-transform active:scale-95 ${
                  userRole === 'Manager' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Main 布局（整体包一层 z-10，保证在背景渐变之上） */}
      <div className="relative z-10 flex min-h-screen w-full">
        <aside className="w-64 flex flex-col py-6 px-3 border-r border-white/20 bg-white/30 backdrop-blur-md h-screen fixed top-0 left-0 z-20">
          <div className="px-4 mb-8 flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                userRole === 'Manager'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/30'
                  : 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-blue-500/30'
              }`}
            >
              M
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Mohan</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <div className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {userRole === 'Manager' ? 'Platform' : 'Personal Intelligence'}
            </div>
            {userRole === 'Manager' ? (
              <>
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
              </>
            ) : (
              <>
                <NavItem
                  label="Focus HUD"
                  icon={LayoutGrid}
                  isActive={employeeActiveTab === 'Focus HUD'}
                  onClick={() => setEmployeeActiveTab('Focus HUD')}
                />
                <NavItem
                  label="Total Recall"
                  icon={History}
                  isActive={employeeActiveTab === 'Total Recall'}
                  onClick={() => setEmployeeActiveTab('Total Recall')}
                />
                <NavItem
                  label="My Rhythm"
                  icon={BrainCircuit}
                  isActive={employeeActiveTab === 'My Rhythm'}
                  onClick={() => setEmployeeActiveTab('My Rhythm')}
                />
                <div className="my-4 border-t border-white/20" />
                <NavItem
                  label="Privacy & Rules"
                  icon={Shield}
                  isActive={employeeActiveTab === 'Privacy Controls'}
                  onClick={() => setEmployeeActiveTab('Privacy Controls')}
                />
                <NavItem
                  label="Settings"
                  icon={Settings}
                  isActive={employeeActiveTab === 'Settings'}
                  onClick={() => setEmployeeActiveTab('Settings')}
                />
              </>
            )}
          </nav>

          <UserProfile />
        </aside>

        <main
          className={`flex-1 min-h-screen overflow-y-auto p-8 lg:p-10 pb-64 custom-scrollbar transition-all duration-500 ml-64 ${
            showAiDrawer ? 'pr-[500px]' : ''
          }`}
        >
        {userRole === 'Employee' ? (
          // Employee View Content
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Bar: The "Ask" Interface */}
            <header className="h-20 flex items-center justify-between px-8 flex-shrink-0 z-20">
              {/* Omni-Search (AI Input) */}
              <div className="relative w-[480px] group">
                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-md group-hover:bg-blue-500/10 transition-all duration-500" />
                <div className="relative bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center p-1.5 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mr-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ask your second brain..."
                    className="w-full bg-transparent border-none text-sm text-slate-700 placeholder-slate-400 focus:ring-0 focus:outline-none"
                  />
                  <div className="flex items-center space-x-1 pr-2">
                    <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 border border-slate-200 rounded text-[10px] font-sans font-medium text-slate-400">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center space-x-6">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-900">Tuesday, Oct 24</div>
                  <div className="text-[10px] text-slate-500">Local Processing • Online</div>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

              {employeeActiveTab === 'Focus HUD' ? (
                <>
                  {/* Hero: Neural Core */}
                  <section className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-blue-200/50 group card-fade-in">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300" />
                    <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-45 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-[3s] ease-in-out" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />

                    <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center text-white">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center text-xs font-bold text-blue-100">
                            <Zap className="w-3 h-3 mr-1.5 text-yellow-300" />
                            System Running
                          </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Your workspace is active.</h1>
                        <p className="text-blue-100 text-lg opacity-90 max-w-lg">
                          Context tracking is running. {sessionMinutes} minutes of session time recorded.
                        </p>

                        <div className="mt-8 flex space-x-4">
                          <button
                            onClick={() => setIsRecording(!isRecording)}
                            className="px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-lg hover:bg-blue-50 transition-all flex items-center"
                          >
                            {isRecording ? (
                              <>
                                <Pause className="w-4 h-4 mr-2 fill-current" /> Pause Context
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2 fill-current" /> Resume
                              </>
                            )}
                          </button>
                          <button className="px-6 py-3 rounded-xl bg-blue-800/40 border border-white/10 text-white font-medium text-sm backdrop-blur-md hover:bg-blue-800/60 transition-all">
                            Generate Daily Summary
                          </button>
                        </div>
                      </div>

                      <div className="hidden md:flex relative w-48 h-48 items-center justify-center">
                        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                        <div className="absolute inset-4 border-2 border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 opacity-20 blur-xl animate-pulse" />
                        <div className="relative z-10 text-center">
                          <div className="text-5xl font-bold text-white tracking-tighter">{sessionMinutes}</div>
                          <div className="text-xs font-medium text-blue-200 uppercase tracking-widest mt-1">Minutes</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Memory Sparks */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                          Memory Sparks
                        </h3>
                        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                          AI Suggested
                        </span>
                      </div>

                      {MEMORY_SPARKS.map((spark) => (
                        <div
                          key={spark.id}
                          className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden card-fade-in"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform" />
                          <div className="flex items-start space-x-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <spark.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800 text-sm mb-0.5">{spark.text}</h4>
                              <p className="text-xs text-slate-500 leading-tight mb-3">{spark.sub}</p>
                              <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center w-max hover:bg-blue-100 transition-colors">
                                {spark.action} <ArrowUpRight className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-100/50 card-fade-in">
                        <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Focus Quality</div>
                        <div className="flex items-end space-x-2">
                          <span className="text-3xl font-bold text-slate-900">92%</span>
                          <span className="text-xs text-slate-500 mb-1">Top 5% this week</span>
                        </div>
                        <div className="w-full bg-white h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-400 w-[92%] h-full rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Memory Stream */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center">
                          <Layers className="w-4 h-4 mr-2 text-blue-500" />
                          Context Stream
                        </h3>
                        <div className="flex space-x-2">
                          <button className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm hover:text-blue-600">
                            Today
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 relative">
                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100 z-0" />

                        {MEMORY_STREAM.map((item, idx) => (
                          <div key={item.id} className="relative z-10 pl-2 card-fade-in" style={{ animationDelay: `${100 + idx * 80}ms` }}>
                            <div className="group flex items-start">
                              <div className="flex flex-col items-center mr-4 pt-1">
                                <div className={`w-3 h-3 rounded-full ${item.color} ring-4 ring-white shadow-sm mb-1`} />
                                <div className="text-[10px] font-bold text-slate-400">{item.time}</div>
                              </div>

                              <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wide border border-slate-100">
                                      {item.app}
                                    </span>
                                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                  </div>
                                  <span className="text-xs font-medium text-slate-400">{item.duration}</span>
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 group-hover:bg-blue-50/30 group-hover:text-slate-700 transition-colors">
                                  {item.ai_summary}
                                </p>

                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span>Auto-logged</span>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : employeeActiveTab === 'Total Recall' ? (
                <div className="w-full animate-fade-in pb-32">
                  {/* --- HEADER: 纯净标题区 (移除大搜索框) --- */}
                  <div className="mb-6">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                          Total Recall
                          <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">
                            Semantic Index
                          </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Your photographic memory across all apps.</p>
                      </div>

                      {/* 右侧小过滤器 (可选) */}
                      <button className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center transition-colors">
                        <Filter className="w-3 h-3 mr-1" /> Advanced Filter
                      </button>
                    </div>

                    {/* --- TABS: 智能聚类 (无滚动条 + 蓝色选中态) --- */}
                    <div className="w-full overflow-hidden">
                      <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
                        {SMART_CLUSTERS.map((cluster) => (
                          <button
                            key={cluster.id}
                            onClick={() => setRecallTab(cluster.id)}
                            className={`flex items-center px-4 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex-shrink-0 ${
                              recallTab === cluster.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >
                            {cluster.label}
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                                recallTab === cluster.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {cluster.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* --- AI CONTEXT CARD (只在 All 或相关时显示) --- */}
                  <div className="mb-8 bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden card-fade-in">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-5 py-3 border-b border-blue-100 flex items-center justify-between">
                      <div className="flex items-center text-blue-700 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                        Latest Context: Q3 Planning
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Based on your recent activity, you are focusing on <b className="text-slate-900">Q3 Budgeting</b>. You last
                        viewed the Excel sheet 2 hours ago during the Zoom meeting with Sarah.
                      </p>
                    </div>
                  </div>

                  {/* --- MEMORY GRID (真实渲染过滤后的数据) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(recallTab === 'All' ? ALL_MEMORIES : ALL_MEMORIES.filter((m) => m.category === recallTab)).map(
                      (item, idx) => (
                        <div
                          key={item.id}
                          className={`${GLASS_CARD} group cursor-pointer overflow-hidden flex flex-col card-fade-in hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 relative`}
                          style={{ animationDelay: `${80 + idx * 60}ms` }}
                        >
                          {/* Visual Snapshot */}
                          <div
                            className={`h-36 w-full relative ${item.image_color} group-hover:opacity-90 transition-opacity flex items-center justify-center`}
                          >
                            {/* Context Badge */}
                            {item.related_to && (
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center shadow-sm z-10">
                                <Link className="w-3 h-3 mr-1" /> {item.related_to}
                              </div>
                            )}

                            {/* Icon Placeholder */}
                            {item.type === 'meeting' && <Video className="w-12 h-12 text-white/50" />}
                            {item.type === 'doc' && <FileText className="w-12 h-12 text-slate-400/50" />}
                            {item.type === 'chat' && <MessageSquare className="w-12 h-12 text-purple-200/50" />}

                            {/* App Icon */}
                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 flex items-center shadow-sm">
                              {item.app}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-800 text-sm truncate w-full group-hover:text-blue-600 transition-colors">
                                {item.title}
                              </h4>
                            </div>
                            <div className="flex items-center text-[10px] text-slate-400 mb-3">
                              <Calendar className="w-3 h-3 mr-1" /> {item.timestamp}
                            </div>

                            {/* Intelligent Highlight */}
                            <div className="relative bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 group-hover:bg-blue-50/30 transition-colors">
                              <div className="absolute -left-3 top-3 w-1 h-8 rounded-r-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.context_text}</p>
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {item.keywords.map((k, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-white text-slate-500 text-[10px] rounded font-medium border border-slate-100 group-hover:border-blue-100 group-hover:text-blue-600 transition-colors"
                                  >
                                    #{k}
                                  </span>
                                ))}
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-slate-400 hover:text-blue-600">
                                  <CornerDownRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}

                    {/* 空状态处理 */}
                    {(recallTab === 'All' ? ALL_MEMORIES : ALL_MEMORIES.filter((m) => m.category === recallTab)).length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                          <Image className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500">No memories found in this category.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : employeeActiveTab === 'My Rhythm' ? (
                <MyRhythmViewContent />
              ) : (
                <div className="flex items-center justify-center h-[500px] text-slate-400">
                  <div className="text-center">
                    <LayoutGrid size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Content for &quot;{employeeActiveTab}&quot; would appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Manager View Content
          <>
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
               <div
                 className={`${GLASS_CARD} p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6 cursor-default card-fade-in`}
                 style={{ animationDelay: '80ms' }}
               >
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
                {TRACE_DATA.map((dept, idx) => (
                  <div
                    key={dept.id}
                    className={`${GLASS_CARD} p-5 cursor-default card-fade-in`}
                    style={{ animationDelay: `${140 + idx * 80}ms` }}
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
              <div
                className={`${GLASS_CARD} overflow-hidden flex flex-col md:flex-row card-fade-in`}
                style={{ animationDelay: '260ms' }}
              >
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
        ) : activeTab === 'Workflow Traces' ? (
          <div className="space-y-8">
            <section className="mt-2 card-fade-in" style={{ animationDelay: '60ms' }}>
              <div className="flex flex-col xl:flex-row gap-6">
                {/* 左侧：Workflow Logs，使用玻璃卡片包裹 */}
                <aside className="w-full xl:w-80">
                  <div className={`${GLASS_CARD} p-4 h-full flex flex-col cursor-default`}>
                    <h2 className="font-bold text-slate-900 mb-4">Workflow Logs</h2>
                    <div className="relative mb-3">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search ID, type or owner..."
                        className="w-full pl-9 pr-3 py-2 bg-white/40 border border-white/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-gray-400"
                        value={workflowFilterText}
                        onChange={(e) => setWorkflowFilterText(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 mb-3">
                      <button className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white/60 border border-white/60 rounded hover:bg-white transition-colors">
                        <Filter className="w-3 h-3 mr-1.5" /> Filter
                      </button>
                      <button className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white/60 border border-white/60 rounded hover:bg-white transition-colors">
                        Last 7 Days
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto -mx-4 px-4 custom-scrollbar">
                      {TRACE_LIST.filter((t) => {
                        const q = workflowFilterText.toLowerCase();
                        if (!q) return true;
                        return (
                          t.id.toLowerCase().includes(q) ||
                          t.title.toLowerCase().includes(q) ||
                          t.owner.toLowerCase().includes(q)
                        );
                      }).map((trace) => (
                        <div
                          key={trace.id}
                          onClick={() => setSelectedTraceId(trace.id)}
                          className={`p-4 border-b border-white/40 cursor-pointer hover:bg-white/60 transition-colors ${
                            selectedTraceId === trace.id
                              ? 'bg-blue-50/40 border-l-4 border-l-blue-600'
                              : 'border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800 text-sm truncate pr-2">
                              {trace.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                trace.status === 'Critical' ? 'text-rose-600' : 'text-gray-400'
                              }`}
                            >
                              {trace.duration}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">{trace.id}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${
                                trace.status === 'Critical'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : trace.status === 'Warning'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}
                            >
                              {trace.status}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <User className="w-3 h-3 mr-1" /> {trace.owner}
                            <span className="mx-2">•</span>
                            <span>{trace.startTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* 右侧：Timeline + Insight */}
                <section className="flex-1 space-y-6">
                  {/* Header */}
                  <header
                    className={`${GLASS_CARD} px-6 py-5 flex justify-between items-center cursor-default card-fade-in`}
                    style={{ animationDelay: '120ms' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <span>Workflow Trace</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="font-medium text-slate-900">{WORKFLOW_TIMELINE.id}</span>
                      </div>
                      <h1 className="text-xl font-bold text-slate-900">
                        Contract Renewal: Acme Corp
                      </h1>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Total Duration
                        </div>
                        <div className="text-2xl font-bold text-rose-600 flex items-center justify-end">
                          <Clock className="w-5 h-5 mr-2" />
                          {WORKFLOW_TIMELINE.summary.totalDuration}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Avg: {WORKFLOW_TIMELINE.summary.expectedDuration} (+380% deviation)
                        </div>
                      </div>
                      <div className="h-12 w-px bg-gray-200" />
                      <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Bottleneck
                        </div>
                        <div className="text-lg font-bold text-slate-800">
                          {WORKFLOW_TIMELINE.summary.bottleneckStage}
                        </div>
                        <div className="text-xs text-rose-500 font-medium">12d 6h blocked</div>
                      </div>
                    </div>
                  </header>

                  {/* Timeline */}
                  <div
                    className={`${GLASS_CARD} p-6 card-fade-in`}
                    style={{ animationDelay: '180ms' }}
                  >
                    <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
                      Execution Timeline
                    </h3>
                    <div className="flex gap-4 mb-4 text-xs text-slate-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2" />
                        Active Work
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-sm mr-2" />
                        Queue / Wait
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-rose-500 rounded-sm mr-2" />
                        Blocked / Deviation
                      </div>
                    </div>
                    <div className="space-y-4 relative">
                      <div className="absolute left-[180px] top-4 bottom-4 w-px bg-gray-100 z-0" />
                      {WORKFLOW_TIMELINE.stages.map((stage) => (
                        <div key={stage.id} className="relative z-10 group">
                          <div className="flex items-center">
                            <div className="w-[180px] pr-4 text-right flex-shrink-0">
                              <div className="text-sm font-bold text-slate-700">{stage.name}</div>
                              <div className="text-xs text-gray-400">{stage.tool}</div>
                            </div>
                            <div className="flex-1 h-12 relative bg-white/40 rounded-lg border border-white/60 flex items-center px-2">
                              <div
                                onClick={() => setSelectedStageId(stage.id)}
                                className={`
                                  h-6 rounded cursor-pointer transition-all duration-200 relative
                                  ${
                                    stage.type === 'active'
                                      ? 'bg-blue-500 hover:bg-blue-600'
                                      : ''
                                  }
                                  ${
                                    stage.type === 'queue'
                                      ? 'bg-gray-300 hover:bg-gray-400'
                                      : ''
                                  }
                                  ${
                                    stage.type === 'blocked'
                                      ? 'bg-rose-500 hover:bg-rose-600 shadow-md ring-2 ring-rose-100'
                                      : ''
                                  }
                                  ${
                                    stage.type === 'pending'
                                      ? 'bg-white border-2 border-dashed border-gray-300'
                                      : ''
                                  }
                                  ${
                                    selectedStageId === stage.id
                                      ? 'ring-2 ring-offset-1 ring-slate-900'
                                      : ''
                                  }
                                `}
                                style={{
                                  width: stage.timelineWidth,
                                  marginLeft: stage.timelineOffset,
                                }}
                              >
                                {stage.type === 'blocked' && (
                                  <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                      backgroundImage:
                                        'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                                      backgroundSize: '8px 8px',
                                    }}
                                  />
                                )}
                                <span
                                  className={`absolute top-[-20px] left-0 text-[10px] font-bold whitespace-nowrap ${
                                    stage.type === 'blocked'
                                      ? 'text-rose-600'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {stage.duration}
                                </span>
                              </div>
                            </div>
                            <div className="w-32 pl-4 flex items-center">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 mr-2">
                                {stage.owner.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-500 truncate">
                                {stage.owner}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Panel */}
                  {activeWorkflowInsight ? (
                    <div
                      className={`${GLASS_CARD} border border-rose-100 overflow-hidden card-fade-in`}
                      style={{ animationDelay: '240ms' }}
                    >
                      <div className="bg-rose-50/60 px-6 py-3 border-b border-rose-100 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-rose-600 mr-2" />
                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                          Root Cause Analysis
                        </span>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {activeWorkflowInsight.title}
                          </h3>
                          <div className="text-sm text-slate-600 mb-4">
                            <span className="font-semibold text-slate-900">Impact: </span>
                            {activeWorkflowInsight.impact}
                          </div>
                          <div className="p-3 bg-gray-50/80 rounded-lg text-xs text-gray-500 border border-gray-100">
                            <span className="font-bold text-gray-700 block mb-1">
                              Detected Root Cause:
                            </span>
                            {activeWorkflowInsight.rootCause}
                          </div>
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              VLM Observation
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed mb-4">
                              {activeWorkflowInsight.observation}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {activeWorkflowInsight.evidence.map((ev, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {ev.type === 'email' ? (
                                    <Mail className="w-3 h-3 mr-1.5" />
                                  ) : (
                                    <FileText className="w-3 h-3 mr-1.5" />
                                  )}
                                  {ev.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-sm text-slate-600">
                              <span className="font-bold text-slate-900">
                                Recommendation:{' '}
                              </span>
                              {activeWorkflowInsight.recommendation}
                            </div>
                            <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition-colors">
                              View Logs
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                      Select a stage above to view detailed analysis
                    </div>
                  )}
                </section>
              </div>
            </section>
          </div>
        ) : activeTab === 'Team Pulse' ? (
          <div className="space-y-8">
            {/* Header */}

            {/* Vitals cards */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {HEALTH_METRICS.map((metric, idx) => (
                <div
                  key={metric.id}
                  className={`${GLASS_CARD} p-5 flex flex-col justify-between cursor-default card-fade-in`}
                  style={{ animationDelay: `${80 + idx * 60}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        metric.status === 'Critical'
                          ? 'bg-rose-50 text-rose-600'
                          : metric.status === 'Warning'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <metric.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        metric.trendDir === 'down' && metric.id === 'm1'
                          ? 'bg-rose-50 text-rose-600'
                          : metric.trendDir === 'up'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {metric.trend}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
                      {metric.label}
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                    {metric.subValue && (
                      <div className="text-xs text-slate-500 mt-1">{metric.subValue}</div>
                    )}
                  </div>
                </div>
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Work composition */}
              <section
                className="lg:col-span-2 card-fade-in"
                style={{ animationDelay: '80ms' }}
              >
                <div className={`${GLASS_CARD} p-6 cursor-default`}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Work Composition by Team</h2>
                    <div className="flex space-x-4 text-xs text-slate-600">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-2" />
                        Deep Work (Focus)
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-amber-400 rounded-sm mr-2" />
                        Collaboration
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-rose-400 rounded-sm mr-2" />
                        Friction / Admin
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {DEPT_COMPOSITION.map((dept) => (
                      <div
                        key={dept.name}
                        onClick={() => setSelectedDept(dept.name)}
                        className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                          selectedDept === dept.name
                            ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-100'
                            : 'bg-white/70 border-transparent hover:bg-white/90'
                        }`}
                      >
                        <div className="flex justify-between text-sm mb-2">
                          <div className="flex items-center">
                            <span
                              className={`font-bold ${
                                selectedDept === dept.name ? 'text-blue-700' : 'text-slate-700'
                              }`}
                            >
                              {dept.name}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">
                              ({dept.totalMembers} members)
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-slate-600">
                            Click to analyze
                          </span>
                        </div>
                        <div className="h-4 w-full flex rounded-full overflow-hidden opacity-90 group-hover:opacity-100 group-hover:shadow-sm">
                          <div
                            style={{ width: `${dept.focus}%` }}
                            className="bg-emerald-500 h-full"
                          />
                          <div
                            style={{ width: `${dept.collab}%` }}
                            className="bg-amber-400 h-full"
                          />
                          <div
                            style={{ width: `${dept.friction}%` }}
                            className="bg-rose-400 h-full relative"
                          >
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                backgroundImage:
                                  'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                                backgroundSize: '6px 6px',
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                          <span>{dept.focus}% Focus</span>
                          <span>{dept.friction}% Friction</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Insights panel */}
              <section className="lg:col-span-1 card-fade-in" style={{ animationDelay: '120ms' }}>
                <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                  <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
                    <LayoutGrid className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="font-bold text-lg">Friction Analysis</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Viewing Context
                    </span>
                    <div className="text-xl font-bold text-blue-100 mt-1 flex items-center flex-wrap gap-2">
                      {selectedDept} Team
                      {selectedDept === 'Engineering' && (
                        <span className="text-xs bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded border border-rose-500/30">
                          High Load
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {activeTeamInsights.length === 0 ? (
                      <div className="text-slate-500 text-sm text-center py-10">
                        No critical friction detected for this team.
                      </div>
                    ) : (
                      activeTeamInsights.map((insight) => (
                        <div
                          key={insight.id}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded uppercase">
                              {insight.type}
                            </span>
                            {insight.severity === 'Critical' && (
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-white mb-2">{insight.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            {insight.content}
                          </p>
                          <div className="pt-3 border-t border-slate-700/50">
                            <div className="flex items-start">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-xs text-emerald-100/80 italic">
                                {insight.action}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                    <button className="text-xs text-slate-400 hover:text-white flex items-center justify-center w-full">
                      View Full Report <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
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
          </>
        )}
        </main>
      </div>
    </div>
  );
}



