import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Cpu, Database, Globe, Zap, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
    const { isDark } = useTheme();

    const card = `glass rounded-3xl p-8 transition-all duration-300 ${
        isDark ? 'hover:bg-white/8' : 'hover:bg-black/5'
    }`;

    const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textHead  = isDark ? 'text-white'     : 'text-slate-900';

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-32">

            {/* â”€â”€ Hero â”€â”€ */}
            <section className="flex flex-col lg:flex-row items-center gap-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="flex-1 space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-black uppercase tracking-widest">
                        <Activity size={12} className="animate-pulse" /> Neural ML Engine â€” Active
                    </div>

                    <h1 className={`text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter ${textHead}`}>
                        REAL ESTATE <br />
                        <span className="text-brand-500">INTELLIGENCE</span><br />
                        <span className={`text-5xl lg:text-6xl ${textMuted} font-bold not-italic`}>AT YOUR FINGERTIPS.</span>
                    </h1>

                    <p className={`text-xl font-medium leading-relaxed max-w-xl ${textMuted}`}>
                        Instantly estimate property values using a high-accuracy ML engine trained on thousands of real-world data points. No guesswork â€” pure data science.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/prediction"
                            className="flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl transition-all hover:-translate-y-1 hover:shadow-glow-lg"
                        >
                            Start Free Valuation <ArrowRight size={20} />
                        </Link>
                        <Link to="/dashboard"
                            className={`flex items-center gap-3 px-8 py-4 font-black rounded-2xl border transition-all hover:-translate-y-1
                            ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-black/5'}`}
                        >
                            View Analytics
                        </Link>
                    </div>

                    <div className={`pt-8 grid grid-cols-2 gap-8 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                        {[['Â±1.2%', 'Prediction Variance'], ['9,000+', 'Dataset Records']].map(([val, label]) => (
                            <div key={label}>
                                <p className={`text-4xl font-black italic ${textHead}`}>{val}</p>
                                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${textMuted}`}>{label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                    className="flex-1 relative group"
                >
                    <div className="glass p-4 rounded-[2.5rem] rotate-1 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                            alt="Modern property"
                            className="rounded-[2rem] w-full h-[480px] object-cover"
                        />
                    </div>
                    {/* Float card */}
                    <div className="absolute -bottom-8 -left-8 glass rounded-2xl px-8 py-6 shadow-xl">
                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">Assets Analysed</p>
                        <p className={`text-3xl font-black italic ${textHead}`}>₹35,000 Cr<span className={`text-base font-medium ml-1 ${textMuted}`}>tracked</span></p>
                    </div>
                    {/* Glow */}
                    <div className="absolute inset-0 bg-brand-500/10 blur-[100px] rounded-full -z-10 group-hover:bg-brand-500/15 transition-all duration-700"></div>
                </motion.div>
            </section>

            {/* â”€â”€ Tech Strip â”€â”€ */}
            <section className={`flex flex-wrap justify-between items-center gap-10 py-12 border-y transition-all
                ${isDark ? 'border-white/5' : 'border-slate-200'}`}
            >
                {[{ Icon: Cpu, name: 'Scikit-Learn' }, { Icon: Database, name: 'MongoDB Atlas' }, { Icon: Globe, name: 'REST API' }, { Icon: Zap, name: 'XGBoost' }].map(({ Icon, name }) => (
                    <div key={name} className={`flex items-center gap-3 group opacity-40 hover:opacity-100 transition-all ${textMuted}`}>
                        <Icon size={24} className="group-hover:text-brand-500 transition-colors" />
                        <span className="font-black text-lg tracking-tighter uppercase">{name}</span>
                    </div>
                ))}
            </section>

            {/* â”€â”€ Features â”€â”€ */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { Icon: Cpu,      colour: 'text-brand-400',   bg: 'bg-brand-500/10',   title: 'Multi-Algorithm Engine',   desc: '5 algorithms run simultaneously. The highest-accuracy model is automatically selected to generate your estimate.' },
                    { Icon: Shield,   colour: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Confidence Certification',  desc: 'Every prediction includes an RÂ² confidence index and full model metadata for absolute transparency.' },
                    { Icon: Database, colour: 'text-sky-400',     bg: 'bg-sky-500/10',     title: 'Persistent History Log',   desc: 'All valuations are stored in MongoDB, giving you a structured timeline to track market shifts over time.' }
                ].map(({ Icon, colour, bg, title, desc }) => (
                    <div key={title} className={`${card} group space-y-5`}>
                        <div className={`${bg} ${colour} w-14 h-14 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform`}>
                            <Icon size={28} />
                        </div>
                        <h3 className={`text-xl font-bold ${textHead}`}>{title}</h3>
                        <p className={`${textMuted} leading-relaxed`}>{desc}</p>
                        <span className={`flex items-center gap-1 text-sm font-bold text-brand-500 cursor-pointer group-hover:gap-3 transition-all`}>
                            Learn more <ArrowUpRight size={14} />
                        </span>
                    </div>
                ))}
            </section>

            {/* â”€â”€ CTA â”€â”€ */}
            <section>
                <motion.div
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="glass rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden border border-brand-500/15"
                >
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 blur-[150px] -mr-64 -mt-64 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-600/8 blur-[120px] -ml-32 -mb-32 pointer-events-none"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${textHead}`}>
                            JOIN THE NEW STANDARD <br />
                            <span className="text-brand-500 italic">OF REAL ESTATE.</span>
                        </h2>
                        <p className={`text-xl max-w-xl mx-auto font-medium ${textMuted}`}>
                            Trusted by developers, brokers and institutions for data-backed certainty.
                        </p>
                        <Link to="/prediction"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-lg transition-all hover:shadow-glow-lg"
                        >
                            Deploy Engine <ArrowRight size={22} />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
