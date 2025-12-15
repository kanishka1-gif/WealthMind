const User = require('../models/User');

exports.addToPortfolio = async (req, res) => {
  try {
    const { symbol, name, quantity, price } = req.body;
    const totalCost = quantity * price;
    
    const user = await User.findById(req.user.id);
    
    if (user.balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }
    
    const existingStockIndex = user.portfolio.findIndex(item => item.symbol === symbol);
    
    if (existingStockIndex > -1) {
      const existingStock = user.portfolio[existingStockIndex];
      const newTotalQuantity = existingStock.quantity + quantity;
      const newTotalInvested = existingStock.totalInvested + totalCost;
      const newAvgPrice = newTotalInvested / newTotalQuantity;
      
      user.portfolio[existingStockIndex] = {
        ...existingStock,
        quantity: newTotalQuantity,
        avgPrice: newAvgPrice,
        totalInvested: newTotalInvested
      };
    } else {
      user.portfolio.push({
        symbol,
        name,
        quantity,
        avgPrice: price,
        totalInvested: totalCost
      });
    }
    
    user.balance -= totalCost;
    
    user.transactions.push({
      type: 'buy',
      amount: totalCost,
      description: \Bought \ shares of \ at ?\\
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Stock added to portfolio',
      balance: user.balance,
      portfolio: user.portfolio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.sellFromPortfolio = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const totalValue = quantity * price;
    
    const user = await User.findById(req.user.id);
    
    const stockIndex = user.portfolio.findIndex(item => item.symbol === symbol);
    
    if (stockIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found in portfolio'
      });
    }
    
    const stock = user.portfolio[stockIndex];
    
    if (stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: \Insufficient shares. You only have \ shares\
      });
    }
    
    const profitLoss = totalValue - (stock.avgPrice * quantity);
    
    if (stock.quantity === quantity) {
      user.portfolio.splice(stockIndex, 1);
    } else {
      stock.quantity -= quantity;
      stock.totalInvested = stock.avgPrice * stock.quantity;
    }
    
    user.balance += totalValue;
    
    user.transactions.push({
      type: 'sell',
      amount: totalValue,
      description: \Sold \ shares of \ at ?\. P/L: ?\\
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Stock sold successfully',
      balance: user.balance,
      portfolio: user.portfolio,
      profitLoss: profitLoss
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const { symbol, name } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const exists = user.watchlist.some(item => item.symbol === symbol);
    
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Already in watchlist'
      });
    }
    
    user.watchlist.push({
      symbol,
      name
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const index = user.watchlist.findIndex(item => item.symbol === symbol);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Not found in watchlist'
      });
    }
    
    user.watchlist.splice(index, 1);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      portfolio: user.portfolio,
      balance: user.balance,
      totalPortfolioValue: user.portfolio.reduce((total, item) => {
        return total + (item.avgPrice * item.quantity);
      }, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.depositBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    user.balance += amount;
    
    user.transactions.push({
      type: 'deposit',
      amount: amount,
      description: \Deposited ?\\
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: \?\ deposited successfully\,
      balance: user.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.withdrawBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }
    
    user.balance -= amount;
    
    user.transactions.push({
      type: 'withdrawal',
      amount: amount,
      description: \Withdrew ?\\
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: \?\ withdrawn successfully\,
      balance: user.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const user = await User.findById(req.user.id);
    
    const transactions = user.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      transactions: transactions,
      total: user.transactions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
