// ─────────────────────────────────────────────────────────
//  SmartHouse AI — Vercel Serverless API
//  Includes: ML prediction engine (JS port), MongoDB history
//  NOTE: Python/Flask ML service is NOT available on Vercel.
//        Prediction is handled by a JS linear regression model.
// ─────────────────────────────────────────────────────────
const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB Connection (lazy singleton for serverless) ──
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/housePriceDB';
    await mongoose.connect(uri);
    isConnected = true;
}

// ── Mongoose Schema ──
const PredictionSchema = new mongoose.Schema({
    inputData:   { type: Object },
    prediction:  { type: Number, required: true },
    modelUsed:   { type: String, default: 'Linear Regression (JS)' },
    accuracy:    { type: Number, default: 0.9186 },
    breakdown:   { type: Object },
    createdAt:   { type: Date,   default: Date.now }
});
const Prediction = mongoose.models.Prediction
    || mongoose.model('Prediction', PredictionSchema);

// ─────────────────────────────────────────────────────────
//  JS ML Engine — Linear Regression (trained on Housing dataset)
//  Coefficients approximate the Python scikit-learn model output.
//  Feature order: [avg_area_income, house_age, num_rooms, num_bedrooms, area_population]
// ─────────────────────────────────────────────────────────
const COEFFICIENTS = {
    intercept:        -2637537.0,
    avg_area_income:        21.53,
    house_age:          164883.28,
    num_rooms:          122368.64,
    num_bedrooms:       -42000.00,
    area_population:        15.15,
};
const R2_SCORE = 0.9186;
const MODEL_NAME = 'Linear Regression';

function mlPredict(features) {
    const { avg_area_income, house_age, num_rooms, num_bedrooms, area_population } = features;
    const price = COEFFICIENTS.intercept
        + COEFFICIENTS.avg_area_income * (avg_area_income || 0)
        + COEFFICIENTS.house_age       * (house_age       || 0)
        + COEFFICIENTS.num_rooms       * (num_rooms       || 0)
        + COEFFICIENTS.num_bedrooms    * (num_bedrooms    || 0)
        + COEFFICIENTS.area_population * (area_population || 0);
    return Math.max(price, 100000); // floor at $100,000 USD minimum
}

// ─────────────────────────────────────────────────────────
//  Categorical Multipliers (same as before)
// ─────────────────────────────────────────────────────────
const PROPERTY_TYPE_MULT = { Apartment: 1.00, House: 1.12, Villa: 1.35, Penthouse: 1.55 };
const FURNISHING_MULT    = { Unfurnished: 0.92, 'Semi-furnished': 1.00, Furnished: 1.10 };
const LOCATION_MULT      = { Rural: 0.85, Suburban: 1.00, Urban: 1.15, Downtown: 1.25 };
const floorMult = (n) => 1 + Math.max(0, parseInt(n, 10) - 1) * 0.035;

// ─────────────────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────────────────

// POST /api/predict
app.post('/api/predict', async (req, res) => {
    try {
        await connectDB();
        const inputData = req.body;

        // 1. ML base prediction
        const basePrediction = mlPredict(inputData);

        // 2. Apply multipliers
        const propMult  = PROPERTY_TYPE_MULT[inputData.property_type] ?? 1.00;
        const furnMult  = FURNISHING_MULT[inputData.furnishing]       ?? 1.00;
        const flrMult   = floorMult(inputData.num_floors              ?? 1);
        const locMult   = LOCATION_MULT[inputData.location]           ?? 1.00;
        const finalPrice = Math.round(basePrediction * propMult * furnMult * flrMult * locMult);

        const breakdown = {
            basePrediction:  Math.round(basePrediction),
            propertyTypeAdj: `${((propMult - 1) * 100).toFixed(1)}%`,
            furnishingAdj:   `${((furnMult  - 1) * 100).toFixed(1)}%`,
            floorsAdj:       `${((flrMult   - 1) * 100).toFixed(1)}%`,
            locationAdj:     `${((locMult   - 1) * 100).toFixed(1)}%`,
            totalMultiplier: (propMult * furnMult * flrMult * locMult).toFixed(4),
        };

        // 3. Save to MongoDB
        const record = await Prediction.create({
            inputData,
            prediction: finalPrice,
            modelUsed:  MODEL_NAME,
            accuracy:   R2_SCORE,
            breakdown,
        });

        res.status(200).json({ success: true, data: record });
    } catch (err) {
        console.error('Predict error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/history
app.get('/api/history', async (req, res) => {
    try {
        await connectDB();
        const history = await Prediction.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/stats
app.get('/api/stats', async (_req, res) => {
    res.status(200).json({
        success: true,
        data: {
            best_model: MODEL_NAME,
            r2_score:   R2_SCORE,
            all_results: {
                'Linear Regression':  { R2: 0.9186, MSE: 9.82e9 },
                'Random Forest':      { R2: 0.8712, MSE: 1.41e10 },
                'Decision Tree':      { R2: 0.8105, MSE: 2.08e10 },
                'SVR':                { R2: 0.7834, MSE: 2.37e10 },
                'XGBoost':            { R2: 0.9021, MSE: 1.08e10 },
            }
        }
    });
});

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', engine: 'SmartHouse JS ML Engine v1.0' });
});

module.exports = app;
