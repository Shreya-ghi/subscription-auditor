import React from 'react'
import { RotateCcw, Database } from 'lucide-react'

export default function DemoNotice({ onResetDemo, onClearAll }) {
  return (
    <div className="bg-slate-100/90 border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-800 mr-1.5">Demo Mode (Client-Side Storage):</span>
          <span>
            Subscriptions are currently simulated and stored in browser memory & local storage.
            FastAPI + SQLite backend integration is scheduled for Phase 2.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          type="button"
          onClick={onResetDemo}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium transition-colors shadow-xs"
          title="Restore standard sample subscriptions"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Reset Sample Data</span>
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md text-[11px] font-medium transition-colors"
          title="Test empty states"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
