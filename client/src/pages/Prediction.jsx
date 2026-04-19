import React, { useState } from 'react';
import axios from 'axios';
import {
    Loader2, CheckCircle2, TrendingUp, Info, MapPin,
    Ruler, Car, Briefcase, Layers, ChevronRight,
    ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { toINR, fullINR, compactINR } from '../utils/currency';

/* â”€â”€â”€ Multiplier tables (mirrors backend) â”€â”€â”€ */
const PROPERTY_TYPE_MULT = { Apartment: 1.00, House: 1.12, Villa: 1.35, Penthouse: 1.55 };
const FURNISHING_MULT    = { Unfurnished: 0.92, 'Semi-furnished': 1.00, Furnished: 1.10 };
const floorMult = (n) => 1 + Math.max(0, parseInt(n, 10) - 1) * 0.035;

const adjLabel = (mult) => {
    const pct = ((mult - 1) * 100).toFixed(1);
    if (mult > 1) return { text: `+${pct}%`, icon: ArrowUpRight,  cls: 'text-emerald-400' };
    if (mult < 1) return { text: `${pct}%`,  icon: ArrowDownRight, cls: 'text-rose-400'   };
    return              { text: 'Base',       icon: Minus,          cls: 'text-slate-400'  };
};

/* â”€â”€â”€ Sub-components â”€â”€â”€ */
const SectionTitle = ({ letter, color, label, note }) => (
    <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 font-bold text-base text-white">
            <span className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center text-xs font-black`}>{letter}</span>
            <span className="flex items-center gap-2">{label}</span>
        </h2>
        {note && <span className="text-[10px] font-black uppercase tracking-wide text-amber-400">{note}</span>}
    </div>
);

const Field = ({ label, name, value, onChange, placeholder, textMuted }) => (
    <div className="space-y-2">
        <label className={`block text-xs font-black uppercase tracking-widest ${textMuted}`}>{label}</label>
        <input type="number" name={name} value={value} onChange={onChange} placeholder={placeholder} required className="field" />
    </div>
);

const MultiplierBadge = ({ mult, note }) => {
    const adj = adjLabel(mult);
    return (
        <div className={`flex items-center gap-1.5 text-xs font-black ${adj.cls}`}>
            <adj.icon size={12} /> {adj.text} price adjustment
            {note && <span className="text-slate-500 font-medium ml-1">â€” {note}</span>}
        </div>
    );
};

const BreakdownRow = ({ label, value, highlight, textHead, rowBg }) => {
    const isPos = value?.startsWith('+') || value?.startsWith('â‚¹');
    const isNeg = value?.startsWith('-');
    const valColor = highlight ? (isNeg ? 'text-rose-400' : isPos && !value?.startsWith('â‚¹') ? 'text-emerald-400' : 'text-slate-300') : '';
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${rowBg}`}>
            <span className={`font-semibold ${textHead}`}>{label}</span>
            <span className={`font-black ${highlight ? valColor : textHead}`}>{value}</span>
        </div>
    );
};

const SimpleMetaRow = ({ Icon, color, label, value, textHead, rowBg }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${rowBg}`}>
        <div className={`${color} p-2.5 rounded-xl`}><Icon size={16} /></div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`font-bold text-sm truncate max-w-[200px] ${textHead}`}>{value}</p>
        </div>
    </div>
);

/* â”€â”€â”€ Main Component â”€â”€â”€ */
const Prediction = () => {
    const { isDark } = useTheme();

    const [form, setForm] = useState({
        area_sqft: '1500', num_bedrooms: '3', num_bathrooms: '2',
        num_floors: '1', property_age: '5', parking: true,
        location: 'Downtown', furnishing: 'Semi-furnished', property_type: 'Apartment',
    });
    const [loading, setLoading] = useState(false);
    const [result,  setResult]  = useState(null);
    const [error,   setError]   = useState(null);

    const textHead  = isDark ? 'text-white'       : 'text-slate-900';
    const textMuted = isDark ? 'text-slate-400'   : 'text-slate-500';
    const divider   = isDark ? 'border-white/5'   : 'border-slate-200';
    const rowBg     = isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200';

    const livePropMult = PROPERTY_TYPE_MULT[form.property_type] ?? 1;
    const liveFurnMult = FURNISHING_MULT[form.furnishing]       ?? 1;
    const liveFloorMul = floorMult(form.num_floors);
    const liveTotalMul = livePropMult * liveFurnMult * liveFloorMul;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setResult(null);
        try {
            const payload = {
                avg_area_income: 60000 + parseFloat(form.area_sqft) * 5,
                house_age:       parseFloat(form.property_age),
                num_rooms:       parseInt(form.num_bedrooms) + parseInt(form.num_bathrooms) + 1,
                num_bedrooms:    parseInt(form.num_bedrooms),
                num_bathrooms:   parseInt(form.num_bathrooms),
                area_population: form.location === 'Urban' ? 40000 : 25000,
                area_sqft:       parseFloat(form.area_sqft),
                num_floors:      parseInt(form.num_floors),
                parking:         form.parking,
                location:        form.location,
                furnishing:      form.furnishing,
                property_type:   form.property_type,
            };
            const response = await axios.post('http://localhost:5000/api/predict', payload);
            setResult(response.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Backend offline. Check your server.');
        } finally { setLoading(false); }
    };

    const priceINR = result ? toINR(result.prediction) : 0;
    const baseINR  = result ? toINR(result.breakdown?.basePrediction ?? 0) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12">

            {/* Header */}
            <header className="space-y-3 max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-500 flex items-center gap-2">
                    <TrendingUp size={14} /> Predictive Valuation Engine â€” INR
                </p>
                <h1 className={`text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] ${textHead}`}>
                    ESTIMATE HOUSE <span className="text-brand-500">PRICE</span>
                </h1>
                <p className={`text-lg font-medium ${textMuted}`}>
                    Property Type, Furnishing, and Floors directly adjust the final estimate. All prices in <strong className="text-brand-500">Indian Rupees (â‚¹)</strong>.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                {/* â”€â”€ FORM â”€â”€ */}
                <div className="lg:col-span-7">
                    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                        <form onSubmit={handleSubmit}>

                            {/* Section A */}
                            <div className={`p-8 border-b ${divider}`}>
                                <SectionTitle letter="A" color="bg-brand-500/20 text-brand-400" label={<><Ruler size={16} /> Physical Dimensions</>} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                    <Field label="Total Area (sqft)"    name="area_sqft"     value={form.area_sqft}     onChange={handleChange} placeholder="1500" textMuted={textMuted} />
                                    <Field label="Property Age (Years)" name="property_age"  value={form.property_age}  onChange={handleChange} placeholder="5"    textMuted={textMuted} />
                                    <Field label="Bedrooms"             name="num_bedrooms"  value={form.num_bedrooms}  onChange={handleChange} placeholder="3"    textMuted={textMuted} />
                                    <Field label="Bathrooms"            name="num_bathrooms" value={form.num_bathrooms} onChange={handleChange} placeholder="2"    textMuted={textMuted} />
                                </div>
                            </div>

                            {/* Section B â€” Pricing Parameters */}
                            <div className={`p-8 border-b ${divider}`}>
                                <SectionTitle letter="B" color="bg-sky-500/20 text-sky-400" label={<><MapPin size={16} /> Pricing Parameters</>} note="âš¡ Adjusts the final â‚¹ price" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                    {/* Property Type */}
                                    <div className="space-y-2">
                                        <label className={`block text-xs font-black uppercase tracking-widest ${textMuted}`}>Property Type</label>
                                        <select name="property_type" value={form.property_type} onChange={handleChange} className="field">
                                            {Object.entries(PROPERTY_TYPE_MULT).map(([k, v]) => (
                                                <option key={k} value={k}>{k} ({v >= 1 ? '+' : ''}{((v - 1) * 100).toFixed(0)}%)</option>
                                            ))}
                                        </select>
                                        <MultiplierBadge mult={livePropMult} />
                                    </div>

                                    {/* Furnishing */}
                                    <div className="space-y-2">
                                        <label className={`block text-xs font-black uppercase tracking-widest ${textMuted}`}>Furnishing Status</label>
                                        <select name="furnishing" value={form.furnishing} onChange={handleChange} className="field">
                                            {Object.entries(FURNISHING_MULT).map(([k, v]) => (
                                                <option key={k} value={k}>{k} ({v >= 1 ? '+' : ''}{((v - 1) * 100).toFixed(0)}%)</option>
                                            ))}
                                        </select>
                                        <MultiplierBadge mult={liveFurnMult} />
                                    </div>

                                    {/* Floors */}
                                    <div className="space-y-2">
                                        <label className={`block text-xs font-black uppercase tracking-widest ${textMuted}`}>Number of Floors</label>
                                        <input type="number" name="num_floors" min="1" max="20" value={form.num_floors} onChange={handleChange} placeholder="1" className="field" />
                                        <MultiplierBadge mult={liveFloorMul} note="+3.5% per extra floor" />
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className={`block text-xs font-black uppercase tracking-widest ${textMuted}`}>Location Zone</label>
                                        <select name="location" value={form.location} onChange={handleChange} className="field">
                                            <option value="Urban">Urban City Centre</option>
                                            <option value="Suburban">Suburban Residential</option>
                                            <option value="Downtown">Premium Downtown</option>
                                            <option value="Rural">Rural Outskirts</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Combined Multiplier Banner */}
                                <div className={`mt-6 flex items-center justify-between p-5 rounded-2xl border ${rowBg}`}>
                                    <span className={`text-xs font-black uppercase tracking-widest ${textMuted}`}>Combined Price Multiplier</span>
                                    <span className={`text-2xl font-black italic ${liveTotalMul >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        x{liveTotalMul.toFixed(3)}
                                    </span>
                                </div>
                            </div>

                            {/* Section C â€” Submit */}
                            <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <label className="flex items-center gap-4 cursor-pointer select-none">
                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, parking: !p.parking }))}
                                        className={`theme-pill ${form.parking ? 'dark-mode' : 'light-mode'}`}
                                    >
                                        <div className="knob"></div>
                                    </button>
                                    <span className={`flex items-center gap-2 text-sm font-bold ${textHead}`}>
                                        <Car size={16} /> Parking Available
                                    </span>
                                </label>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 text-white font-black rounded-2xl text-lg transition-all hover:shadow-glow active:scale-95"
                                >
                                    {loading
                                        ? <><Loader2 className="animate-spin" size={20} /> Processing...</>
                                        : <><TrendingUp size={20} /> Calculate Value</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* â”€â”€ RESULT PANEL â”€â”€ */}
                <div className="lg:col-span-5 sticky top-24 space-y-6">
                    <AnimatePresence mode="wait">

                        {/* â”€â”€â”€ Success State â”€â”€â”€ */}
                        {result ? (
                            <motion.div key="result"
                                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="glass rounded-3xl overflow-hidden"
                            >
                                {/* Banner */}
                                <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-6 flex items-center gap-4">
                                    <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
                                        <CheckCircle2 size={28} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Valuation Complete</p>
                                        <p className={`font-bold text-sm ${textMuted}`}>Confidence: {(result.accuracy * 100).toFixed(2)}%</p>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    {/* --- PRICE IN INR --- */}
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-1 ${textMuted}`}>
                                            Estimated Market Value
                                        </p>
                                        <p className={`text-5xl font-black tracking-tighter italic ${textHead}`}>
                                            {compactINR(priceINR)}
                                        </p>
                                        <p className={`text-sm font-semibold mt-1 ${textMuted}`}>
                                            {fullINR(priceINR)}
                                        </p>
                                    </div>

                                    {/* Breakdown */}
                                    {result.breakdown && (
                                        <div className={`space-y-3 pt-4 border-t ${divider}`}>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Price Breakdown</p>
                                            <BreakdownRow label="ML Base Price"
                                                value={compactINR(baseINR)}
                                                textHead={textHead} rowBg={rowBg}
                                            />
                                            <BreakdownRow label={`Property Type — ${result.inputData?.property_type}`}
                                                value={result.breakdown.propertyTypeAdj}
                                                highlight textHead={textHead} rowBg={rowBg}
                                            />
                                            <BreakdownRow label={`Furnishing — ${result.inputData?.furnishing}`}
                                                value={result.breakdown.furnishingAdj}
                                                highlight textHead={textHead} rowBg={rowBg}
                                            />
                                            <BreakdownRow label={`Floors — ${result.inputData?.num_floors} floor(s)`}
                                                value={result.breakdown.floorsAdj}
                                                highlight textHead={textHead} rowBg={rowBg}
                                            />
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className={`space-y-3 pt-4 border-t ${divider}`}>
                                        <SimpleMetaRow Icon={Layers}    color="text-brand-400 bg-brand-500/10" label="Algorithm" value={result.modelUsed}                            textHead={textHead} rowBg={rowBg} />
                                        <SimpleMetaRow Icon={Briefcase} color="text-amber-400 bg-amber-500/10" label="Model R2"  value={`${(result.accuracy * 100).toFixed(2)}%`}    textHead={textHead} rowBg={rowBg} />
                                    </div>

                                    <button className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-bold text-sm transition-all
                                        ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-black/5'}`}
                                    >
                                        Download Fact Sheet <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>

                        ) : error ? (
                        /* â”€â”€â”€ Error State â”€â”€â”€ */
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="glass rounded-3xl p-8 border border-rose-500/20 bg-rose-500/5 text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <Info size={32} className="text-rose-400" />
                                </div>
                                <h3 className={`text-xl font-black ${textHead}`}>Engine Error</h3>
                                <p className={`text-sm ${textMuted}`}>{error}</p>
                            </motion.div>

                        ) : (
                        /* â”€â”€â”€ Idle State with Live Preview â”€â”€â”€ */
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`glass rounded-3xl flex flex-col items-center justify-center text-center p-10 border-dashed border-2 ${isDark ? 'border-white/10' : 'border-slate-300'}`}
                                style={{ minHeight: '560px' }}
                            >
                                {/* Live multiplier preview */}
                                <div className={`w-full mb-8 p-5 rounded-2xl border ${rowBg}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${textMuted}`}>Live Adjustment Preview</p>
                                    <div className="space-y-2">
                                        {[
                                            ['Property',     form.property_type, livePropMult],
                                            ['Furnishing',   form.furnishing,    liveFurnMult],
                                            [`${form.num_floors} Floor(s)`, '',  liveFloorMul],
                                        ].map(([label, sub, mult]) => {
                                            const adj = adjLabel(mult);
                                            return (
                                                <div key={label} className="flex items-center justify-between text-sm">
                                                    <span className={`font-semibold ${textMuted}`}>
                                                        {label} {sub && <span className="opacity-60">({sub})</span>}
                                                    </span>
                                                    <span className={`flex items-center gap-1 font-black ${adj.cls}`}>
                                                        <adj.icon size={14} /> {adj.text}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div className={`flex items-center justify-between text-sm pt-3 mt-1 border-t ${divider}`}>
                                            <span className={`font-black text-xs uppercase tracking-widest ${textMuted}`}>Combined</span>
                                            <span className={`font-black italic text-xl ${liveTotalMul >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                x{liveTotalMul.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <TrendingUp size={72} className={isDark ? 'text-slate-800' : 'text-slate-300'} />
                                    <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full"></div>
                                </div>
                                <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Awaiting Input</h3>
                                <p className={`text-sm font-medium max-w-[220px] ${textMuted}`}>
                                    Submit the form to generate an AI-powered valuation in Indian Rupees.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Prediction;
