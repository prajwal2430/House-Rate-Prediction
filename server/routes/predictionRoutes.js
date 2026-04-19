const express = require('express');
const router = express.Router();
const { makePrediction, getHistory, getStats } = require('../controllers/predictionController');

router.post('/predict', makePrediction);
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
