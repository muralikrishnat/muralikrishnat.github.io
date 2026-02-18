import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layout, 
  Activity, 
  FileText, 
  Zap, 
  BarChart3, 
  Search, 
  ArrowRight, 
  Layers, 
  Globe,
  HardDrive,
  Clock,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

// --- Mock Data for the Analyzer ---
const MOCK_PAGES = [
  { id: '1', path: '/', name: 'Home', complexity: 'Low', depth: 0, status: 'Production' },
  { id: '2', path: '/dashboard', name: 'User Dashboard', complexity: 'High', depth: 1, status: 'Production' },
  { id: '3', path: '/settings', name: 'Settings', complexity: 'Medium', depth: 1, status: 'Beta' },
  { id: '4', path: '/checkout', name: 'Checkout Flow', complexity: 'Very High', depth: 2, status: 'Production' },
  { id: '5', path: '/api-docs', name: 'API Documentation', complexity: 'Medium', depth: 1, status: 'Staging' },
];

const MOCK_JOURNEYS = [
  { id: 'j1', name: 'User Onboarding', steps: ['Landing', 'Sign Up', 'Verification', 'Welcome'], health: 92 },
  { id: 'j2', name: 'E-commerce Purchase', steps: ['Product List', 'Product Detail', 'Cart', 'Checkout', 'Success'], health: 78 },
  { id: 'j3', name: 'Password Recovery', steps: ['Login Page', 'Forgot Password', 'Email Link', 'Reset Form'], health: 98 },
];

const MOCK_RESOURCES = [
  { name: 'main.bundle.js', type: 'Script', size: 1250, transfer: 450, time: 320 },
  { name: 'vendor.chunks.js', type: 'Script', size: 3400, transfer: 980, time: 850 },
  { name: 'global.css', type: 'Style', size: 450, transfer: 120, time: 110 },
  { name: 'hero-image.webp', type: 'Image', size: 850, transfer: 850, time: 400 },
  { name: 'config.json', type: 'Fetch', size: 12, transfer: 5, time: 45 },
  { name: 'inter-font.woff2', type: 'Font', size: 95, transfer: 95, time: 80 },
];

const MOCK_NETWORK_CALLS = [
  { method: 'GET', url: '/api/v1/user/profile', status: 200, size: '2.4kb', latency: '45ms' },
  { method: 'POST', url: '/api/v1/analytics/track', status: 204, size: '0.8kb', latency: '12ms' },
  { method: 'GET', url: '/api/v1/products/featured', status: 200, size: '45.2kb', latency: '210ms' },
  { method: 'PUT', url: '/api/v1/settings/theme', status: 403, size: '1.1kb', latency: '38ms' },
  { method: 'GET', url: '/api/v1/notifications', status: 200, size: '5.6kb', latency: '67ms' },
];

// --- Helper Components ---

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value, max, label, color = "bg-indigo-600" }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1 text-xs font-medium text-slate-600">
      <span>{label}</span>
      <span>{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div 
        className={`${color} h-1.5 rounded-full transition-all duration-500`} 
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const totalTransfer = useMemo(() => MOCK_RESOURCES.reduce((acc, r) => acc + r.transfer, 0), []);
  const totalUncompressed = useMemo(() => MOCK_RESOURCES.reduce((acc, r) => acc + r.size, 0), []);
  const compressionRatio = ((1 - totalTransfer / totalUncompressed) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-bottom">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Zap fill="currentColor" size={24} />
            <span className="text-xl font-bold tracking-tight">ArchLens</span>
          </div>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Site Intelligence</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'pages', icon: Layers, label: 'Pages & Hierarchy' },
            { id: 'journeys', icon: Activity, label: 'User Journeys' },
            { id: 'files', icon: FileText, label: 'Resource Analysis' },
            { id: 'network', icon: Globe, label: 'Network Calls' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs font-semibold text-slate-400 mb-1">HEALTH SCORE</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">84</span>
              <span className="text-green-400 text-sm mb-1 font-medium">↑ 2.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search endpoints or assets..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Viewport Area */}
        <main className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Assets" 
                  value={MOCK_RESOURCES.length} 
                  subtitle="Across all bundles" 
                  icon={FileText} 
                  colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard 
                  title="Transfer Size" 
                  value={`${(totalTransfer / 1024).toFixed(2)} MB`} 
                  subtitle={`Saved ${compressionRatio}% via Gzip/Brotli`} 
                  icon={HardDrive} 
                  colorClass="bg-emerald-50 text-emerald-600"
                />
                <StatCard 
                  title="Avg Latency" 
                  value="74ms" 
                  subtitle="API Response average" 
                  icon={Clock} 
                  colorClass="bg-amber-50 text-amber-600"
                />
                <StatCard 
                  title="Active Routes" 
                  value={MOCK_PAGES.length} 
                  subtitle="Live in production" 
                  icon={Layers} 
                  colorClass="bg-purple-50 text-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    Resource Distribution
                  </h3>
                  <div className="space-y-6">
                    {MOCK_RESOURCES.map((res, i) => (
                      <ProgressBar 
                        key={i}
                        label={res.name}
                        value={res.size}
                        max={4000}
                        color={res.type === 'Script' ? 'bg-indigo-500' : res.type === 'Style' ? 'bg-pink-500' : 'bg-slate-400'}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-6">Health Alerts</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-3 rounded-lg bg-red-50 border border-red-100">
                      <ShieldAlert className="text-red-600 shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-bold text-red-900">Heavy Bundle Detected</p>
                        <p className="text-xs text-red-700">vendor.chunks.js is 3.4MB uncompressed. Consider code splitting.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <Clock className="text-amber-600 shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Slow API Endpoint</p>
                        <p className="text-xs text-amber-700">/products/featured took 210ms to respond.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-3 rounded-lg bg-green-50 border border-green-100">
                      <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-bold text-green-900">Optimization Complete</p>
                        <p className="text-xs text-green-700">Images are now served in WebP format.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Page Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Route</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Complexity</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_PAGES.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          {page.depth === 0 ? <Globe size={16} /> : <ChevronRight size={16} />}
                        </div>
                        <span className="font-medium text-slate-900">{page.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-indigo-600">{page.path}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          page.complexity.includes('High') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {page.complexity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{page.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'journeys' && (
            <div className="grid grid-cols-1 gap-6">
              {MOCK_JOURNEYS.map((journey) => (
                <div key={journey.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-bold">{journey.name}</h4>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      journey.health > 90 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {journey.health}% Health
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {journey.steps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                          {step}
                        </div>
                        {idx < journey.steps.length - 1 && (
                          <ArrowRight size={16} className="text-slate-300" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">File Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Raw Size</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Transfer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_RESOURCES.map((file, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{file.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">{file.size} KB</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-indigo-600">{file.transfer} KB</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">{file.time} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Method</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Endpoint</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Size</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_NETWORK_CALLS.map((call, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          call.method === 'GET' ? 'text-blue-600 border-blue-200 bg-blue-50' : 
                          call.method === 'POST' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                          'text-amber-600 border-amber-200 bg-amber-50'
                        }`}>
                          {call.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-700">{call.url}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${call.status >= 400 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className="text-sm font-medium">{call.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">{call.size}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">{call.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}