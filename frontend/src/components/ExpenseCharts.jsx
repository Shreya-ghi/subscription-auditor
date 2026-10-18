import React, { useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { PieChart as PieIcon, BarChart3, Info } from 'lucide-react'
import { formatCurrency, calculateMonthlyCost } from '../utils/calculations'

const CHART_COLORS = [
  '#4f46e5', // indigo-600
  '#0284c7', // sky-600
  '#7c3aed', // violet-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#0891b2', // cyan-600
  '#64748b', // slate-500
  '#2563eb', // blue-600
  '#c026d3', // fuchsia-600
]

// Custom Tooltip for Donut Chart declared outside render
function CustomDonutTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-700">
        <p className="font-semibold">{data.name}</p>
        <p className="text-slate-300 mt-0.5">
          {formatCurrency(data.monthlySpend)}/mo ({data.percentage}%)
        </p>
        <p className="text-[11px] text-slate-400">
          {data.count} active subscription{data.count === 1 ? '' : 's'}
        </p>
      </div>
    )
  }
  return null
}

// Custom Tooltip for Bar Chart declared outside render
function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-700">
        <p className="font-semibold">{data.fullName}</p>
        <p className="text-slate-300 mt-0.5">
          Monthly Cost: {formatCurrency(data.monthlyCost)}/mo
        </p>
        <p className="text-[11px] text-slate-400">Category: {data.category}</p>
      </div>
    )
  }
  return null
}

export default function ExpenseCharts({
  categoryData = [],
  subscriptions = [],
  currency = '$',
}) {
  const [chartType, setChartType] = useState('donut') // 'donut' | 'bars'

  // Top 5 individual expenses
  const topExpenses = [...subscriptions]
    .filter((s) => s.status === 'active')
    .sort((a, b) => calculateMonthlyCost(b) - calculateMonthlyCost(a))
    .slice(0, 5)
    .map((s) => ({
      name: s.name.length > 14 ? `${s.name.slice(0, 12)}...` : s.name,
      fullName: s.name,
      monthlyCost: Number(calculateMonthlyCost(s).toFixed(2)),
      category: s.category,
    }))

  const totalMonthlySpend = categoryData.reduce((sum, c) => sum + c.monthlySpend, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Category Expense Distribution</h3>
          <p className="text-[11px] text-slate-500">
            Monthly recurring costs apportioned by service category
          </p>
        </div>

        {/* Toggle between Donut & Top 5 Bars */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              chartType === 'donut'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bars')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              chartType === 'bars'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Top Services</span>
          </button>
        </div>
      </div>

      {categoryData.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No active subscription data to chart yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
          {/* Recharts Container */}
          <div className="lg:col-span-7 h-64 sm:h-72 w-full">
            {chartType === 'donut' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="monthlySpend"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="monthlyCost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown legend list */}
          <div className="lg:col-span-5 space-y-2 max-h-72 overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-slate-700 block pb-1 border-b border-slate-100">
              Breakdown ({formatCurrency(totalMonthlySpend, currency)}/mo total)
            </span>
            {categoryData.map((cat, idx) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 px-1.5 rounded transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(cat.monthlySpend, currency)}
                  </span>
                  <span className="text-[11px] text-slate-400 w-8 text-right font-medium">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
