const axios = require('axios');
const Prediction = require('../models/Prediction');

/**
 * ─────────────────────────────────────────────────────────────────
 *  MULTIPLIER TABLES
 *  These factors adjust the raw ML prediction to reflect real-world
 *  pricing differences driven by property type, furnishing, and floors.
 * ─────────────────────────────────────────────────────────────────
 */
const PROPERTY_TYPE_MULTIPLIER = {
    Apartment:  1.00,   // Base
    House:      1.12,   // Detached houses command ~12% premium
    Villa:      1.35,   // Luxury villas command ~35% premium
    Penthouse:  1.55,   // Sky penthouses command ~55% premium
};

const FURNISHING_MULTIPLIER = {
    Unfurnished:     0.92,  // 8% discount — buyer must furnish
    'Semi-furnished': 1.00, // Base
    Furnished:       1.10,  // 10% premium — move-in ready
};

const FLOOR_ADJUSTMENT = (numFloors) => {
    // Each additional floor beyond 1 adds 3.5% to the base price
    const extra = Math.max(0, parseInt(numFloors, 10) - 1);
    return 1 + extra * 0.035;
};

// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Make a prediction
 * @route   POST /api/predict
 */
exports.makePrediction = async (req, res) => {
    try {
        const inputData = req.body;

        // 1️⃣  Get base prediction from the Python ML service
        const mlResponse = await axios.post('http://localhost:5001/predict', inputData);
        const { prediction: basePrediction, model_info } = mlResponse.data;

        // 2️⃣  Apply categorical & numeric multipliers
        const propertyMultiplier = PROPERTY_TYPE_MULTIPLIER[inputData.property_type] ?? 1.00;
        const furnishMultiplier  = FURNISHING_MULTIPLIER[inputData.furnishing]       ?? 1.00;
        const floorMultiplier    = FLOOR_ADJUSTMENT(inputData.num_floors             ?? 1);

        const finalPrediction = basePrediction
            * propertyMultiplier
            * furnishMultiplier
            * floorMultiplier;

        // 3️⃣  Build a human-readable breakdown for the frontend
        const breakdown = {
            basePrediction: Math.round(basePrediction),
            propertyTypeAdj: `${((propertyMultiplier - 1) * 100).toFixed(1)}%`,
            furnishingAdj:   `${((furnishMultiplier  - 1) * 100).toFixed(1)}%`,
            floorsAdj:       `${((floorMultiplier    - 1) * 100).toFixed(1)}%`,
            totalMultiplier: (propertyMultiplier * furnishMultiplier * floorMultiplier).toFixed(4),
        };

        // 4️⃣  Persist to MongoDB
        const newPrediction = await Prediction.create({
            inputData,
            prediction: Math.round(finalPrediction),
            modelUsed:  model_info.name,
            accuracy:   model_info.r2_score,
            breakdown,
        });

        res.status(200).json({ success: true, data: newPrediction });

    } catch (error) {
        console.error('Prediction Error:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};

/**
 * @desc    Get prediction history
 * @route   GET /api/history
 */
exports.getHistory = async (req, res) => {
    try {
        const history = await Prediction.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * @desc    Get model stats from ML service
 * @route   GET /api/stats
 */
exports.getStats = async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5001/stats');
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Could not reach ML service' });
    }
};
