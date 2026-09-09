const express = require('express');
const { getDashboardData, createNetworkSchool } = require('../controllers/networkController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { networkMiddleware } = require('../middlewares/networkMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(networkMiddleware);

router.get('/dashboard', getDashboardData);
router.post('/institutions', createNetworkSchool); 

module.exports = router;