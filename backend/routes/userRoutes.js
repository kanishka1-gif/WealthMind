const express = require('express');
const router = express.Router();
const {
  addToPortfolio,
  sellFromPortfolio,
  addToWatchlist,
  removeFromWatchlist,
  getPortfolio,
  getWatchlist,
  depositBalance,
  withdrawBalance,
  getTransactions
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Portfolio routes
router.post('/portfolio/add', protect, addToPortfolio);
router.post('/portfolio/sell', protect, sellFromPortfolio);
router.get('/portfolio', protect, getPortfolio);

// Watchlist routes
router.post('/watchlist/add', protect, addToWatchlist);
router.delete('/watchlist/remove', protect, removeFromWatchlist);
router.get('/watchlist', protect, getWatchlist);

// Balance routes
router.post('/balance/deposit', protect, depositBalance);
router.post('/balance/withdraw', protect, withdrawBalance);

// Transaction routes
router.get('/transactions', protect, getTransactions);

module.exports = router;
