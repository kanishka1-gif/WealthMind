import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowUp, FaArrowDown, FaWallet, FaChartLine, FaHistory, FaRobot, FaRegStopCircle, FaPlayCircle, FaExclamationTriangle } from 'react-icons/fa'
import { portfolioService, portfolioAnalyticsService, investmentService, getMultipleStocks } from '../services/stockApi'

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('holdings')
  const [selectedStock, setSelectedStock] = useState(null)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [showSellModal, setShowSellModal] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState({})

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      console.log('🔄 Fetching portfolio data...')
      
      // Get current market data for portfolio stocks
      const currentStocks = await getCurrentPortfolioStocks()
      console.log('📊 Current stocks:', currentStocks)
      
      const portfolioStats = portfolioService.getPortfolioStats(currentStocks)
      console.log('💼 Portfolio stats:', portfolioStats)
      
      // Generate AI analysis for each holding
      const analysis = generateAIAnalysis(portfolioStats.portfolio, currentStocks)
      
      setPortfolioData({
        ...portfolioStats.summary,
        holdings: portfolioStats.portfolio,
        allocation: portfolioStats.allocation
      })
      setAiAnalysis(analysis)
      
      // For demo, create mock orders from portfolio
      const mockOrders = generateMockOrders(portfolioStats.portfolio)
      setOrders(mockOrders)
      
    } catch (error) {
      console.error('❌ Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPortfolioStocks = async () => {
    const portfolio = portfolioService.getPortfolio()
    console.log('📁 Portfolio from localStorage:', portfolio)
    
    if (portfolio.length === 0) {
      console.log('ℹ️ No stocks in portfolio')
      return []
    }
    
    const symbols = portfolio.map(stock => stock.symbol)
    console.log('🔍 Fetching data for symbols:', symbols)
    
    try {
      const stocks = await getMultipleStocks(symbols)
      console.log('✅ Fetched stock data:', stocks)
      return stocks
    } catch (error) {
      console.error('❌ Error fetching stock data:', error)
      return []
    }
  }

  const generateAIAnalysis = (holdings, currentStocks) => {
    const analysis = {}
    
    holdings.forEach(holding => {
      const currentStock = currentStocks.find(s => s.symbol === holding.symbol)
      if (!currentStock) return
      
      const profitLossPercent = holding.profitLossPercent || 0
      const daysHeld = Math.floor((new Date() - new Date(holding.buyDate)) / (1000 * 60 * 60 * 24))
      const recentPerformance = currentStock.changePercent || 0
      
      let recommendation = 'HOLD'
      let confidence = 70
      let reasoning = []
      
      // AI Analysis Logic
      if (profitLossPercent > 25) {
        recommendation = 'SELL'
        confidence = 85
        reasoning.push('Strong profit taking opportunity')
        reasoning.push('Consider locking in gains')
      } else if (profitLossPercent < -15) {
        recommendation = 'HOLD'
        confidence = 75
        reasoning.push('Stock is oversold, potential recovery')
        reasoning.push('Average down if fundamentals are strong')
      } else if (profitLossPercent < -25) {
        recommendation = 'SELL'
        confidence = 80
        reasoning.push('Significant loss, consider cutting position')
        reasoning.push('Risk management recommended')
      }
      
      // Recent performance analysis
      if (recentPerformance > 8) {
        recommendation = 'SELL'
        confidence = Math.max(confidence, 75)
        reasoning.push('Recent strong momentum, profit booking opportunity')
      } else if (recentPerformance < -8) {
        if (recommendation === 'SELL') {
          reasoning.push('Recent weakness confirms sell decision')
        } else {
          recommendation = 'HOLD'
          reasoning.push('Recent weakness, wait for stabilization')
        }
      }
      
      // Holding period analysis
      if (daysHeld < 30 && profitLossPercent > 15) {
        recommendation = 'SELL'
        confidence = 90
        reasoning.push('Short-term gain, consider tax implications')
      } else if (daysHeld > 365 && profitLossPercent > 0) {
        recommendation = 'HOLD'
        reasoning.push('Long-term holding with gains, favorable tax treatment')
      }
      
      analysis[holding.symbol] = {
        recommendation,
        confidence,
        reasoning,
        riskLevel: holding.riskLevel,
        sector: holding.sector
      }
    })
    
    return analysis
  }

  const generateMockOrders = (holdings) => {
    return holdings.map((holding, index) => ({
      _id: `order-${index}`,
      symbol: holding.symbol,
      orderType: 'BUY',
      quantity: holding.quantity,
      price: holding.avgPrice,
      totalAmount: holding.totalInvested,
      status: 'COMPLETED',
      executedAt: holding.buyDate
    }))
  }

  const handleSellStock = (stock) => {
    setSelectedStock(stock)
    setSellQuantity(1)
    setShowSellModal(true)
  }

  const confirmSell = () => {
    if (selectedStock && sellQuantity > 0) {
      if (sellQuantity > selectedStock.quantity) {
        alert(`You only have ${selectedStock.quantity} shares to sell!`)
        return
      }
      
      portfolioService.removeFromPortfolio(selectedStock.symbol, sellQuantity)
      alert(`Successfully sold ${sellQuantity} shares of ${selectedStock.symbol}`)
      setShowSellModal(false)
      setSelectedStock(null)
      fetchPortfolioData() // Refresh data
    }
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-100'
      case 'SELL': return 'text-red-600 bg-red-100'
      case 'HOLD': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'SELL': return <FaRegStopCircle className="inline mr-1" />
      case 'HOLD': return <FaRegStopCircle className="inline mr-1" />
      default: return <FaPlayCircle className="inline mr-1" />
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(price)
  }

  // Calculate risk score manually if analytics service fails
  const calculateRiskScore = () => {
    if (!portfolioData?.holdings) return 0
    
    const riskWeights = { 'Low': 0.3, 'Medium': 0.6, 'High': 0.9 }
    let totalWeight = 0
    let count = 0
    
    portfolioData.holdings.forEach(holding => {
      totalWeight += riskWeights[holding.riskLevel] || 0.6
      count++
    })
    
    return count > 0 ? Math.round((totalWeight / count) * 100) : 0
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const riskScore = calculateRiskScore()
  const riskRecommendation = riskScore < 40 ? 'Conservative' : riskScore < 70 ? 'Moderate' : 'Aggressive'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <p className="text-gray-600 mt-2">AI-powered investment tracking and analysis</p>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <FaRobot className="text-xl" />
            <span className="font-medium">AI Analysis Active</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Total Invested</h3>
            <FaWallet className="text-2xl opacity-80" />
          </div>
          <p className="text-3xl font-bold">₹{formatPrice(portfolioData?.totalInvested || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Current Value</h3>
            <FaChartLine className="text-2xl opacity-80" />
          </div>
          <p className="text-3xl font-bold">₹{formatPrice(portfolioData?.currentValue || 0)}</p>
        </div>

        <div className={`bg-gradient-to-br ${(portfolioData?.totalProfitLoss || 0) >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} rounded-lg shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Total Returns</h3>
            {(portfolioData?.totalProfitLoss || 0) >= 0 ? (
              <FaArrowUp className="text-2xl opacity-80" />
            ) : (
              <FaArrowDown className="text-2xl opacity-80" />
            )}
          </div>
          <p className="text-3xl font-bold">₹{formatPrice(portfolioData?.totalProfitLoss || 0)}</p>
          <p className="text-sm mt-1 opacity-90">
            {(portfolioData?.totalProfitLoss || 0) >= 0 ? '+' : ''}{portfolioData?.totalProfitLossPercent?.toFixed(2) || '0.00'}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium opacity-90">Risk Score</h3>
            <FaExclamationTriangle className="text-2xl opacity-80" />
          </div>
          <p className="text-3xl font-bold">{riskScore}/100</p>
          <p className="text-sm mt-1 opacity-90 capitalize">
            {riskRecommendation}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex-1 px-6 py-4 text-center font-medium transition ${
              activeTab === 'holdings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Analysis ({portfolioData?.holdings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 text-center font-medium transition ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaHistory className="inline mr-2" />
            Order History ({orders?.length || 0})
          </button>
        </div>

        {/* Holdings Tab with AI Analysis */}
        {activeTab === 'holdings' && (
          <div className="p-6">
            {portfolioData?.holdings && portfolioData.holdings.length > 0 ? (
              <div className="space-y-6">
                {portfolioData.holdings.map((holding, index) => {
                  const analysis = aiAnalysis[holding.symbol]
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                      {/* Stock Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{holding.symbol.replace('.BO', '')}</h3>
                            {analysis && (
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationColor(analysis.recommendation)}`}>
                                {getRecommendationIcon(analysis.recommendation)}
                                {analysis.recommendation} ({analysis.confidence}%)
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{holding.name}</p>
                          <p className="text-sm text-gray-500">{holding.quantity} shares • {holding.sector}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSellStock(holding)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition flex items-center"
                          >
                            <FaRegStopCircle className="mr-2" />
                            Sell
                          </button>
                          <Link
                            to={`/market`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                          >
                            Trade
                          </Link>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Avg. Buy Price</p>
                          <p className="font-semibold text-gray-900">₹{formatPrice(holding.avgPrice)}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Current Price</p>
                          <p className="font-semibold text-gray-900">₹{formatPrice(holding.currentPrice)}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Total Invested</p>
                          <p className="font-semibold text-gray-900">₹{formatPrice(holding.totalInvested)}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Current Value</p>
                          <p className="font-semibold text-gray-900">₹{formatPrice(holding.currentValue)}</p>
                        </div>
                      </div>

                      {/* Profit/Loss */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Profit/Loss</span>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${(holding.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(holding.profitLoss || 0) >= 0 ? '+' : ''}₹{formatPrice(holding.profitLoss || 0)}
                            </p>
                            <p className={`text-sm ${(holding.profitLossPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({(holding.profitLossPercent || 0) >= 0 ? '+' : ''}{(holding.profitLossPercent || 0).toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {analysis && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaRobot className="text-blue-600 mr-2" />
                            <h4 className="font-semibold text-blue-900">AI Analysis</h4>
                          </div>
                          <div className="space-y-2">
                            {analysis.reasoning.map((reason, idx) => (
                              <p key={idx} className="text-sm text-blue-800 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {reason}
                              </p>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">Risk Level: {analysis.riskLevel}</span>
                              <span className="text-blue-700">Sector: {analysis.sector}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No holdings yet</p>
                <Link
                  to="/market"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Start Investing
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-6">
            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(order.executedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.symbol}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            order.orderType === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {order.orderType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{formatPrice(order.price)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{formatPrice(order.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {showSellModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sell Stock</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className="font-semibold">{selectedStock.symbol.replace('.BO', '')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-semibold">₹{formatPrice(selectedStock.currentPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Available Shares:</span>
                <span className="font-semibold">{selectedStock.quantity}</span>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantity to Sell:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedStock.quantity}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-between text-lg font-semibold border-t pt-4">
                <span>Total Amount:</span>
                <span>₹{formatPrice(selectedStock.currentPrice * sellQuantity)}</span>
              </div>

              {aiAnalysis[selectedStock.symbol] && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>AI Recommendation:</strong> {aiAnalysis[selectedStock.symbol].recommendation}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSellModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSell}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio