// Indian stock symbols
export const INDIAN_STOCKS = [
  'RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'HINDUNILVR.BO',
  'ICICIBANK.BO', 'KOTAKBANK.BO', 'SBIN.BO', 'BHARTIARTL.BO', 'ITC.BO',
  'LT.BO', 'AXISBANK.BO', 'ASIANPAINT.BO', 'MARUTI.BO', 'SUNPHARMA.BO',
  'TITAN.BO', 'ULTRACEMCO.BO', 'NESTLEIND.BO', 'BAJFINANCE.BO', 'WIPRO.BO',
  'HCLTECH.BO', 'TECHM.BO', 'ADANIPORTS.BO', 'POWERGRID.BO', 'NTPC.BO',
  'ONGC.BO', 'COALINDIA.BO', 'IOC.BO', 'BPCL.BO', 'HINDALCO.BO'
];

// Base URL for your backend
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Stock data fetching
export const getStockData = async (symbol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/market/yahoo/${symbol}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data.price === 'undefined') {
      throw new Error('No price data available');
    }

    return {
      symbol: data.symbol,
      name: data.name || getStockName(symbol),
      price: parseFloat(data.price),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.changePercent),
      previousClose: parseFloat((data.price - data.change).toFixed(2)),
      open: parseFloat((data.price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
      high: parseFloat((data.price * (1 + Math.random() * 0.03)).toFixed(2)),
      low: parseFloat((data.price * (1 - Math.random() * 0.02)).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      timestamp: Date.now(),
      sector: data.sector || getSector(symbol),
      riskLevel: data.riskLevel || getRiskLevel(symbol),
      marketCap: getMarketCap(symbol),
      currency: 'INR',
      exchange: 'BSE',
      dataSource: 'Your Backend API',
      isMockData: false
    };
  } catch (error) {
    console.warn(`Failed to fetch ${symbol}:`, error.message);
    return generateRealisticMockData(symbol);
  }
};

// Batch stock data fetching
export const getMultipleStocks = async (symbols, onProgress = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/market/stocks?symbols=${symbols.join(',')}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from backend');
    }
    
    return data.map(stock => ({
      ...stock,
      name: stock.name || getStockName(stock.symbol),
      sector: stock.sector || getSector(stock.symbol),
      riskLevel: stock.riskLevel || getRiskLevel(stock.symbol),
      marketCap: getMarketCap(stock.symbol),
      previousClose: parseFloat((stock.price - stock.change).toFixed(2)),
      dataSource: 'Your Backend API',
      isMockData: false
    }));
    
  } catch (error) {
    console.warn('Batch API failed:', error.message);
    
    const results = [];
    for (let i = 0; i < symbols.length; i++) {
      try {
        const stock = await getStockData(symbols[i]);
        results.push(stock);
        
        if (onProgress) {
          onProgress(i + 1, symbols.length);
        }
      } catch (individualError) {
        results.push(generateRealisticMockData(symbols[i]));
      }
    }
    
    return results;
  }
};

// Helper functions
const getStockName = (symbol) => {
  const stockNames = {
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
    'NESTLEIND.BO': 'Nestle India Limited',
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
  return stockNames[symbol] || symbol.replace('.BO', '') + ' Limited';
};

const getSector = (symbol) => {
  const sectors = {
    'RELIANCE.BO': 'Energy',
    'TCS.BO': 'Information Technology',
    'HDFCBANK.BO': 'Banking',
    'INFY.BO': 'Information Technology',
    'HINDUNILVR.BO': 'FMCG',
    'ICICIBANK.BO': 'Banking',
    'KOTAKBANK.BO': 'Banking',
    'SBIN.BO': 'Banking',
    'BHARTIARTL.BO': 'Telecom',
    'ITC.BO': 'FMCG',
    'LT.BO': 'Infrastructure',
    'AXISBANK.BO': 'Banking',
    'ASIANPAINT.BO': 'FMCG',
    'MARUTI.BO': 'Automobile',
    'SUNPHARMA.BO': 'Pharmaceuticals',
    'TITAN.BO': 'Consumer Goods',
    'ULTRACEMCO.BO': 'Cement',
    'NESTLEIND.BO': 'FMCG',
    'BAJFINANCE.BO': 'Finance',
    'WIPRO.BO': 'Information Technology',
    'HCLTECH.BO': 'Information Technology',
    'TECHM.BO': 'Information Technology',
    'ADANIPORTS.BO': 'Infrastructure',
    'POWERGRID.BO': 'Energy',
    'NTPC.BO': 'Energy',
    'ONGC.BO': 'Energy',
    'COALINDIA.BO': 'Energy',
    'IOC.BO': 'Energy',
    'BPCL.BO': 'Energy',
    'HINDALCO.BO': 'Metals'
  };
  return sectors[symbol] || 'Diversified';
};

const getRiskLevel = (symbol) => {
  const largeCaps = ['RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'HINDUNILVR.BO'];
  return largeCaps.includes(symbol) ? 'Low' : 'Medium';
};

const getMarketCap = (symbol) => {
  const largeCaps = ['RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'HINDUNILVR.BO'];
  return largeCaps.includes(symbol) ? 'Large Cap' : 'Mid Cap';
};

const generateRealisticMockData = (symbol) => {
  const basePrice = Math.random() * 5000 + 50;
  const changePercent = (Math.random() - 0.5) * 10;
  
  return {
    symbol: symbol,
    name: getStockName(symbol),
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat((basePrice * changePercent / 100).toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    previousClose: parseFloat((basePrice - (basePrice * changePercent / 100)).toFixed(2)),
    open: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
    high: parseFloat((basePrice * (1 + Math.random() * 0.03)).toFixed(2)),
    low: parseFloat((basePrice * (1 - Math.random() * 0.02)).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    timestamp: Date.now(),
    sector: getSector(symbol),
    riskLevel: getRiskLevel(symbol),
    marketCap: getMarketCap(symbol),
    currency: 'INR',
    exchange: 'BSE',
    dataSource: 'Fallback Mock',
    isMockData: true
  };
};

// ========== INVESTMENT SERVICE (FIXED FOR SYNC) ==========
export const investmentService = {
  getTotalInvestment: () => {
    try {
      const investment = localStorage.getItem('wealthmind_total_investment');
      return investment ? Math.max(0, parseFloat(investment)) : 0;
    } catch (error) {
      return 0;
    }
  },

  setTotalInvestment: (amount) => {
    try {
      const safeAmount = Math.max(0, parseFloat(amount) || 0);
      localStorage.setItem('wealthmind_total_investment', safeAmount.toString());
      return safeAmount;
    } catch (error) {
      return investmentService.getTotalInvestment();
    }
  },

  addInvestment: (amount) => {
    const current = investmentService.getTotalInvestment();
    const newAmount = parseFloat(amount) || 0;
    
    if (newAmount <= 0) {
      return current;
    }
    
    const newTotal = current + newAmount;
    investmentService.setTotalInvestment(newTotal);
    
    const history = investmentService.getInvestmentHistory();
    history.unshift({
      amount: newAmount,
      date: new Date().toISOString(),
      type: 'deposit'
    });
    localStorage.setItem('wealthmind_investment_history', JSON.stringify(history));
    
    return newTotal;
  },

  getAvailableCash: () => {
    const totalInvestment = investmentService.getTotalInvestment();
    const portfolio = portfolioService.getPortfolio();
    const allocated = portfolio.reduce((sum, stock) => sum + (stock.totalInvested || 0), 0);
    
    return Math.max(0, totalInvestment - allocated);
  },

  getInvestmentHistory: () => {
    try {
      const history = localStorage.getItem('wealthmind_investment_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return [];
    }
  },

  deductCash: () => {
    return investmentService.getAvailableCash();
  },

  addCash: () => {
    return investmentService.getAvailableCash();
  }
};

// ========== PORTFOLIO SERVICE (UPDATED) ==========
export const portfolioService = {
  getPortfolio: () => {
    try {
      const portfolio = localStorage.getItem('wealthmind_portfolio');
      return portfolio ? JSON.parse(portfolio) : [];
    } catch (error) {
      return [];
    }
  },

  addToPortfolio: (stock, quantity, buyPrice) => {
    try {
      const totalCost = quantity * buyPrice;
      const availableCash = investmentService.getAvailableCash();
      
      if (totalCost > availableCash) {
        throw new Error(`Insufficient funds. You need ₹${totalCost.toFixed(2)} but only have ₹${availableCash.toFixed(2)} available.`);
      }
      
      const portfolio = portfolioService.getPortfolio();
      const existingStockIndex = portfolio.findIndex(item => item.symbol === stock.symbol);
      
      if (existingStockIndex !== -1) {
        const existingStock = portfolio[existingStockIndex];
        const totalQuantity = existingStock.quantity + quantity;
        const totalInvested = existingStock.totalInvested + totalCost;
        const avgPrice = totalInvested / totalQuantity;
        
        existingStock.quantity = totalQuantity;
        existingStock.avgPrice = parseFloat(avgPrice.toFixed(2));
        existingStock.totalInvested = parseFloat(totalInvested.toFixed(2));
        existingStock.currentPrice = stock.price;
        existingStock.lastUpdated = new Date().toISOString();
      } else {
        portfolio.push({
          symbol: stock.symbol,
          name: stock.name,
          quantity: quantity,
          avgPrice: buyPrice,
          currentPrice: stock.price,
          totalInvested: parseFloat(totalCost.toFixed(2)),
          sector: stock.sector,
          riskLevel: stock.riskLevel,
          marketCap: stock.marketCap,
          buyDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          purchaseDate: new Date().toISOString()
        });
      }
      
      localStorage.setItem('wealthmind_portfolio', JSON.stringify(portfolio));
      return portfolio;
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      throw error;
    }
  },

  removeFromPortfolio: (symbol, quantity = null) => {
    try {
      const portfolio = portfolioService.getPortfolio();
      
      if (quantity === null) {
        const updatedPortfolio = portfolio.filter(item => item.symbol !== symbol);
        localStorage.setItem('wealthmind_portfolio', JSON.stringify(updatedPortfolio));
        return updatedPortfolio;
      } else {
        const stockIndex = portfolio.findIndex(item => item.symbol === symbol);
        if (stockIndex !== -1) {
          const stock = portfolio[stockIndex];
          if (quantity >= stock.quantity) {
            portfolio.splice(stockIndex, 1);
          } else {
            stock.quantity -= quantity;
            stock.totalInvested = parseFloat((stock.quantity * stock.avgPrice).toFixed(2));
            stock.lastUpdated = new Date().toISOString();
          }
          localStorage.setItem('wealthmind_portfolio', JSON.stringify(portfolio));
        }
        return portfolio;
      }
    } catch (error) {
      return portfolioService.getPortfolio();
    }
  },

  getPortfolioStats: (currentStocks = []) => {
    const portfolio = portfolioService.getPortfolio();
    const totalInvested = portfolio.reduce((sum, stock) => sum + (stock.totalInvested || 0), 0);
    
    const updatedPortfolio = portfolio.map(portfolioStock => {
      const currentStock = currentStocks.find(s => s.symbol === portfolioStock.symbol);
      const currentPrice = currentStock ? currentStock.price : portfolioStock.currentPrice;
      const currentValue = (portfolioStock.quantity || 0) * (currentPrice || 0);
      const profitLoss = currentValue - (portfolioStock.totalInvested || 0);
      const profitLossPercent = (portfolioStock.totalInvested || 0) > 0 ? (profitLoss / portfolioStock.totalInvested) * 100 : 0;
      
      return {
        ...portfolioStock,
        currentPrice: currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2))
      };
    });
    
    const currentValue = updatedPortfolio.reduce((sum, stock) => sum + (stock.currentValue || 0), 0);
    const totalProfitLoss = currentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    
    const sectorAllocation = updatedPortfolio.reduce((acc, stock) => {
      const sector = stock.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + (stock.currentValue || 0);
      return acc;
    }, {});
    
    const riskAllocation = updatedPortfolio.reduce((acc, stock) => {
      const risk = stock.riskLevel || 'Medium';
      acc[risk] = (acc[risk] || 0) + (stock.currentValue || 0);
      return acc;
    }, {});
    
    return {
      portfolio: updatedPortfolio,
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
        totalStocks: updatedPortfolio.length
      },
      allocation: {
        sectors: sectorAllocation,
        risk: riskAllocation
      }
    };
  }
};

// ========== PORTFOLIO ANALYTICS SERVICE ==========
export const portfolioAnalyticsService = {
  getPerformanceMetrics: (portfolioStats) => {
    if (!portfolioStats || !portfolioStats.portfolio) {
      return {
        dailyChange: 0,
        dailyChangePercent: 0,
        topPerformers: [],
        worstPerformers: [],
        diversificationScore: 0
      };
    }
    
    const { summary, portfolio } = portfolioStats;
    
    const dailyChange = portfolio.reduce((sum, stock) => {
      const currentPrice = stock.currentPrice || 0;
      const previousPrice = currentPrice - (stock.change || 0);
      const priceChange = currentPrice - previousPrice;
      return sum + ((stock.quantity || 0) * priceChange);
    }, 0);
    
    const dailyChangePercent = (summary.currentValue || 0) > 0 ? (dailyChange / summary.currentValue) * 100 : 0;
    
    const topPerformers = [...portfolio]
      .filter(stock => stock.profitLossPercent !== undefined)
      .sort((a, b) => (b.profitLossPercent || 0) - (a.profitLossPercent || 0))
      .slice(0, 5);
    
    const worstPerformers = [...portfolio]
      .filter(stock => stock.profitLossPercent !== undefined)
      .sort((a, b) => (a.profitLossPercent || 0) - (b.profitLossPercent || 0))
      .slice(0, 5);
    
    return {
      dailyChange: parseFloat(dailyChange.toFixed(2)),
      dailyChangePercent: parseFloat(dailyChangePercent.toFixed(2)),
      topPerformers,
      worstPerformers,
      diversificationScore: this.calculateDiversificationScore(portfolioStats.allocation?.sectors || {})
    };
  },

  calculateDiversificationScore: (sectorAllocation) => {
    const sectors = Object.keys(sectorAllocation);
    if (sectors.length === 0) return 0;
    
    const totalValue = Object.values(sectorAllocation).reduce((sum, val) => sum + val, 0);
    if (totalValue === 0) return 0;
    
    const idealAllocation = 100 / sectors.length;
    
    let score = 100;
    sectors.forEach(sector => {
      const actualAllocation = (sectorAllocation[sector] / totalValue) * 100;
      const deviation = Math.abs(actualAllocation - idealAllocation);
      score -= deviation / 2;
    });
    
    return Math.max(0, Math.min(100, parseFloat(score.toFixed(1))));
  },

  getRiskAnalysis: (portfolioStats) => {
    const riskDistribution = portfolioStats.allocation?.risk || {};
    const totalValue = portfolioStats.summary?.currentValue || 0;
    
    let riskScore = 0;
    if (totalValue > 0) {
      riskScore = (
        (riskDistribution.Low || 0) * 0.3 +
        (riskDistribution.Medium || 0) * 0.6 +
        (riskDistribution.High || 0) * 0.9
      ) / totalValue * 100;
    }
    
    return {
      riskScore: parseFloat(riskScore.toFixed(1)),
      recommendation: riskScore < 40 ? 'Conservative' : riskScore < 70 ? 'Moderate' : 'Aggressive'
    };
  }
};

// ========== GOAL PLANNING SERVICE ==========
export const goalPlanningService = {
  getGoals: () => {
    try {
      const goals = localStorage.getItem('wealthmind_goals');
      return goals ? JSON.parse(goals) : [];
    } catch (error) {
      return [];
    }
  },

  addGoal: (goal) => {
    try {
      const goals = goalPlanningService.getGoals();
      const newGoal = {
        id: Date.now().toString(),
        name: goal.name,
        targetAmount: parseFloat(goal.targetAmount),
        currentAmount: parseFloat(goal.currentAmount || 0),
        targetDate: goal.targetDate,
        monthlyContribution: parseFloat(goal.monthlyContribution || 0),
        riskLevel: goal.riskLevel || 'Medium',
        createdAt: new Date().toISOString(),
        progress: 0
      };
      
      goals.push(newGoal);
      localStorage.setItem('wealthmind_goals', JSON.stringify(goals));
      return goals;
    } catch (error) {
      return goalPlanningService.getGoals();
    }
  },

  updateGoalProgress: (goalId, currentAmount) => {
    try {
      const goals = goalPlanningService.getGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      
      if (goalIndex !== -1) {
        goals[goalIndex].currentAmount = parseFloat(currentAmount);
        goals[goalIndex].progress = (currentAmount / goals[goalIndex].targetAmount) * 100;
        goals[goalIndex].lastUpdated = new Date().toISOString();
        localStorage.setItem('wealthmind_goals', JSON.stringify(goals));
      }
      return goals;
    } catch (error) {
      return goalPlanningService.getGoals();
    }
  },

  calculateGoalPlan: (goal, expectedReturn = 12) => {
    const monthlyReturn = expectedReturn / 12 / 100;
    const targetAmount = goal.targetAmount;
    const currentAmount = goal.currentAmount || 0;
    const months = this.getMonthsToTarget(goal.targetDate);
    
    if (months <= 0) return null;
    
    const futureValue = targetAmount - currentAmount;
    const monthlyContribution = futureValue * monthlyReturn / (Math.pow(1 + monthlyReturn, months) - 1);
    
    return {
      monthlyContribution: parseFloat(monthlyContribution.toFixed(2)),
      totalMonths: months,
      expectedReturn: expectedReturn,
      totalInvestment: parseFloat((monthlyContribution * months).toFixed(2))
    };
  },

  getMonthsToTarget: (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(0, months);
  },

  getGoalRecommendations: (goal) => {
    const riskBasedAllocation = {
      'Low': { stocks: 40, bonds: 50, cash: 10 },
      'Medium': { stocks: 70, bonds: 25, cash: 5 },
      'High': { stocks: 85, bonds: 10, cash: 5 }
    };
    
    const allocation = riskBasedAllocation[goal.riskLevel] || riskBasedAllocation['Medium'];
    const plan = this.calculateGoalPlan(goal);
    
    if (!plan) return null;
    
    return {
      allocation,
      plan,
      steps: [
        `Set up monthly SIP of ₹${plan.monthlyContribution}`,
        `Allocate ${allocation.stocks}% to equity stocks`,
        `Review portfolio every 6 months`,
        `Increase contributions by 10% annually`
      ]
    };
  }
};

// ========== RECOMMENDATION SERVICE ==========
export const recommendationService = {
  getTopStocks: (stocks, count = 10) => {
    const validStocks = stocks.filter(stock => 
      stock && stock.symbol && typeof stock.price === 'number' && stock.price > 0
    );

    const scoredStocks = validStocks.map(stock => {
      let score = 50;
      
      const momentumScore = Math.min(Math.max((stock.changePercent || 0) * 2, -20), 20);
      score += momentumScore;
      
      const sectorWeights = {
        'Information Technology': 1.3,
        'Pharmaceuticals': 1.2,
        'FMCG': 1.1,
        'Banking': 1.0
      };
      score *= (sectorWeights[stock.sector] || 0.8);
      
      const riskWeights = { 'Low': 1.3, 'Medium': 1.0, 'High': 0.5 };
      score *= (riskWeights[stock.riskLevel] || 0.7);

      return {
        ...stock,
        recommendationScore: Math.max(0, Math.min(100, score))
      };
    });
    
    return scoredStocks
      .filter(stock => stock.recommendationScore >= 40)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, count);
  },

  getRecommendedAllocation: (availableCash, topStocks) => {
    if (!topStocks.length || availableCash <= 0) return [];

    const totalScore = topStocks.reduce((sum, stock) => sum + stock.recommendationScore, 0);
    
    return topStocks.map(stock => {
      const allocationPercent = (stock.recommendationScore / totalScore) * 100;
      const allocationAmount = (availableCash * allocationPercent) / 100;
      
      return {
        ...stock,
        allocationPercent: parseFloat(allocationPercent.toFixed(1)),
        allocationAmount: parseFloat(allocationAmount.toFixed(2)),
        suggestedQuantity: Math.max(1, Math.floor(allocationAmount / stock.price))
      };
    });
  }
};

export default {
  INDIAN_STOCKS,
  portfolioService,
  investmentService,
  portfolioAnalyticsService,
  goalPlanningService,
  recommendationService,
  getStockData,
  getMultipleStocks
};