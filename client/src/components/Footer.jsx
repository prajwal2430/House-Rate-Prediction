import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
    const { isDark } = useTheme();

    return (
        <footer className={`w-full border-t mt-20 transition-all duration-300
            ${isDark ? 'border-white/5 bg-slate-950/60' : 'border-slate-200 bg-white/60'}`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                    {/* Brand Block */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-600 p-2 rounded-xl">
                                <Shield className="text-white" size={18} />
                            </div>
                            <span className="font-black tracking-tighter text-lg">
                                <span className={isDark ? 'text-white' : 'text-slate-900'}>SMART</span>
                                <span className="text-brand-500">HOUSE</span>
                            </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Professional-grade house price valuation powered by multi-algorithm ML and a full MERN stack.
                        </p>
                    </div>

                    {/* Technology Block */}
                    <div className="space-y-4">
                        <h4 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tech Stack</h4>
                        <ul className={`space-y-2 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {['React.js + Vite', 'Node.js + Express', 'MongoDB Atlas', 'Python Flask + Scikit-Learn', 'XGBoost / Random Forest'].map(t => (
                                <li key={t} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span> {t}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Block */}
                    <div className="space-y-4">
                        <h4 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Quick Access</h4>
                        <ul className={`space-y-2 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {['Home', 'Predict Property', 'Analytics Dashboard'].map(l => (
                                <li key={l}><a href="#" className="hover:text-brand-500 transition-colors">{l}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t text-xs font-bold uppercase tracking-widest
                    ${isDark ? 'border-white/5 text-slate-600' : 'border-slate-200 text-slate-400'}`}
                >
                    <span>© 2026 SmartHouse AI — All Rights Reserved</span>
                    <span>MERN Stack + Python ML Engine</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
