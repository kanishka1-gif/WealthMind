const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock user database (in production, use a real database)
const users = [];

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'WealthMind Backend Server is running!' });
});

// ✅ AUTH ENDPOINTS
app.post('/api/auth/register', (req, res) => {
  console.log('Registration attempt:', req.body);
  
  const { name, email, phone, password } = req.body;
  
  // Basic validation
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ 
      message: 'All fields are required' 
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ 
      message: 'User already exists with this email' 
    });
  }
  
  // Create new user (in production, hash the password!)
  const newUser = {
    id: users.length + 1,
    name,
    email,
    phone,
    password: password, // In production, use bcrypt to hash passwords!
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  console.log('User registered successfully:', newUser.email);
  
  // Return success with token (in production, use JWT)
  res.json({
    success: true,
    message: 'Registration successful',
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }
  
  // Find user (in production, check hashed password)
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ 
      message: 'Invalid email or password' 
    });
  }
  
  console.log('User logged in successfully:', user.email);
  
  // Return success with token
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// ✅ UPDATED STOCK ENDPOINTS - FIXED FOR FRONTEND
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
    
    console.log('Sending data for:', symbol, mockData.price);
    res.json(mockData);
    
  } catch (error) {
    console.error('Error in stock endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      symbol: req.params.symbol 
    });
  }
});

// ✅ UPDATED BATCH ENDPOINT - FIXED FOR FRONTEND
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
    
    console.log('Sending batch data for', symbols.length, 'symbols');
    res.json(batchData);
    
  } catch (error) {
    console.error('Error in batch endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ USER PROFILE ENDPOINT (for after login)
app.get('/api/user/profile', (req, res) => {
  // In production, verify JWT token and get user from database
  res.json({
    id: 1,
    name: 'John Doe',
    email: 'john@gmail.com',
    phone: '1234567',
    portfolioValue: 15000.50,
    cashBalance: 2500.75
  });
});

// ✅ OTHER REQUIRED ENDPOINTS
app.get('/api/user/preferences', (req, res) => {
  res.json({
    theme: 'light',
    notifications: true,
    currency: 'USD'
  });
});

app.get('/api/portfolio', (req, res) => {
  res.json({
    totalValue: 15000.50,
    cashBalance: 2500.75,
    stocks: [
      { symbol: 'TCS.BO', quantity: 10, avgPrice: 320.50, currentPrice: 350.75 },
      { symbol: 'RELIANCE.BO', quantity: 5, avgPrice: 2400.00, currentPrice: 2450.25 }
    ]
  });
});

app.get('/api/portfolio/stats', (req, res) => {
  res.json({
    totalInvestment: 12000.00,
    currentValue: 15000.50,
    profitLoss: 3000.50,
    dailyChange: 250.75
  });
});

// ✅ MARKET SEARCH ENDPOINT
app.get('/api/market/search/:query', (req, res) => {
  const { query } = req.params;
  const allSymbols = [
    'RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'HINDUNILVR.BO',
    'ICICIBANK.BO', 'KOTAKBANK.BO', 'SBIN.BO', 'BHARTIARTL.BO', 'ITC.BO'
  ];
  
  const results = allSymbols
    .filter(symbol => symbol.toLowerCase().includes(query.toLowerCase()))
    .map(symbol => ({
      symbol,
      name: `${symbol.replace('.BO', '')} Limited`
    }));
  
  res.json(results);
});

// ✅ ORDER ENDPOINTS
app.post('/api/orders/buy', (req, res) => {
  console.log('Buy order:', req.body);
  res.json({
    success: true,
    message: 'Order placed successfully',
    orderId: 'ORD' + Date.now()
  });
});

app.post('/api/orders/sell', (req, res) => {
  console.log('Sell order:', req.body);
  res.json({
    success: true,
    message: 'Order placed successfully',
    orderId: 'ORD' + Date.now()
  });
});

app.get('/api/orders/history', (req, res) => {
  res.json({
    orders: [
      {
        id: 1,
        symbol: 'TCS.BO',
        type: 'BUY',
        quantity: 10,
        price: 350.75,
        total: 3507.50,
        timestamp: new Date().toISOString()
      }
    ]
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
  console.log(`🔗 Also accessible on http://127.0.0.1:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/user/profile`);
  console.log(`   GET  http://localhost:${PORT}/api/market/yahoo/:symbol`);
  console.log(`   GET  http://localhost:${PORT}/api/market/stocks?symbols=SYM1,SYM2`);
  console.log(`   GET  http://localhost:${PORT}/api/market/search/:query`);
  console.log(`   GET  http://localhost:${PORT}/api/portfolio`);
});