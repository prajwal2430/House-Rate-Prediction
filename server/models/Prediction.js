const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    inputData: {
        avg_area_income: Number,
        house_age:       Number,
        num_rooms:       Number,
        num_bedrooms:    Number,
        num_bathrooms:   Number,
        num_floors:      Number,
        area_population: Number,
        area_sqft:       Number,
        parking:         Boolean,
        location:        String,
        furnishing:      String,   // Furnished | Semi-furnished | Unfurnished
        property_type:   String,   // Apartment | House | Villa | Penthouse
    },
    prediction:  { type: Number, required: true },
    modelUsed:   { type: String },
    accuracy:    { type: Number },

    // Price breakdown driven by multipliers
    breakdown: {
        basePrediction:  Number,
        propertyTypeAdj: String,
        furnishingAdj:   String,
        floorsAdj:       String,
        totalMultiplier: String,
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
