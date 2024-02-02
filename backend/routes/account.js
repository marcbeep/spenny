const express = require('express');
const { addAccount, getAccounts, getTotalBalance } = require('../controllers/accountController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

router.post('/', addAccount);
router.get('/', getAccounts);
router.get('/totalBalance', requireAuth, getTotalBalance);

module.exports = router;
