const express = require('express');
const router = express.Router();
const { addAccount, getAccounts, getTotalBalance } = require('../controllers/accountController');
const requireAuth = require('../middleware/requireAuth');

// Apply the authentication middleware to all routes
router.use(requireAuth);

router.post('/', addAccount);
router.get('/', getAccounts);
router.get('/totalBalance', requireAuth, getTotalBalance);

module.exports = router;
