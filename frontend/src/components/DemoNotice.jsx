import React from 'react'
import { RotateCcw, Database, RefreshCw, AlertCircle } from 'lucide-react'

export default function DemoNotice({
  backendConnected = true,
  isSyncing = false,
  onResetDemo,
  onClearAll,
  onRefresh,
}) {
  return (
    <div className="bg-slate-100/90 border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-md shrink-0 ${backendConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {backendConnected ? <Database className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </div>
        <div>
          <span className="font-semibold text-slate-800 mr-1.5">
            {backendConnected ? 'Backend Connected:' : 'Backend Status:'}
          </span>
          <span>
            {backendConnected
              ? 'FastAPI & SQLite database (http://127.0.0.1:8000). Data is persisted in backend/subscriptions.db.'
              : 'Connecting to FastAPI backend at http://127.0.0.1:8000...'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium transition-colors shadow-xs disabled:opacity-50"
            title="Refresh records from backend"
          >
            <RefreshCw className={`w-3 h-3 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}

        {onResetDemo && (
          <button
            type="button"
            onClick={onResetDemo}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium transition-colors shadow-xs disabled:opacity-50"
            title="Populate backend database with sample subscriptions"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Seed Sample Data</span>
          </button>
        )}

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            disabled={isSyncing}
            className="px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50"
            title="Clear all subscriptions in database"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}
