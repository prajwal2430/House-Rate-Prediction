import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Zap, Clock, HistoryIcon, Target, ArrowUpRight, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { toINR, compactINR, fullINR } from '../utils/currency';

const Dashboard = () => {
    const { isDark } = useTheme();
    const [history, setHistory] = useState([]);
    const [stats, setStats]   = useState(null);
    const [loading, setLoading] = useState(true);

    const textHead  = isDark ? 'text-white'     : 'text-slate-900';
    const textMuted = isDark ? 'text-slate-400'  : 'text-slate-500';
    const sectionBorder = isDark ? 'border-white/5' : 'border-slate-200';
    const rowBg  = isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.03] border-slate-200';
    const axisColor   = isDark ? '#475569' : '#94a3b8';
    const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const tooltipStyle = {
        background: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '16px',
        color: isDark ? '#fff' : '#0f172a',
        fontWeight: 600,
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [histRes, statRes] = await Promise.all([
                axios.get('/api/history'),
                axios.get('/api/stats')
            ]);
            setHistory(histRes.data.data);
            setStats(statRes.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const priceAreaData = history.map(item => ({
        price: item.prediction,
        area:  item.inputData?.area_sqft || 0
    })).sort((a, b) => a.area - b.area);

    const modelData = stats
        ? Object.entries(stats.all_results).map(([name, val]) => ({
            label: name.replace(' Regressor', '').replace('Support Vector', 'SVR'),
            score: parseFloat((val.R2 * 100).toFixed(2))
          }))
        : [];

    const kpis = [
        { label: 'Best Algorithm',  value: stats?.best_model || '—',               icon: Target,      color: 'text-brand-400',   bg: 'bg-brand-500/10' },
        { label: 'R² Accuracy',     value: stats ? `${(stats.r2_score*100).toFixed(2)}%` : '—', icon: Zap, color: 'text-amber-400',   bg: 'bg-amber-500/10' },
        { label: 'Training Records',value: '9,097',                                 icon: TrendingUp,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Logs Stored',     value: history.length,                          icon: Clock,       color: 'text-rose-400',    bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-500 flex items-center gap-2">
                        <Activity size={14} /> Analytics Suite
                    </p>
                    <h1 className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${textHead}`}>
                        SYSTEM <span className="text-brand-500">DASHBOARD</span>
                    </h1>
                </div>
                <button
                    onClick={fetchData}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all hover:-translate-y-1
                        ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-black/5'}`}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="glass rounded-3xl p-6 space-y-4 hover:-translate-y-1 transition-transform"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`${bg} ${color} p-3 rounded-2xl`}><Icon size={22} /></div>
                            <ArrowUpRight size={16} className={textMuted} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textMuted}`}>{label}</p>
                            <p className={`text-2xl font-black tracking-tight ${textHead}`}>{value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Area Chart */}
                <div className="glass rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-bold text-lg ${textHead}`}>Price vs. Area Correlation</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>INR / SQFT</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={priceAreaData}>
                                <defs>
                                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="area" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => compactINR(toINR(v))} />
                                <Tooltip contentStyle={tooltipStyle} formatter={v => [compactINR(toINR(v)), 'Estimated Price (INR)']} />
                                <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="glass rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-bold text-lg ${textHead}`}>Algorithm Performance</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>R² SCORE %</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={modelData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="label" stroke={axisColor} fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'R² Score']} />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                    {modelData.map((entry, idx) => (
                                        <Cell key={idx}
                                            fill={idx === 0
                                                ? '#6366f1'
                                                : isDark ? '#1e293b' : '#e2e8f0'}
                                            stroke={idx !== 0 ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)') : 'none'}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── History Table ── */}
            <div className="glass rounded-3xl overflow-hidden">
                {/* Table Header */}
                <div className={`flex items-center justify-between px-8 py-6 border-b ${sectionBorder}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-500/10 p-3 rounded-2xl"><TrendingUp className="text-brand-400" size={20} /></div>
                        <div>
                            <h3 className={`font-bold text-lg ${textHead}`}>Prediction Log</h3>
                            <p className={`text-xs font-semibold ${textMuted}`}>Most recent valuations stored in MongoDB</p>
                        </div>
                    </div>
                    <button className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all
                        ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-300 text-slate-500 hover:bg-black/5'}`}
                    >
                        Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest border-b ${sectionBorder}`}>
                                {['Timestamp', 'Property Details', 'Algorithm Used', 'Estimated Price'].map(col => (
                                    <th key={col} className={`px-8 py-4 ${textMuted}`}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, idx) => (
                                <tr key={idx} className={`group hover:bg-white/5 transition-colors border-b last:border-0 ${sectionBorder}`}>
                                    <td className="px-8 py-5">
                                        <span className={`font-mono text-sm ${textMuted}`}>
                                            {new Date(item.createdAt).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className={`font-bold text-sm ${textHead}`}>{item.inputData?.area_sqft || '—'} sqft</p>
                                        <p className={`text-xs font-semibold ${textMuted}`}>{item.inputData?.num_bedrooms} bed • {item.inputData?.location}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex px-3 py-1 bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-500/20">
                                            {item.modelUsed}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-lg font-black italic text-brand-500">
                                            {compactINR(toINR(item.prediction))}
                                        </p>
                                        <p className={`text-xs font-semibold mt-0.5 ${textMuted}`}>
                                            {fullINR(toINR(item.prediction))}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={`text-center py-16 text-sm font-semibold ${textMuted}`}>
                                        No records yet — run your first prediction to see history.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
