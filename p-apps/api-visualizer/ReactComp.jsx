import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  Key, 
  Unlock,
  X, 
  Layers,
  LayoutGrid,
  FileCheck,
  Filter,
  ScanLine,
  ChevronRight,
  Info
} from 'lucide-react';

/**
 * MOCK DATA
 */
const PROJECT_DATA = {
  stats: {
    endpoints: 5,
    tables: 4,
    databases: 1,
    security: "OAuth 2.0 + RBAC"
  },
  middleware: [
    { id: 'mw-auth-jwt', type: 'security', name: 'JWT Guard', desc: 'Validates Bearer token', icon: 'lock' },
    { id: 'mw-auth-key', type: 'security', name: 'API Key Check', desc: 'Validates x-api-key', icon: 'key' },
    { id: 'mw-auth-public', type: 'security', name: 'Public Gateway', desc: 'No auth required', icon: 'unlock' },
    { id: 'mw-val-user', type: 'validation', name: 'User Schema', desc: 'Zod: email/password', icon: 'check' },
    { id: 'mw-val-order', type: 'validation', name: 'Order Sanitizer', desc: 'Strip HTML tags', icon: 'filter' },
    { id: 'mw-val-id', type: 'validation', name: 'UUID Pipe', desc: 'Regex validation', icon: 'scan' },
  ],
  endpoints: [
    {
      id: 'ep-1',
      method: 'GET',
      path: '/api/v1/users',
      summary: 'List Users',
      description: 'Retrieve a paginated list of users.',
      security: { type: 'Bearer Token', scope: 'read:users' },
      request: { type: 'Query Params', fields: [{ name: 'page', type: 'int' }] },
      response: { code: 200, type: 'JSON', body: { data: 'User[]' } },
      flow: ['mw-auth-jwt', 'mw-val-user'],
      connectsTo: ['tbl-users']
    },
    {
      id: 'ep-2',
      method: 'POST',
      path: '/api/v1/users',
      summary: 'Register User',
      description: 'Create a new user account.',
      security: { type: 'Public', scope: 'none' },
      request: { type: 'JSON Body', fields: [{ name: 'email', type: 'string' }] },
      response: { code: 201, type: 'JSON', body: { id: 'uuid' } },
      flow: ['mw-auth-public', 'mw-val-user'],
      connectsTo: ['tbl-users', 'tbl-logs']
    },
    {
      id: 'ep-3',
      method: 'POST',
      path: '/api/v1/orders',
      summary: 'Create Order',
      description: 'Process a new order.',
      security: { type: 'Bearer Token', scope: 'write:orders' },
      request: { type: 'JSON Body', fields: [{ name: 'items', type: 'array' }] },
      response: { code: 201, type: 'JSON', body: { id: 'uuid' } },
      flow: ['mw-auth-jwt', 'mw-val-order'],
      connectsTo: ['tbl-orders', 'tbl-products', 'tbl-users']
    },
    {
      id: 'ep-4',
      method: 'GET',
      path: '/api/v1/products/:id',
      summary: 'Get Product',
      description: 'Get public product details.',
      security: { type: 'API Key', scope: 'read:public' },
      request: { type: 'URL Param', fields: [{ name: 'id', type: 'uuid' }] },
      response: { code: 200, type: 'JSON', body: { name: 'string' } },
      flow: ['mw-auth-key', 'mw-val-id'],
      connectsTo: ['tbl-products']
    },
    {
      id: 'ep-5',
      method: 'DELETE',
      path: '/api/v1/orders/:id',
      summary: 'Cancel Order',
      description: 'Cancel an order.',
      security: { type: 'Bearer Token', scope: 'admin' },
      request: { type: 'URL Param', fields: [{ name: 'id', type: 'uuid' }] },
      response: { code: 204, type: 'Empty', body: {} },
      flow: ['mw-auth-jwt', 'mw-val-id'],
      connectsTo: ['tbl-orders', 'tbl-logs']
    }
  ],
  tables: [
    {
      id: 'tbl-users',
      name: 'users',
      type: 'table',
      description: 'User credentials and profiles.',
      fields: [{ name: 'id', type: 'uuid', pk: true }, { name: 'email', type: 'varchar' }]
    },
    {
      id: 'tbl-products',
      name: 'products',
      type: 'table',
      description: 'Inventory management.',
      fields: [{ name: 'id', type: 'uuid', pk: true }, { name: 'stock', type: 'int' }]
    },
    {
      id: 'tbl-orders',
      name: 'orders',
      type: 'table',
      description: 'Transaction records.',
      fields: [{ name: 'id', type: 'uuid', pk: true }, { name: 'total', type: 'decimal' }]
    },
    {
      id: 'tbl-logs',
      name: 'audit_logs',
      type: 'collection',
      description: 'Immutable activity logs.',
      fields: [{ name: '_id', type: 'oid', pk: true }, { name: 'action', type: 'string' }]
    }
  ]
};

const ICONS = {
  lock: ShieldCheck,
  key: Key,
  unlock: Unlock,
  check: FileCheck,
  filter: Filter,
  scan: ScanLine
};

// --- HELPER COMPONENTS ---

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    POST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    DELETE: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return (
    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${colors[method] || 'bg-gray-700'}`}>
      {method}
    </span>
  );
};

const DetailPanel = ({ data, type, onClose }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0f172a]/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-1">{type} profile</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{data.path || data.name}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
          <X size={20}/>
        </button>
      </div>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Info size={14}/> Description
          </h3>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
            {data.description || data.desc}
          </div>
        </section>
        
        {type === 'endpoint' && (
          <div className="space-y-4">
             <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-tighter">Security Protocol</div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-emerald-400 text-sm font-mono">{data.security.type}</span>
                </div>
             </div>
             <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-tighter">Request Schema</div>
                <pre className="text-xs text-blue-300 overflow-x-auto font-mono bg-black/30 p-2 rounded">{JSON.stringify(data.request, null, 2)}</pre>
             </div>
             <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-tighter">Typical Response</div>
                <pre className="text-xs text-purple-300 overflow-x-auto font-mono bg-black/30 p-2 rounded">{JSON.stringify(data.response, null, 2)}</pre>
             </div>
          </div>
        )}

        {type === 'middleware' && (
           <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm text-slate-400 italic">
              "This middleware performs stateless validation on the incoming stream. It is horizontally scalable and handles high-throughput traffic."
           </div>
        )}

        {type === 'table' && (
           <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Schema Structure</h3>
              {data.fields.map(f => (
                <div key={f.name} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs">
                  <span className="text-pink-400">{f.name} {f.pk && <span className="text-[8px] bg-pink-500/20 text-pink-500 px-1 rounded ml-1">PK</span>}</span>
                  <span className="text-slate-500">{f.type}</span>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null); 
  const [hoveredNode, setHoveredNode] = useState(null);
  const [segments, setSegments] = useState([]);
  
  const nodeRefs = useRef({});
  const containerRef = useRef(null);

  const updateLayout = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newSegments = [];

    const getCoords = (id) => {
      const el = nodeRefs.current[id];
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
        right: rect.right - containerRect.left
      };
    };

    PROJECT_DATA.endpoints.forEach(ep => {
      const epPos = getCoords(ep.id);
      if (!epPos) return;

      let currentX = epPos.right;
      let currentY = epPos.y;
      let previousId = ep.id;

      // 1. Endpoint -> Flow (Security & Validation are handled sequentially)
      if (ep.flow) {
        ep.flow.forEach((mwId) => {
          const mwPos = getCoords(mwId);
          if (mwPos) {
            newSegments.push({
              id: `${ep.id}-${previousId}-${mwId}`,
              endpointId: ep.id,
              startX: currentX,
              startY: currentY,
              endX: mwPos.x,
              endY: mwPos.y
            });
            currentX = mwPos.right;
            currentY = mwPos.y;
            previousId = mwId;
          }
        });
      }

      // 2. Last Middleware -> Destination Tables
      if (ep.connectsTo) {
        ep.connectsTo.forEach(tableId => {
          const tablePos = getCoords(tableId);
          if (tablePos) {
            newSegments.push({
              id: `${ep.id}-${previousId}-${tableId}`,
              endpointId: ep.id,
              startX: currentX,
              startY: currentY,
              endX: tablePos.x,
              endY: tablePos.y
            });
          }
        });
      }
    });

    setSegments(newSegments);
  };

  useEffect(() => {
    updateLayout();
    const timer = setInterval(updateLayout, 1000); // Periodic check for layout shifts
    window.addEventListener('resize', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      clearInterval(timer);
    };
  }, []);

  const activeEpId = hoveredNode?.startsWith('ep-') ? hoveredNode : (selectedNode?.id?.startsWith('ep-') ? selectedNode.id : null);

  const isHighlighted = (id) => {
    if (!activeEpId) return false;
    if (id === activeEpId) return true;
    const ep = PROJECT_DATA.endpoints.find(e => e.id === activeEpId);
    return ep?.flow?.includes(id) || ep?.connectsTo?.includes(id);
  };

  const isDimmed = (id) => !!activeEpId && !isHighlighted(id);

  const getSelectedData = () => {
    if (!selectedNode) return null;
    if (selectedNode.type === 'endpoint') return PROJECT_DATA.endpoints.find(e => e.id === selectedNode.id);
    if (selectedNode.type === 'middleware') return PROJECT_DATA.middleware.find(m => m.id === selectedNode.id);
    return PROJECT_DATA.tables.find(t => t.id === selectedNode.id);
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Layers className="text-cyan-400" size={20} />
          </div>
          <span className="text-white font-bold tracking-tight text-lg">
            API<span className="text-cyan-500">ENGINE</span>
          </span>
        </div>
        
        <div className="hidden md:flex gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-500">
           <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"/> Request</span>
           <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/> Security</span>
           <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"/> Logic</span>
           <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"/> Persistence</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-x-auto overflow-y-hidden scroll-smooth" ref={containerRef}>
        
        {/* Connection Paths SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="glow-path" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {segments.map((seg) => {
             const isActive = activeEpId === seg.endpointId;
             const pathData = `
               M ${seg.startX} ${seg.startY} 
               C ${seg.startX + (seg.endX - seg.startX) / 2} ${seg.startY}, 
                 ${seg.startX + (seg.endX - seg.startX) / 2} ${seg.endY}, 
                 ${seg.endX} ${seg.endY}
             `;
             return (
               <g key={seg.id}>
                 <path d={pathData} stroke="#1e293b" strokeWidth="1.5" fill="none" className="transition-all duration-500" />
                 {isActive && (
                    <>
                      <path 
                        d={pathData} 
                        stroke="url(#path-gradient)" 
                        strokeWidth="3" 
                        fill="none" 
                        filter="url(#glow-path)"
                        strokeDasharray="10, 10"
                        className="animate-pulse"
                      >
                         <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite" />
                      </path>
                    </>
                 )}
               </g>
             );
          })}
        </svg>

        {/* COLUMN 1: CLIENT/GATEWAY */}
        <section className="w-80 flex-none flex flex-col border-r border-slate-800/50 bg-slate-950/20 z-10">
          <div className="p-4 border-b border-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex justify-between items-center">
             <span>Endpoints</span>
             <Server size={14} className="opacity-50"/>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {PROJECT_DATA.endpoints.map(ep => (
               <div 
                 key={ep.id}
                 ref={el => nodeRefs.current[ep.id] = el}
                 onMouseEnter={() => setHoveredNode(ep.id)}
                 onMouseLeave={() => setHoveredNode(null)}
                 onClick={() => setSelectedNode({id: ep.id, type: 'endpoint'})}
                 className={`
                    group p-4 rounded-xl border transition-all duration-300 cursor-pointer relative
                    ${isHighlighted(ep.id) ? 'bg-slate-800 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] translate-x-1' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                    ${isDimmed(ep.id) ? 'opacity-30 scale-95 grayscale' : 'opacity-100 scale-100'}
                 `}
               >
                 <div className="flex justify-between items-start mb-2">
                    <MethodBadge method={ep.method}/>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                 </div>
                 <div className="font-mono text-xs text-white font-semibold truncate mb-1">{ep.path}</div>
                 <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">{ep.summary}</div>
                 <div className="absolute top-1/2 -right-[5px] w-2.5 h-2.5 bg-slate-800 border border-slate-600 rounded-full z-10" />
               </div>
             ))}
          </div>
        </section>

        {/* COLUMN 2: SECURITY LAYER */}
        <section className="w-72 flex-none flex flex-col border-r border-slate-800/50 bg-emerald-950/5 z-10">
          <div className="p-4 border-b border-emerald-900/20 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex justify-between items-center">
             <span>Security</span>
             <ShieldCheck size={14}/>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center gap-6 custom-scrollbar">
             {PROJECT_DATA.middleware.filter(m => m.type === 'security').map(mw => (
                <div 
                  key={mw.id}
                  ref={el => nodeRefs.current[mw.id] = el}
                  onClick={() => setSelectedNode({id: mw.id, type: 'middleware'})}
                  className={`
                    p-4 rounded-xl border flex flex-col gap-3 cursor-pointer relative transition-all duration-300
                    ${isHighlighted(mw.id) ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/40 border-slate-800/60'}
                    ${isDimmed(mw.id) ? 'opacity-20 scale-95' : 'opacity-100'}
                  `}
                >
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${isHighlighted(mw.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {React.createElement(ICONS[mw.icon], {size: 16})}
                     </div>
                     <div className="text-xs font-bold text-slate-200">{mw.name}</div>
                   </div>
                   <div className="absolute top-1/2 -left-[5px] w-2 h-2 bg-slate-800 border border-slate-600 rounded-full" />
                   <div className="absolute top-1/2 -right-[5px] w-2 h-2 bg-slate-800 border border-slate-600 rounded-full" />
                </div>
             ))}
          </div>
        </section>

        {/* COLUMN 3: VALIDATION LAYER */}
        <section className="w-72 flex-none flex flex-col border-r border-slate-800/50 bg-indigo-950/5 z-10">
          <div className="p-4 border-b border-indigo-900/20 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex justify-between items-center">
             <span>Validation</span>
             <FileCheck size={14}/>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center gap-6 custom-scrollbar">
             {PROJECT_DATA.middleware.filter(m => m.type === 'validation').map(mw => (
                <div 
                  key={mw.id}
                  ref={el => nodeRefs.current[mw.id] = el}
                  onClick={() => setSelectedNode({id: mw.id, type: 'middleware'})}
                  className={`
                    p-4 rounded-xl border flex flex-col gap-3 cursor-pointer relative transition-all duration-300
                    ${isHighlighted(mw.id) ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/40 border-slate-800/60'}
                    ${isDimmed(mw.id) ? 'opacity-20 scale-95' : 'opacity-100'}
                  `}
                >
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${isHighlighted(mw.id) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {React.createElement(ICONS[mw.icon], {size: 16})}
                     </div>
                     <div className="text-xs font-bold text-slate-200">{mw.name}</div>
                   </div>
                   <div className="absolute top-1/2 -left-[5px] w-2 h-2 bg-slate-800 border border-slate-600 rounded-full" />
                   <div className="absolute top-1/2 -right-[5px] w-2 h-2 bg-slate-800 border border-slate-600 rounded-full" />
                </div>
             ))}
          </div>
        </section>

        {/* COLUMN 4: DATABASE LAYER */}
        <section className="w-80 flex-none flex flex-col bg-pink-950/5 z-10">
          <div className="p-4 border-b border-pink-900/20 text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] flex justify-between items-center">
             <span>Persistence</span>
             <Database size={14}/>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
             {PROJECT_DATA.tables.map(table => (
               <div 
                 key={table.id}
                 ref={el => nodeRefs.current[table.id] = el}
                 onClick={() => setSelectedNode({id: table.id, type: 'table'})}
                 className={`
                    p-4 rounded-xl border transition-all duration-300 cursor-pointer relative
                    ${isHighlighted(table.id) ? 'bg-slate-800 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.15)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                    ${isDimmed(table.id) ? 'opacity-30 scale-95 grayscale' : 'opacity-100'}
                 `}
               >
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-pink-500/10 rounded">
                      <LayoutGrid size={16} className="text-pink-500"/>
                    </div>
                    <span className="font-bold text-sm text-white">{table.name}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 border-t border-slate-800/50 pt-3">
                    {table.fields.slice(0, 2).map(f => (
                       <div key={f.name} className="flex flex-col text-[10px] font-mono">
                          <span className="text-slate-400 truncate">{f.name}</span>
                          <span className="text-slate-600 text-[9px]">{f.type}</span>
                       </div>
                    ))}
                 </div>
                 <div className="absolute top-1/2 -left-[5px] w-2.5 h-2.5 bg-slate-800 border border-slate-600 rounded-full" />
               </div>
             ))}
          </div>
        </section>

      </div>

      <DetailPanel 
        data={getSelectedData()} 
        type={selectedNode?.type} 
        onClose={() => setSelectedNode(null)} 
      />

      {/* Global CSS for Custom Scrollbars */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}