import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, PieChart, BarChart3, DollarSign, Target, 
  Calendar, Plus, Star, Zap, Wallet,
  Coins, Shield, Activity, ArrowUpRight, ArrowDownRight, Grid3x3, TrendingUp as TrendingUpIcon,
  Percent, RefreshCw, UserPlus
} from 'lucide-react';
import { portfolioService, investmentService, recommendationService, getMultipleStocks, INDIAN_STOCKS } from '../services/stockApi';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [availableCash, setAvailableCash] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    initializeUserSession();
  }, []);

  const initializeUserSession = async () => {
    setLoading(true);
    
    try {
      // Check if this is a new user (no existing data)
      const isNewUserCheck = checkIfNewUser();
      setIsNewUser(isNewUserCheck);
      
      if (isNewUserCheck) {
        // Reset all data to zero for new user
        resetToDefaultValues();
        console.log('🎉 Welcome new user! Starting with ₹0 investment.');
      }
      
      // Load dashboard data
      await loadDashboardData();
      
      // Show welcome message for new user
      if (isNewUserCheck) {
        setTimeout(() => {
          alert('👋 Welcome to your Investment Dashboard!\n\nStart by adding funds and exploring stock recommendations.');
        }, 500);
      }
    } catch (error) {
      console.error('Error initializing user session:', error);
      // Fallback to default values on error
      resetToDefaultValues();
    } finally {
      setLoading(false);
    }
  };

  const checkIfNewUser = () => {
    try {
      // Check multiple indicators of existing user data
      const hasPortfolio = portfolioService.getPortfolio().length > 0;
      const hasInvestment = investmentService.getTotalInvestment() > 0;
      const hasHistory = investmentService.getInvestmentHistory().length > 0;
      
      // If no data exists in any category, treat as new user
      return !hasPortfolio && !hasInvestment && !hasHistory;
    } catch (error) {
      // If any error occurs, treat as new user
      return true;
    }
  };

  const resetToDefaultValues = () => {
    try {
      // Reset all services to default (zero) values
      investmentService.resetToZero();
      portfolioService.resetPortfolio();
      
      // Set local state to zero
      setPortfolio([]);
      setTotalInvestment(0);
      setAvailableCash(0);
      setCurrentValue(0);
      setPortfolioChange(0);
      setInvestmentHistory([]);
      setRecommendations([]);
    } catch (error) {
      console.error('Error resetting to default values:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // Get user data from services
      const userPortfolio = portfolioService.getPortfolio();
      const totalInvested = investmentService.getTotalInvestment();
      const cashAvailable = investmentService.getAvailableCash();
      const history = investmentService.getInvestmentHistory();
      
      // Calculate current portfolio value
      const stocksValue = userPortfolio.reduce((sum, stock) => {
        return sum + ((stock.currentPrice || stock.avgPrice || 0) * stock.quantity);
      }, 0);
      
      const portfolioValue = stocksValue + cashAvailable;
      const change = portfolioValue - totalInvested;
      const changePercent = totalInvested > 0 ? (change / totalInvested) * 100 : 0;
      
      setPortfolio(userPortfolio);
      setTotalInvestment(totalInvested);
      setAvailableCash(cashAvailable);
      setCurrentValue(portfolioValue);
      setPortfolioChange(changePercent);
      setInvestmentHistory(history);
      
      // Load recommendations only if user has cash available
      if (cashAvailable > 0) {
        await loadRecommendations(cashAvailable);
      } else {
        // Still load recommendations but with zero allocation
        await loadRecommendations(0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values if there's an error
      resetToDefaultValues();
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const loadRecommendations = async (cashAvailable) => {
    setLoadingRecommendations(true);
    try {
      // Use first 30 stocks for recommendations
      const demoStocks = INDIAN_STOCKS.slice(0, 30);
      const stocks = await getMultipleStocks(demoStocks);
      const topStocks = recommendationService.getTopStocks(stocks, 8);
      
      let recommendationsWithAllocation = [];
      if (cashAvailable > 0) {
        recommendationsWithAllocation = recommendationService.getRecommendedAllocation(cashAvailable, topStocks);
      } else {
        recommendationsWithAllocation = topStocks.map(stock => ({
          ...stock,
          allocationPercent: 0,
          allocationAmount: 0,
          suggestedQuantity: 0
        }));
      }
      
      setRecommendations(recommendationsWithAllocation);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddInvestment = () => {
    if (investmentAmount && parseFloat(investmentAmount) > 0) {
      const amount = parseFloat(investmentAmount);
      investmentService.addInvestment(amount);
      setInvestmentAmount('');
      setShowInvestmentDialog(false);
      loadDashboardData();
      
      // Update new user status after first investment
      if (isNewUser) {
        setIsNewUser(false);
      }
      
      alert(`✅ Successfully added ₹${amount.toLocaleString('en-IN')} to your investment account!`);
    }
  };

  const handleQuickInvest = (amount) => {
    setInvestmentAmount(amount.toString());
    setShowInvestmentDialog(true);
  };

  const handleBuyRecommended = (stock, allocationAmount) => {
    if (!allocationAmount || allocationAmount <= 0) {
      alert('Please add funds first to invest');
      setShowInvestmentDialog(true);
      return;
    }

    const quantity = Math.floor(allocationAmount / stock.price);
    if (quantity > 0) {
      portfolioService.addToPortfolio(stock, quantity, stock.price);
      loadDashboardData();
      
      // Update new user status after first purchase
      if (isNewUser) {
        setIsNewUser(false);
      }
      
      alert(`🎉 Successfully invested ₹${allocationAmount.toLocaleString('en-IN')} in ${stock.symbol?.replace('.BO', '')}`);
    } else {
      alert('Insufficient amount to buy at least 1 share');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.max(0, amount));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  // Calculate sector allocation
  const sectorAllocation = portfolio.reduce((acc, stock) => {
    if (stock && stock.sector && stock.totalInvested) {
      const sector = stock.sector || 'Other';
      acc[sector] = (acc[sector] || 0) + (stock.totalInvested || 0);
    }
    return acc;
  }, {});

  const investedInStocks = portfolio.reduce((sum, stock) => sum + (stock.totalInvested || 0), 0);
  const totalPL = currentValue - totalInvestment;
  const totalPLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

  // Get unique investment IDs for portfolio items
  const getPortfolioItemId = (stock) => {
    return `${stock.symbol}_${stock.purchaseDate || Date.now()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            {isNewUser ? 'Setting up your new investment account...' : 'Loading Your Investment Dashboard...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isNewUser ? 'Preparing your portfolio with zero balance' : 'Fetching portfolio data and recommendations'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-yellow-300" />
              <div className="text-sm font-medium">
                <span className="text-green-300">● Live</span> Portfolio Dashboard • Real-time Updates
                {isNewUser && (
                  <span className="ml-3 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full animate-pulse">
                    NEW USER
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm opacity-90">
                Last Updated: {new Date().toLocaleTimeString()}
              </span>
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with New User Welcome */}
        {isNewUser && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome to Your Investment Journey! 🚀</h2>
                  <p className="opacity-90 mt-1">Start with ₹0 and build your portfolio. Add funds to begin investing in stocks.</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvestmentDialog(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Add First Investment
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Investment Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Track your investments and discover new opportunities</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {portfolio.length} Holdings
              </span>
              <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ₹{formatNumber(totalInvestment)} Invested
              </span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {investmentHistory.length} Deposits
              </span>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowInvestmentDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Investment
            </button>
          </div>
        </div>

        {/* Investment History Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Investment History
            </h3>
            <span className="text-sm text-gray-500">
              Total Deposits: {formatCurrency(totalInvestment)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-xl p-4">
              <div className="text-blue-800 text-sm font-medium">Total Deposits</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(totalInvestment)}
              </div>
              <div className="text-blue-700 text-xs mt-2">{investmentHistory.length} transactions</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4">
              <div className="text-green-800 text-sm font-medium">Available Cash</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {formatCurrency(availableCash)}
              </div>
              <div className="text-green-700 text-xs mt-2">Ready to invest</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-xl p-4">
              <div className="text-amber-800 text-sm font-medium">Start Investing</div>
              <div className="text-2xl font-bold text-amber-900 mt-1">Add Funds</div>
              <button 
                onClick={() => setShowInvestmentDialog(true)}
                className="mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition text-sm"
              >
                {isNewUser ? 'Start Journey' : 'Add Funds'}
              </button>
            </div>
          </div>
          
          {/* Recent Deposits */}
          {investmentHistory.length > 0 ? (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">Recent Deposits</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {investmentHistory.slice(0, 5).map((deposit, idx) => (
                  <div key={`deposit_${idx}_${deposit.date}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Coins className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Deposit #{idx + 1}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(deposit.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-green-700">
                      +{formatCurrency(deposit.amount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300 opacity-50">
                <Wallet className="w-full h-full" />
              </div>
              <p className="text-gray-500 font-medium">No investment history yet</p>
              <p className="text-sm text-gray-400 mt-1">Make your first deposit to start your investment journey</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Invested Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Invested</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalInvestment)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-500">Available: {formatCurrency(availableCash)}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-full">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Current Value Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Portfolio Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(currentValue)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {portfolioChange >= 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        +{portfolioChange.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-600">
                        {portfolioChange.toFixed(2)}%
                      </span>
                    </>
                  )}
                  <span className="text-gray-500 text-sm">all time</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total P&L Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total P&L</p>
                <p className={`text-3xl font-bold mt-2 ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPL >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalPL))}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Percent className="w-4 h-4 text-gray-500" />
                  <span className={`font-semibold ${totalPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                  </span>
                  <span className="text-gray-500 text-sm">overall return</span>
                </div>
              </div>
              <div className={`p-4 rounded-full ${totalPL >= 0 ? 'bg-gradient-to-r from-green-100 to-emerald-100' : 'bg-gradient-to-r from-red-100 to-rose-100'}`}>
                <Target className={`w-8 h-8 ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations and Portfolio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Stock Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span>AI Stock Recommendations</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {availableCash > 0 
                    ? `Top picks for your ${formatCurrency(availableCash)} available cash`
                    : 'Add funds to see personalized recommendations'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-medium text-gray-700">Powered by AI</span>
              </div>
            </div>
            
            {loadingRecommendations ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-gray-600">Analyzing market opportunities...</p>
                </div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 text-gray-300 opacity-50">
                  <Zap className="w-full h-full" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  {isNewUser ? 'Welcome! Add your first funds to get AI recommendations' : 'Add funds to see AI recommendations'}
                </p>
                <p className="text-gray-500 text-sm mb-6">Our AI will analyze the best stocks for you</p>
                <button 
                  onClick={() => setShowInvestmentDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                >
                  {isNewUser ? 'Start Investing' : 'Add Funds Now'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {recommendations.map((stock) => (
                  <div key={`rec_${stock.symbol}`} className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            stock.riskLevel === 'Low' ? 'bg-green-100' :
                            stock.riskLevel === 'Medium' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            <Shield className={`w-4 h-4 ${
                              stock.riskLevel === 'Low' ? 'text-green-600' :
                              stock.riskLevel === 'Medium' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{stock.symbol?.replace('.BO', '')}</h4>
                            <p className="text-sm text-gray-600 truncate max-w-[200px]">{stock.name}</p>
                          </div>
                          {stock.allocationPercent > 0 && (
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full">
                              {stock.allocationPercent}% Allocation
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-gray-500 text-xs">Current Price</span>
                            <div className="font-bold text-gray-900">{formatCurrency(stock.price || 0)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">24h Change</span>
                            <div className={`flex items-center gap-1 font-bold ${(stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(stock.changePercent || 0) >= 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-gray-500 text-xs">Suggested Investment</span>
                          <div className="font-bold text-lg text-blue-700">
                            {formatCurrency(stock.allocationAmount || 0)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {(stock.suggestedQuantity || 0)} shares
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleBuyRecommended(stock, stock.allocationAmount || 0)}
                          disabled={!stock.allocationAmount || stock.allocationAmount <= 0}
                          className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                        >
                          {isNewUser ? 'Start Investing' : 'Invest Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Holdings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg">
                    <Grid3x3 className="w-5 h-5 text-purple-600" />
                  </div>
                  Your Portfolio Holdings
                </h3>
                <p className="text-sm text-gray-600 mt-1">{portfolio.length} holdings • {formatCurrency(investedInStocks)} invested</p>
              </div>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 text-gray-300 opacity-50">
                  <Grid3x3 className="w-full h-full" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  {isNewUser ? 'Your portfolio is empty' : 'No investments yet'}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {isNewUser ? 'Start by adding funds and investing in recommended stocks' : 'Add funds to begin investing'}
                </p>
                <button 
                  onClick={() => setShowInvestmentDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  {isNewUser ? 'Start Your Journey' : 'Start Investing'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {portfolio.map((stock) => {
                  const currentPrice = stock.currentPrice || stock.avgPrice || 0;
                  const currentValue = currentPrice * (stock.quantity || 0);
                  const gainLoss = currentValue - (stock.totalInvested || 0);
                  const gainLossPercent = (stock.totalInvested || 0) > 0 ? (gainLoss / stock.totalInvested) * 100 : 0;
                  
                  return (
                    <div key={getPortfolioItemId(stock)} className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <TrendingUpIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{stock.symbol?.replace('.BO', '')}</h4>
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">{stock.name}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <span className="text-gray-500 text-xs">Current Value</span>
                              <div className="font-bold text-gray-900">{formatCurrency(currentValue)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">P&L</span>
                              <div className={`flex items-center gap-1 font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {gainLoss >= 0 ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4" />
                                )}
                                {gainLossPercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="mb-2">
                            <span className="text-gray-500 text-xs">Holdings</span>
                            <div className="font-bold text-lg text-purple-700">{stock.quantity || 0} shares</div>
                            <div className="text-xs text-gray-600">
                              Avg: {formatCurrency(stock.avgPrice || 0)}
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">Invested</div>
                            <div className="font-medium text-gray-900">
                              {formatCurrency(stock.totalInvested || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Allocation Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sector Allocation */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                Sector Allocation
              </h3>
              <Percent className="w-5 h-5 text-gray-500" />
            </div>
            
            {Object.keys(sectorAllocation).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300 opacity-50">
                  <PieChart className="w-full h-full" />
                </div>
                <p className="text-gray-500">
                  {isNewUser ? 'Start investing to see sector allocation' : 'No sector data available'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Invest in stocks to see sector breakdown</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(sectorAllocation).map(([sector, amount]) => {
                  const percent = investedInStocks > 0 ? (amount / investedInStocks) * 100 : 0;
                  return (
                    <div key={`sector_${sector}`} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{sector}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                        <span className="font-semibold text-blue-700">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-cyan-600"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Investment Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                Investment Breakdown
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Coins className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-700">Invested in Stocks</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {totalInvestment > 0 ? ((investedInStocks / totalInvestment) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                  <span className="font-semibold text-green-700">{formatCurrency(investedInStocks)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 group-hover:from-green-600 group-hover:to-emerald-600"
                    style={{ width: `${totalInvestment > 0 ? (investedInStocks / totalInvestment) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wallet className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">Available Cash</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {totalInvestment > 0 ? ((availableCash / totalInvestment) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                  <span className="font-semibold text-blue-700">{formatCurrency(availableCash)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-cyan-600"
                    style={{ width: `${totalInvestment > 0 ? (availableCash / totalInvestment) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>💼 Investment Dashboard • Total Portfolio Value: {formatCurrency(currentValue)}</p>
            <p className="mt-1">
              Showing {portfolio.length} holdings • {investmentHistory.length} deposits • 
              Last updated: {new Date().toLocaleTimeString()}
              {isNewUser && ' • Welcome New User!'}
            </p>
          </div>
        </div>
      </div>

      {/* Investment Dialog */}
      {showInvestmentDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isNewUser ? 'Start Your Investment Journey' : 'Add Investment Funds'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {isNewUser ? 'Add your first funds to begin investing' : 'Grow your portfolio with additional capital'}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvestmentDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-3">Investment Amount (₹):</label>
                  <input
                    type="number"
                    min="1"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder="Enter amount to invest"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-medium"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-gray-600 text-sm mb-2">Quick Select Amounts:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleQuickInvest(5000)}
                      className="bg-white text-blue-700 py-3 rounded-lg hover:bg-blue-50 transition font-medium border border-blue-200 hover:border-blue-300"
                    >
                      ₹5,000
                    </button>
                    <button 
                      onClick={() => handleQuickInvest(10000)}
                      className="bg-white text-blue-700 py-3 rounded-lg hover:bg-blue-50 transition font-medium border border-blue-200 hover:border-blue-300"
                    >
                      ₹10,000
                    </button>
                    <button 
                      onClick={() => handleQuickInvest(25000)}
                      className="bg-white text-blue-700 py-3 rounded-lg hover:bg-blue-50 transition font-medium border border-blue-200 hover:border-blue-300"
                    >
                      ₹25,000
                    </button>
                    <button 
                      onClick={() => handleQuickInvest(50000)}
                      className="bg-white text-blue-700 py-3 rounded-lg hover:bg-blue-50 transition font-medium border border-blue-200 hover:border-blue-300"
                    >
                      ₹50,000
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex justify-between text-xl font-bold mb-2">
                    <span>Current Balance:</span>
                    <span className="text-blue-700">{formatCurrency(availableCash)}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>After Deposit:</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(availableCash + (parseFloat(investmentAmount) || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowInvestmentDialog(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInvestment}
                  disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNewUser ? 'Start Investing' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;