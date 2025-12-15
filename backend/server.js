const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this in production!

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MONGODB CONNECTION
mongoose.connect('mongodb://localhost:27017/wealthmind', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ MONGOOSE SCHEMAS
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  cashBalance: { type: Number, default: 100000 }, // Starting cash: ₹1,00,000
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  holdings: [{
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
    totalInvested: { type: Number, required: true },
    sector: String,
    riskLevel: String,
    purchaseDate: { type: Date, default: Date.now }
  }],
  totalInvested: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  totalProfitLoss: { type: Number, default: 0 },
  totalProfitLossPercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  sector: String,
  riskLevel: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'COMPLETED' }
});

// ✅ CREATE MODELS
const User = mongoose.model('User', userSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// ✅ JWT MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'WealthMind Backend Server is running!' });
});

// ✅ REGISTER ENDPOINT
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    
    const { name, email, phone, password } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      cashBalance: 100000 // Starting balance: ₹1,00,000
    });
    
    await newUser.save();
    
    // Create empty portfolio for user
    const newPortfolio = new Portfolio({
      userId: newUser._id,
      holdings: [],
      totalInvested: 0,
      currentValue: 0,
      totalProfitLoss: 0
    });
    
    await newPortfolio.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered successfully:', newUser.email);
    
    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        cashBalance: newUser.cashBalance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ✅ LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in successfully:', user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cashBalance: user.cashBalance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ GET USER PROFILE (Protected)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cashBalance: user.cashBalance,
      portfolioValue: portfolio ? portfolio.currentValue : 0,
      totalInvested: portfolio ? portfolio.totalInvested : 0
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// ✅ GET PORTFOLIO (Protected)
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    const user = await User.findById(req.user.userId);
    
    if (!portfolio) {
      return res.json({
        holdings: [],
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        cashBalance: user.cashBalance
      });
    }
    
    res.json({
      holdings: portfolio.holdings,
      totalInvested: portfolio.totalInvested,
      currentValue: portfolio.currentValue,
      totalProfitLoss: portfolio.totalProfitLoss,
      totalProfitLossPercent: portfolio.totalProfitLossPercent,
      cashBalance: user.cashBalance,
      updatedAt: portfolio.updatedAt
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ message: 'Error fetching portfolio' });
  }
});

// ✅ BUY STOCK (Protected)
app.post('/api/orders/buy', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, quantity, price, sector, riskLevel } = req.body;
    const userId = req.user.userId;
    
    console.log('Buy order received:', { symbol, quantity, price, userId });
    
    // Validation
    if (!symbol || !name || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const totalCost = quantity * price;
    
    // Check user balance
    const user = await User.findById(userId);
    if (user.cashBalance < totalCost) {
      return res.status(400).json({ 
        message: `Insufficient funds! You need ₹${totalCost.toFixed(2)} but only have ₹${user.cashBalance.toFixed(2)}` 
      });
    }
    
    // Deduct balance
    user.cashBalance -= totalCost;
    await user.save();
    
    // Update portfolio
    let portfolio = await Portfolio.findOne({ userId });
    
    if (!portfolio) {
      portfolio = new Portfolio({ userId, holdings: [] });
    }
    
    // Check if stock already exists in portfolio
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
    
    if (existingHolding) {
      // Update existing holding
      const totalQuantity = existingHolding.quantity + quantity;
      const totalInvested = existingHolding.totalInvested + totalCost;
      existingHolding.quantity = totalQuantity;
      existingHolding.avgBuyPrice = totalInvested / totalQuantity;
      existingHolding.totalInvested = totalInvested;
    } else {
      // Add new holding
      portfolio.holdings.push({
        symbol,
        name,
        quantity,
        avgBuyPrice: price,
        totalInvested: totalCost,
        sector: sector || 'Unknown',
        riskLevel: riskLevel || 'Medium'
      });
    }
    
    // Update portfolio totals
    portfolio.totalInvested += totalCost;
    portfolio.updatedAt = new Date();
    await portfolio.save();
    
    // Record transaction
    const transaction = new Transaction({
      userId,
      type: 'BUY',
      symbol,
      name,
      quantity,
      price,
      totalAmount: totalCost,
      sector: sector || 'Unknown',
      riskLevel: riskLevel || 'Medium'
    });
    
    await transaction.save();
    
    console.log('✅ Buy order completed successfully');
    
    res.json({
      success: true,
      message: `Successfully bought ${quantity} shares of ${symbol}`,
      orderId: transaction._id,
      remainingBalance: user.cashBalance,
      portfolio: {
        totalInvested: portfolio.totalInvested,
        holdings: portfolio.holdings
      }
    });
  } catch (error) {
    console.error('Buy order error:', error);
    res.status(500).json({ message: 'Error processing buy order' });
  }
});

// ✅ SELL STOCK (Protected)
app.post('/api/orders/sell', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, quantity, price } = req.body;
    const userId = req.user.userId;
    
    console.log('Sell order received:', { symbol, quantity, price, userId });
    
    // Validation
    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const totalRevenue = quantity * price;
    
    // Get portfolio
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(400).json({ message: 'No portfolio found' });
    }
    
    // Find holding
    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    if (!holding) {
      return res.status(400).json({ message: 'Stock not found in portfolio' });
    }
    
    if (holding.quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient shares! You only have ${holding.quantity} shares` 
      });
    }
    
    // Calculate profit/loss
    const avgBuyPrice = holding.avgBuyPrice;
    const profitLoss = (price - avgBuyPrice) * quantity;
    
    // Update holding
    holding.quantity -= quantity;
    holding.totalInvested -= (avgBuyPrice * quantity);
    
    // Remove holding if quantity is 0
    if (holding.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    }
    
    // Update portfolio totals
    portfolio.totalInvested -= (avgBuyPrice * quantity);
    portfolio.totalProfitLoss += profitLoss;
    portfolio.updatedAt = new Date();
    await portfolio.save();
    
    // Add revenue to user balance
    const user = await User.findById(userId);
    user.cashBalance += totalRevenue;
    await user.save();
    
    // Record transaction
    const transaction = new Transaction({
      userId,
      type: 'SELL',
      symbol,
      name,
      quantity,
      price,
      totalAmount: totalRevenue,
      sector: holding.sector,
      riskLevel: holding.riskLevel
    });
    
    await transaction.save();
    
    console.log('✅ Sell order completed successfully');
    
    res.json({
      success: true,
      message: `Successfully sold ${quantity} shares of ${symbol}`,
      orderId: transaction._id,
      profitLoss: profitLoss,
      totalRevenue: totalRevenue,
      remainingBalance: user.cashBalance,
      portfolio: {
        totalInvested: portfolio.totalInvested,
        holdings: portfolio.holdings
      }
    });
  } catch (error) {
    console.error('Sell order error:', error);
    res.status(500).json({ message: 'Error processing sell order' });
  }
});

// ✅ GET TRANSACTION HISTORY (Protected)
app.get('/api/orders/history', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({
      success: true,
      orders: transactions
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Error fetching transaction history' });
  }
});

// ✅ PORTFOLIO STATS (Protected)
app.get('/api/portfolio/stats', authenticateToken, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });
    const user = await User.findById(req.user.userId);
    
    if (!portfolio) {
      return res.json({
        totalInvestment: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercent: 0,
        cashBalance: user.cashBalance
      });
    }
    
    res.json({
      totalInvestment: portfolio.totalInvested,
      currentValue: portfolio.currentValue,
      profitLoss: portfolio.totalProfitLoss,
      profitLossPercent: portfolio.totalProfitLossPercent,
      cashBalance: user.cashBalance,
      numberOfStocks: portfolio.holdings.length
    });
  } catch (error) {
    console.error('Portfolio stats error:', error);
    res.status(500).json({ message: 'Error fetching portfolio stats' });
  }
});

// ✅ STOCK ENDPOINTS (Keep your existing ones)
app.get('/api/market/yahoo/:symbol', (req, res) => {
  console.log(`Fetching data for: ${req.params.symbol}`);
  
  try {
    const sectors = ['Technology', 'Banking', 'Energy', 'Healthcare', 'Automobile', 'Pharmaceutical', 'Consumer Goods', 'Infrastructure', 'Finance', 'Insurance'];
    const riskLevels = ['Low', 'Medium', 'High'];
    const companyNames = {
      'RELIANCE.BO': 'Reliance Industries Limited',
      'TCS.BO': 'Tata Consultancy Services Limited',
      'HDFCBANK.BO': 'HDFC Bank Limited',
      'INFY.BO': 'Infosys Limited',
      'HINDUNILVR.BO': 'Hindustan Unilever Limited',
      'ICICIBANK.BO': 'ICICI Bank Limited',
      'KOTAKBANK.BO': 'Kotak Mahindra Bank Limited',
      'SBIN.BO': 'State Bank of India',
      'BHARTIARTL.BO': 'Bharti Airtel Limited',
      'ITC.BO': 'ITC Limited',
      'LT.BO': 'Larsen & Toubro Limited',
      'AXISBANK.BO': 'Axis Bank Limited',
      'ASIANPAINT.BO': 'Asian Paints Limited',
      'MARUTI.BO': 'Maruti Suzuki India Limited',
      'SUNPHARMA.BO': 'Sun Pharmaceutical Industries Limited',
      'TITAN.BO': 'Titan Company Limited',
      'ULTRACEMCO.BO': 'UltraTech Cement Limited',
      'NESTLEIND.BO': 'Nestlé India Limited',
      'BAJFINANCE.BO': 'Bajaj Finance Limited',
      'WIPRO.BO': 'Wipro Limited',
      'HCLTECH.BO': 'HCL Technologies Limited',
      'TECHM.BO': 'Tech Mahindra Limited',
      'ADANIPORTS.BO': 'Adani Ports and Special Economic Zone Limited',
      'POWERGRID.BO': 'Power Grid Corporation of India Limited',
      'NTPC.BO': 'NTPC Limited',
      'ONGC.BO': 'Oil and Natural Gas Corporation Limited',
      'COALINDIA.BO': 'Coal India Limited',
      'IOC.BO': 'Indian Oil Corporation Limited',
      'BPCL.BO': 'Bharat Petroleum Corporation Limited',
      'HINDALCO.BO': 'Hindalco Industries Limited'
    };

    const basePrices = {
      'RELIANCE.BO': 2500, 'TCS.BO': 3500, 'HDFCBANK.BO': 1500, 'INFY.BO': 1600,
      'HINDUNILVR.BO': 2400, 'ICICIBANK.BO': 950, 'KOTAKBANK.BO': 1700, 'SBIN.BO': 600,
      'BHARTIARTL.BO': 800, 'ITC.BO': 430, 'LT.BO': 3200, 'AXISBANK.BO': 1000,
      'ASIANPAINT.BO': 2900, 'MARUTI.BO': 9800, 'SUNPHARMA.BO': 1200, 'TITAN.BO': 3400,
      'ULTRACEMCO.BO': 8800, 'NESTLEIND.BO': 2400, 'BAJFINANCE.BO': 6800, 'WIPRO.BO': 450,
      'HCLTECH.BO': 1300, 'TECHM.BO': 1200, 'ADANIPORTS.BO': 1200, 'POWERGRID.BO': 250,
      'NTPC.BO': 320, 'ONGC.BO': 200, 'COALINDIA.BO': 400, 'IOC.BO': 150,
      'BPCL.BO': 450, 'HINDALCO.BO': 600
    };

    const symbol = req.params.symbol;
    const basePrice = basePrices[symbol] || 500;
    const price = basePrice + (Math.random() * 100 - 50);
    const change = (Math.random() * 20 - 10);
    const changePercent = (change / price) * 100;

    const mockData = {
      symbol: symbol,
      name: companyNames[symbol] || `${symbol.replace('.BO', '')} Limited`,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      timestamp: new Date().toISOString()
    };
    
    res.json(mockData);
    
  } catch (error) {
    console.error('Error in stock endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      symbol: req.params.symbol 
    });
  }
});

app.get('/api/market/stocks', (req, res) => {
  const symbols = req.query.symbols.split(',');
  console.log(`Batch request for: ${symbols.length} symbols`);
  
  try {
    const sectors = ['Technology', 'Banking', 'Energy', 'Healthcare', 'Automobile', 'Pharmaceutical'];
    const riskLevels = ['Low', 'Medium', 'High'];
    
    const batchData = symbols.map(symbol => {
      const basePrice = 500 + (Math.random() * 1000);
      const change = (Math.random() * 20 - 10);
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol: symbol,
        name: `${symbol.replace('.BO', '')} Limited`,
        price: parseFloat((basePrice + (Math.random() * 100 - 50)).toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)]
      };
    });
    
    res.json(batchData);
    
  } catch (error) {
    console.error('Error in batch endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WealthMind Backend Server running on http://localhost:${PORT}`);
  console.log(`🔗 MongoDB Database: wealthmind`);
  console.log(`📊 Available endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/user/profile (Protected)`);
  console.log(`   GET  http://localhost:${PORT}/api/portfolio (Protected)`);
  console.log(`   POST http://localhost:${PORT}/api/orders/buy (Protected)`);
  console.log(`   POST http://localhost:${PORT}/api/orders/sell (Protected)`);
  console.log(`   GET  http://localhost:${PORT}/api/orders/history (Protected)`);
});