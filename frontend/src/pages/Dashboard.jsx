import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart, BarChart3, DollarSign, Target, Calendar, Plus, Star, Zap } from 'lucide-react';
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

  useEffect(() => {
    loadPortfolioData();
    loadRecommendations();
  }, []);

  const loadPortfolioData = () => {
    const userPortfolio = portfolioService.getPortfolio();
    const totalInvested = investmentService.getTotalInvestment();
    const cashAvailable = investmentService.getAvailableCash();
    
    setPortfolio(userPortfolio);
    setTotalInvestment(totalInvested);
    setAvailableCash(cashAvailable);
    
    // Calculate current portfolio value
    const portfolioValue = userPortfolio.reduce((sum, stock) => {
      return sum + (stock.avgPrice * stock.quantity);
    }, 0);
    
    setCurrentValue(portfolioValue + cashAvailable);
  };

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      // Use first 30 stocks for recommendations (for performance)
      const demoStocks = INDIAN_STOCKS.slice(0, 30);
      const stocks = await getMultipleStocks(demoStocks);
      const topStocks = recommendationService.getTopStocks(stocks, 10);
      
      // Only get allocation if there's available cash
      let recommendationsWithAllocation = [];
      if (availableCash > 0) {
        recommendationsWithAllocation = recommendationService.getRecommendedAllocation(availableCash, topStocks);
      } else {
        // If no cash, just show recommendations without allocation
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
      loadPortfolioData();
      loadRecommendations();
      alert(`Successfully added ₹${amount.toLocaleString('en-IN')} to your investment account!`);
    }
  };

  const handleQuickInvest = (amount) => {
    setInvestmentAmount(amount.toString());
    setShowInvestmentDialog(true);
  };

  const handleBuyRecommended = (stock, amount) => {
    if (!amount || amount <= 0) {
      alert('Please add funds first to invest');
      setShowInvestmentDialog(true);
      return;
    }

    const quantity = Math.floor(amount / stock.price);
    if (quantity > 0) {
      portfolioService.addToPortfolio(stock, quantity, stock.price);
      loadPortfolioData();
      loadRecommendations();
      alert(`Successfully invested ₹${amount.toLocaleString('en-IN')} in ${stock.symbol}`);
    } else {
      alert('Insufficient amount to buy at least 1 share');
    }
  };

  const totalPL = currentValue - totalInvestment;
  const totalPLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

  const sectorAllocation = portfolio.reduce((acc, stock) => {
    if (stock && stock.sector && stock.totalInvested) {
      acc[stock.sector] = (acc[stock.sector] || 0) + stock.totalInvested;
    }
    return acc;
  }, {});

  const investedInStocks = portfolio.reduce((sum, stock) => sum + (stock.totalInvested || 0), 0);

  // Safe number formatting function
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${Math.max(0, amount).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Investor! 👋</h1>
            <p className="text-gray-600 mt-2">Here's your investment overview</p>
          </div>
          <button
            onClick={() => setShowInvestmentDialog(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5" />
            Add Investment
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Invested */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Invested</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalInvestment)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Available: {formatCurrency(availableCash)}
            </div>
          </div>

          {/* Current Value */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(currentValue)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className={`font-semibold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPL >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">all time</span>
            </div>
          </div>

          {/* Total P&L */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total P&L</p>
                <p className={`text-3xl font-bold mt-2 ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPL >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalPL))}
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalPL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Target className={`w-6 h-6 ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <div className="text-gray-500 text-sm mt-2">
              {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}% overall return
            </div>
          </div>

          {/* Quick Invest Buttons */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-4">Quick Invest</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleQuickInvest(5000)}
                className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                ₹5,000
              </button>
              <button 
                onClick={() => handleQuickInvest(10000)}
                className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                ₹10,000
              </button>
              <button 
                onClick={() => handleQuickInvest(25000)}
                className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                ₹25,000
              </button>
            </div>
          </div>
        </div>

        {/* Recommendations and Portfolio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Stock Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  AI Recommended Stocks
                </h3>
                <p className="text-sm text-gray-600">Top picks for your {formatCurrency(availableCash)} available</p>
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            
            {loadingRecommendations ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Add funds to see recommendations</p>
                <button 
                  onClick={() => setShowInvestmentDialog(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Funds
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recommendations.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{stock.symbol.replace('.BO', '')}</h4>
                        {stock.allocationPercent > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {stock.allocationPercent}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className={`font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                        </span>
                        <span>{formatCurrency(stock.price)}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          stock.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                          stock.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {stock.riskLevel || 'Medium'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(stock.allocationAmount || 0)}</p>
                      <p className="text-xs text-gray-600">{(stock.suggestedQuantity || 0)} shares</p>
                      <button
                        onClick={() => handleBuyRecommended(stock, stock.allocationAmount || 0)}
                        disabled={!stock.allocationAmount || stock.allocationAmount <= 0}
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Invest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Holdings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Portfolio</h3>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            
            {portfolio.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No investments yet</p>
                <p className="text-sm text-gray-600 mb-4">Add funds and start investing in recommended stocks</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {portfolio.map((stock, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{stock.symbol}</h4>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stock.quantity} shares</p>
                      <p className="text-sm text-gray-600">{formatCurrency(stock.totalInvested)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Allocation Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sector Allocation */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sector Allocation</h3>
              <PieChart className="w-5 h-5 text-gray-500" />
            </div>
            
            {Object.keys(sectorAllocation).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sector data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(sectorAllocation).map(([sector, amount]) => {
                  const percent = investedInStocks > 0 ? (amount / investedInStocks) * 100 : 0;
                  return (
                    <div key={sector}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700">{sector}</span>
                        <span className="font-semibold">{percent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Investment Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Investment Breakdown</h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Invested in Stocks</span>
                  <span className="font-semibold">
                    {totalInvestment > 0 ? ((investedInStocks / totalInvestment) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${totalInvestment > 0 ? (investedInStocks / totalInvestment) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(investedInStocks)}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Available Cash</span>
                  <span className="font-semibold">
                    {totalInvestment > 0 ? ((availableCash / totalInvestment) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${totalInvestment > 0 ? (availableCash / totalInvestment) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(availableCash)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Dialog */}
      {showInvestmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Investment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Investment Amount (₹):</label>
                <input
                  type="number"
                  min="1"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleQuickInvest(5000)}
                  className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  ₹5,000
                </button>
                <button 
                  onClick={() => handleQuickInvest(10000)}
                  className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  ₹10,000
                </button>
                <button 
                  onClick={() => handleQuickInvest(25000)}
                  className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  ₹25,000
                </button>
                <button 
                  onClick={() => handleQuickInvest(50000)}
                  className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  ₹50,000
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvestmentDialog(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvestment}
                disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;