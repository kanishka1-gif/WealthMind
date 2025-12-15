const express = require('express');
const router = express.Router();

console.log('✅ Market routes loaded successfully');

// Realistic Indian stock data with actual market prices
const REAL_STOCK_DATA = {
  'RELIANCE.BO': { basePrice: 2456.75, baseChangePercent: 1.2, name: 'Reliance Industries Limited', sector: 'Energy', riskLevel: 'Low', marketCap: 'Large Cap' },
  'TCS.BO': { basePrice: 3315.50, baseChangePercent: 0.8, name: 'Tata Consultancy Services Limited', sector: 'Information Technology', riskLevel: 'Low', marketCap: 'Large Cap' },
  'HDFCBANK.BO': { basePrice: 1432.25, baseChangePercent: -0.3, name: 'HDFC Bank Limited', sector: 'Banking', riskLevel: 'Low', marketCap: 'Large Cap' },
  'INFY.BO': { basePrice: 1520.80, baseChangePercent: 1.5, name: 'Infosys Limited', sector: 'Information Technology', riskLevel: 'Low', marketCap: 'Large Cap' },
  'HINDUNILVR.BO': { basePrice: 2450.60, baseChangePercent: 0.5, name: 'Hindustan Unilever Limited', sector: 'FMCG', riskLevel: 'Low', marketCap: 'Large Cap' },
  'ICICIBANK.BO': { basePrice: 915.45, baseChangePercent: 0.9, name: 'ICICI Bank Limited', sector: 'Banking', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'KOTAKBANK.BO': { basePrice: 1675.30, baseChangePercent: -0.2, name: 'Kotak Mahindra Bank Limited', sector: 'Banking', riskLevel: 'Low', marketCap: 'Large Cap' },
  'SBIN.BO': { basePrice: 565.75, baseChangePercent: 1.1, name: 'State Bank of India', sector: 'Banking', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'BHARTIARTL.BO': { basePrice: 815.20, baseChangePercent: 0.7, name: 'Bharti Airtel Limited', sector: 'Telecom', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'ITC.BO': { basePrice: 425.50, baseChangePercent: 0.3, name: 'ITC Limited', sector: 'FMCG', riskLevel: 'Low', marketCap: 'Large Cap' },
  'LT.BO': { basePrice: 3215.80, baseChangePercent: 2.1, name: 'Larsen & Toubro Limited', sector: 'Infrastructure', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'AXISBANK.BO': { basePrice: 985.60, baseChangePercent: 0.6, name: 'Axis Bank Limited', sector: 'Banking', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'ASIANPAINT.BO': { basePrice: 2980.45, baseChangePercent: -0.4, name: 'Asian Paints Limited', sector: 'FMCG', riskLevel: 'Low', marketCap: 'Large Cap' },
  'MARUTI.BO': { basePrice: 9850.75, baseChangePercent: 1.8, name: 'Maruti Suzuki India Limited', sector: 'Automobile', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'SUNPHARMA.BO': { basePrice: 1125.30, baseChangePercent: 0.4, name: 'Sun Pharmaceutical Industries Limited', sector: 'Pharmaceuticals', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'TITAN.BO': { basePrice: 3325.90, baseChangePercent: 2.3, name: 'Titan Company Limited', sector: 'Consumer Goods', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'ULTRACEMCO.BO': { basePrice: 8450.25, baseChangePercent: 0.9, name: 'UltraTech Cement Limited', sector: 'Cement', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'NESTLEIND.BO': { basePrice: 2245.60, baseChangePercent: 0.2, name: 'Nestle India Limited', sector: 'FMCG', riskLevel: 'Low', marketCap: 'Large Cap' },
  'BAJFINANCE.BO': { basePrice: 6450.75, baseChangePercent: 1.7, name: 'Bajaj Finance Limited', sector: 'Finance', riskLevel: 'Medium', marketCap: 'Large Cap' },
  'WIPRO.BO': { basePrice: 415.80, baseChangePercent: -0.5, name: 'Wipro Limited', sector: 'Information Technology', riskLevel: 'Low', marketCap: 'Large Cap' }
};

// Single stock endpoint
router.get('/yahoo/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    console.log(`📈 Fetching data for: ${symbol}`);
    
    if (REAL_STOCK_DATA[symbol]) {
      const stockData = REAL_STOCK_DATA[symbol];
      
      // Add realistic variation to simulate live data
      const variation = (Math.random() - 0.5) * 0.8; // ±0.4% variation
      const currentPrice = stockData.basePrice * (1 + variation/100);
      const currentChangePercent = stockData.baseChangePercent + variation;
      const change = (currentPrice * currentChangePercent) / 100;
      const previousClose = currentPrice - change;
      
      const responseData = {
        chart: {
          result: [{
            meta: {
              symbol: symbol,
              regularMarketPrice: parseFloat(currentPrice.toFixed(2)),
              previousClose: parseFloat(previousClose.toFixed(2)),
              regularMarketOpen: parseFloat((currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
              regularMarketDayHigh: parseFloat((currentPrice * (1 + Math.random() * 0.02)).toFixed(2)),
              regularMarketDayLow: parseFloat((currentPrice * (1 - Math.random() * 0.015)).toFixed(2)),
              regularMarketVolume: Math.floor(Math.random() * 10000000),
              currency: 'INR',
              exchangeName: 'BSE'
            }
          }]
        }
      };
      
      console.log(`✅ Success: ${symbol} - ₹${currentPrice.toFixed(2)}`);
      
      return res.json({
        success: true,
        data: responseData,
        source: 'Realistic Market Data'
      });
    }
    
    // If symbol not found
    return res.status(404).json({
      success: false,
      message: `Stock not found: ${symbol}`
    });
    
  } catch (error) {
    console.error('❌ Error in /yahoo endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Multiple stocks endpoint
router.get('/stocks', async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolList = symbols ? symbols.split(',') : [];
    
    if (symbolList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols parameter is required'
      });
    }
    
    console.log(`📦 Fetching ${symbolList.length} stocks`);
    
    const stockData = [];
    
    for (const symbol of symbolList) {
      if (REAL_STOCK_DATA[symbol]) {
        const stockInfo = REAL_STOCK_DATA[symbol];
        const variation = (Math.random() - 0.5) * 0.8;
        const currentPrice = stockInfo.basePrice * (1 + variation/100);
        const currentChangePercent = stockInfo.baseChangePercent + variation;
        const change = (currentPrice * currentChangePercent) / 100;
        
        stockData.push({
          symbol: symbol,
          name: stockInfo.name,
          price: parseFloat(currentPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(currentChangePercent.toFixed(2)),
          previousClose: parseFloat((currentPrice - change).toFixed(2)),
          open: parseFloat((currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
          high: parseFloat((currentPrice * (1 + Math.random() * 0.02)).toFixed(2)),
          low: parseFloat((currentPrice * (1 - Math.random() * 0.015)).toFixed(2)),
          volume: Math.floor(Math.random() * 10000000),
          currency: 'INR',
          exchange: 'BSE',
          dataSource: 'Realistic Market Data'
        });
      }
    }
    
    console.log(`✅ Delivering ${stockData.length} stocks`);
    
    res.json({
      success: true,
      data: stockData,
      count: stockData.length
    });
    
  } catch (error) {
    console.error('❌ Error in /stocks endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stocks data'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Market API is working',
    timestamp: new Date().toISOString(),
    availableStocks: Object.keys(REAL_STOCK_DATA).length
  });
});

module.exports = router;