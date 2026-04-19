import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Home, BarChart2, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { isDark, toggleTheme } = useTheme();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap
        ${isActive
            ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
            : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
        }`;

    return (
        <header className={`w-full border-b sticky top-0 z-50 backdrop-blur-xl transition-all duration-300
            ${isDark
                ? 'bg-slate-950/80 border-white/5'
                : 'bg-white/80 border-slate-200'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-6">

                {/* ── Logo ── */}
                <NavLink to="/" className="flex items-center gap-3 group shrink-0">
                    <div className="bg-brand-600 p-2.5 rounded-xl shadow-glow group-hover:scale-110 transition-transform duration-300">
                        <Shield className="text-white" size={20} />
                    </div>
                    <div className="hidden sm:block leading-none">
                        <span className="block text-lg font-black tracking-tighter">
                            <span className={isDark ? 'text-white' : 'text-slate-900'}>SMART</span>
                            <span className="text-brand-500">HOUSE</span>
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-slate-500">
                            AI Valuation Engine
                        </span>
                    </div>
                </NavLink>

                {/* ── Navigation ── */}
                <nav className={`flex items-center gap-1 p-1 rounded-2xl border transition-all duration-300
                    ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}
                >
                    <NavLink to="/" end className={linkClass}>
                        <Home size={16} />
                        <span className="hidden md:inline">Home</span>
                    </NavLink>
                    <NavLink to="/prediction" className={linkClass}>
                        <BarChart2 size={16} />
                        <span className="hidden md:inline">Predict</span>
                    </NavLink>
                    <NavLink to="/dashboard" className={linkClass}>
                        <LayoutDashboard size={16} />
                        <span className="hidden md:inline">Dashboard</span>
                    </NavLink>
                </nav>

                {/* ── Right Controls ── */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* DB Status Pill */}
                    <div className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all
                        ${isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-black/5 border-black/5 text-slate-500'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
                        Connected
                    </div>

                    {/* ── Theme Toggle ── */}
                    <div className="flex items-center gap-2">
                        <Sun size={14} className={`transition-colors ${isDark ? 'text-slate-600' : 'text-amber-500'}`} />
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className={`theme-pill ${isDark ? 'dark-mode' : 'light-mode'}`}
                        >
                            <div className="knob"></div>
                        </button>
                        <Moon size={14} className={`transition-colors ${isDark ? 'text-indigo-400' : 'text-slate-400'}`} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
