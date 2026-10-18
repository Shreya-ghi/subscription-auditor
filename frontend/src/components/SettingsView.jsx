import React, { useRef } from 'react'
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Cpu,
} from 'lucide-react'

export default function SettingsView({
  currency,
  setCurrency,
  renewalThreshold = 7,
  setRenewalThreshold,
  subscriptions,
  onResetDemo,
  onImportData,
}) {
  const fileInputRef = useRef(null)

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subscriptions, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `subscriptions-backup-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (Array.isArray(parsed)) {
          onImportData(parsed)
          alert(`Successfully imported ${parsed.length} subscriptions!`)
        } else {
          alert('Invalid file format: JSON must contain an array of subscriptions.')
        }
      } catch (err) {
        console.error('Failed to parse JSON file:', err)
        alert('Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* General Preferences */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Settings className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Application Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display Currency Symbol
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:border-indigo-500"
            >
              <option value="$">USD ($) - United States Dollar</option>
              <option value="€">EUR (€) - Euro</option>
              <option value="£">GBP (£) - British Pound</option>
              <option value="₹">INR (₹) - Indian Rupee</option>
              <option value="¥">JPY (¥) - Japanese Yen</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Changes formatting prefix on dashboard metrics and tables.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upcoming Renewal Alert Window
            </label>
            <select
              value={String(renewalThreshold)}
              onChange={(e) => setRenewalThreshold && setRenewalThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:border-indigo-500"
            >
              <option value="3">3 Days (Immediate)</option>
              <option value="7">7 Days (Standard)</option>
              <option value="14">14 Days (Extended)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Subscriptions within this threshold trigger notifications and cards.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Client-Side Data Management</h3>
        </div>

        <p className="text-xs text-slate-600">
          All subscription records are currently stored locally in your browser’s localStorage.
          You can backup your data to a JSON file or restore the default demo configuration at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Planned Architecture Details */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Cpu className="w-4 h-4 text-slate-600" />
          <span>System Architecture & Technology Stack</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
          <div className="p-3 bg-white rounded-lg border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">Frontend (Active)</span>
            <ul className="space-y-0.5 text-slate-500">
              <li>• React 19 + Vite 8</li>
              <li>• Tailwind CSS v4 (@tailwindcss/vite)</li>
              <li>• Recharts 3.x responsive charts</li>
              <li>• Lucide React icons</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200/80">
            <span className="font-semibold text-slate-900 block mb-1">Backend (Phase 2 Planned)</span>
            <ul className="space-y-0.5 text-slate-500">
              <li>• Python 3.13 + FastAPI</li>
              <li>• SQLite relational database</li>
              <li>• REST API & recurring billing webhooks</li>
              <li>• Automated email renewal reminders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
