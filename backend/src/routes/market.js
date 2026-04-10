const { Router } = require('express');
const { getMarketPrices, getMarketChart } = require('../controllers/marketController');

const router = Router();

router.get('/prices', getMarketPrices);
router.get('/chart/:coinId', getMarketChart);

module.exports = router;
