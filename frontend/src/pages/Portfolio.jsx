import { useState, useEffect } from 'react'
import { 
  FaWallet, FaRobot, FaRegStopCircle, FaShoppingBag, FaCoins, 
  FaShieldAlt, FaTrophy, FaLayerGroup, FaMinus, 
  FaPlus, FaBolt, FaArrowRight
} from 'react-icons/fa'
import { TrendingUp, TrendingDown, RefreshCw, Activity, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Portfolio = () => {
  const navigate = useNavigate()
  const [portfolioData, setPortfolioData] = useState({
    summary: {
      currentValue: 0,
      totalInvested: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0
    },
    holdings: []
  })
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [showSellModal, setShowSellModal] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  // Mock current prices for portfolio stocks (same as Market)
  const currentPrices = {
    'RELIANCE.BO': 2950,
    'TCS.BO': 4100,
    'INFY.BO': 1650,
    'HDFCBANK.BO': 1500,
    'ICICIBANK.BO': 1100,
    'ITC.BO': 450,
    'SBIN.BO': 750,
    'HINDUNILVR.BO': 2600,
    'BHARTIARTL.BO': 1200,
    'KOTAKBANK.BO': 1800,
    'AXISBANK.BO': 1100,
    'BAJFINANCE.BO': 7200,
    'MARUTI.BO': 12500,
    'TATAMOTORS.BO': 950,
    'M&M.BO': 1850,
    'SUNPHARMA.BO': 1450,
    'DRREDDY.BO': 6200,
    'CIPLA.BO': 1400,
    'WIPRO.BO': 520,
    'TECHM.BO': 1300,
    'HCLTECH.BO': 1700,
    'NESTLEIND.BO': 2500,
    'BRITANNIA.BO': 5300,
    'LT.BO': 3500,
    'ADANIPORTS.BO': 1350,
    'NTPC.BO': 340,
    'POWERGRID.BO': 280,
    'TATASTEEL.BO': 150,
    'JSWSTEEL.BO': 850,
  }

  // Load portfolio from localStorage
  const loadPortfolioData = () => {
    console.log('Loading portfolio data from localStorage...');
    
    try {
      const savedPortfolio = localStorage.getItem('userPortfolio')
      console.log('Raw localStorage data:', savedPortfolio);
      
      if (savedPortfolio) {
        const parsedPortfolio = JSON.parse(savedPortfolio)
        console.log('Parsed portfolio:', parsedPortfolio);
        
        // Update prices for holdings
        const updatedHoldings = parsedPortfolio.holdings?.map(holding => {
          const currentPrice = currentPrices[holding.symbol] || holding.currentPrice || holding.avgPrice
          const currentValue = currentPrice * holding.quantity
          const profitLoss = currentValue - holding.totalInvested
          const profitLossPercent = holding.totalInvested > 0 ? (profitLoss / holding.totalInvested) * 100 : 0
          
          return {
            ...holding,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercent
          }
        }) || []
        
        // Update summary
        const totalInvested = updatedHoldings.reduce((sum, h) => sum + (h.totalInvested || 0), 0)
        const currentValue = updatedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
        const totalProfitLoss = currentValue - totalInvested
        const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0
        
        const updatedPortfolio = {
          summary: {
            currentValue,
            totalInvested,
            totalProfitLoss,
            totalProfitLossPercent
          },
          holdings: updatedHoldings
        }
        
        console.log('Updated portfolio to set:', updatedPortfolio);
        setPortfolioData(updatedPortfolio)
      } else {
        console.log('No portfolio found in localStorage, creating empty one');
        // Initialize empty portfolio
        const emptyPortfolio = {
          summary: {
            currentValue: 0,
            totalInvested: 0,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0
          },
          holdings: []
        }
        setPortfolioData(emptyPortfolio)
        localStorage.setItem('userPortfolio', JSON.stringify(emptyPortfolio))
      }
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error loading portfolio:', error)
      // Initialize empty portfolio
      const emptyPortfolio = {
        summary: {
          currentValue: 0,
          totalInvested: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0
        },
        holdings: []
      }
      setPortfolioData(emptyPortfolio)
      localStorage.setItem('userPortfolio', JSON.stringify(emptyPortfolio))
    } finally {
      setLoading(false)
    }
  }

  // Load portfolio on mount and listen for updates
  useEffect(() => {
    loadPortfolioData()
    
    // Listen for portfolio updates from Market page
    const handlePortfolioUpdate = () => {
      console.log('Portfolio update event received, reloading...')
      loadPortfolioData()
    }
    
    window.addEventListener('portfolioUpdated', handlePortfolioUpdate)
    
    // Also listen for storage events (when localStorage changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'userPortfolio') {
        console.log('LocalStorage changed, reloading portfolio...')
        loadPortfolioData()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('portfolioUpdated', handlePortfolioUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleSellStock = (stock) => {
    setSelectedStock(stock)
    setSellQuantity(1)
    setShowSellModal(true)
  }

  const confirmSellStock = () => {
    if (!selectedStock || sellQuantity <= 0 || sellQuantity > selectedStock.quantity) {
      alert(`Invalid quantity! You can sell maximum ${selectedStock.quantity} shares.`)
      return
    }

    const updatedPortfolio = { ...portfolioData }
    const stockIndex = updatedPortfolio.holdings.findIndex(
      h => h.id === selectedStock.id
    )

    if (stockIndex === -1) return

    if (sellQuantity === selectedStock.quantity) {
      // Remove stock completely
      updatedPortfolio.holdings.splice(stockIndex, 1)
    } else {
      // Reduce quantity
      const stock = updatedPortfolio.holdings[stockIndex]
      const newQuantity = stock.quantity - sellQuantity
      const remainingInvested = (stock.totalInvested / stock.quantity) * newQuantity
      const currentPrice = currentPrices[stock.symbol] || stock.currentPrice || stock.avgPrice
      
      updatedPortfolio.holdings[stockIndex] = {
        ...stock,
        quantity: newQuantity,
        totalInvested: remainingInvested,
        currentValue: newQuantity * currentPrice,
        profitLoss: (newQuantity * currentPrice) - remainingInvested,
        profitLossPercent: ((newQuantity * currentPrice - remainingInvested) / remainingInvested) * 100
      }
    }

    // Update portfolio summary
    updatePortfolioSummary(updatedPortfolio)
    
    // Save to localStorage
    localStorage.setItem('userPortfolio', JSON.stringify(updatedPortfolio))
    
    // Update state
    setPortfolioData(updatedPortfolio)
    setShowSellModal(false)
    setSelectedStock(null)
    
    alert(`✅ Sold ${sellQuantity} shares of ${selectedStock.symbol.replace('.BO', '')}`)
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('portfolioUpdated'))
  }

  const updatePortfolioSummary = (portfolio) => {
    const totalInvested = portfolio.holdings.reduce((sum, h) => sum + (h.totalInvested || 0), 0)
    const currentValue = portfolio.holdings.reduce((sum, h) => {
      const currentPrice = currentPrices[h.symbol] || h.currentPrice || h.avgPrice
      return sum + (currentPrice * h.quantity)
    }, 0)
    const totalProfitLoss = currentValue - totalInvested
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0
    
    portfolio.summary = {
      currentValue,
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent
    }
  }

  const refreshPortfolio = () => {
    setRefreshing(true)
    
    const updatedPortfolio = { ...portfolioData }
    
    // Update prices from currentPrices
    updatedPortfolio.holdings = updatedPortfolio.holdings.map(holding => {
      const currentPrice = currentPrices[holding.symbol] || holding.currentPrice || holding.avgPrice
      const currentValue = currentPrice * holding.quantity
      const profitLoss = currentValue - holding.totalInvested
      const profitLossPercent = holding.totalInvested > 0 ? (profitLoss / holding.totalInvested) * 100 : 0
      
      return {
        ...holding,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercent
      }
    })
    
    // Update summary
    updatePortfolioSummary(updatedPortfolio)
    
    // Update state and localStorage
    setPortfolioData(updatedPortfolio)
    localStorage.setItem('userPortfolio', JSON.stringify(updatedPortfolio))
    setLastUpdated(new Date().toLocaleTimeString())
    
    setTimeout(() => setRefreshing(false), 500)
  }

  const formatCurrency = (price) => {
    if (price === undefined || price === null) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.max(0, price))
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const totalStocks = portfolioData.holdings.length
  const totalValue = portfolioData.summary.currentValue

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-yellow-300" />
              <div className="text-sm font-medium">
                <span className="text-green-300">● Live</span> Portfolio Management
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm opacity-90">
                Updated: {lastUpdated}
              </span>
              <button
                onClick={refreshPortfolio}
                disabled={refreshing}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
                title="Refresh Portfolio"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Investment Portfolio</h1>
            <p className="text-gray-600 mt-1">Track and manage your investments</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                <FaShoppingBag className="inline w-3 h-3 mr-1" /> {totalStocks} Holdings
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <FaCoins className="inline w-3 h-3 mr-1" /> {formatCurrency(totalValue)}
              </span>
              <button
                onClick={() => navigate('/market')}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                Add Stocks
                <FaArrowRight className="w-2 h-2" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={refreshPortfolio}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/market')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaShoppingBag className="w-5 h-5" />
              Buy More Stocks
            </button>
          </div>
        </div>

        {/* Debug Console (can remove in production) */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Debug:</strong> Portfolio loaded from localStorage
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Holdings: {totalStocks} | Total Value: {formatCurrency(totalValue)}
              </p>
            </div>
            <button
              onClick={() => {
                console.log('Current portfolio data:', portfolioData)
                console.log('LocalStorage data:', localStorage.getItem('userPortfolio'))
              }}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
            >
              Log Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalValue)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <FaWallet className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-500">Invested: {formatCurrency(portfolioData.summary.totalInvested)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Returns</p>
                <p className={`text-2xl font-bold mt-1 ${portfolioData.summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioData.summary.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioData.summary.totalProfitLoss))}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {portfolioData.summary.totalProfitLossPercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-medium ${portfolioData.summary.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioData.summary.totalProfitLossPercent >= 0 ? '+' : ''}{portfolioData.summary.totalProfitLossPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Risk Level</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalStocks > 0 ? 'Medium' : 'N/A'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <FaShieldAlt className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-500">
                    {totalStocks > 0 ? 'Balanced Portfolio' : 'No holdings yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Performance</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {portfolioData.holdings.filter(h => h.profitLoss > 0).length}
                    </div>
                    <div className="text-xs text-gray-500">Winning</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">
                      {portfolioData.holdings.filter(h => h.profitLoss < 0).length}
                    </div>
                    <div className="text-xs text-gray-500">Losing</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">{totalStocks}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                <FaLayerGroup className="inline w-5 h-5 mr-2 text-purple-600" />
                My Holdings ({totalStocks})
              </h2>
              <button
                onClick={() => navigate('/market')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Add More Stocks
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {totalStocks > 0 ? (
              <div className="space-y-4">
                {portfolioData.holdings.map((holding) => (
                  <div key={holding.id || holding.symbol} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            holding.profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {holding.profitLoss >= 0 ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{holding.symbol?.replace('.BO', '') || 'Unknown'}</h3>
                            <p className="text-gray-600 text-sm">{holding.name || 'Unknown Company'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(holding.riskLevel)}`}>
                                {holding.riskLevel || 'Medium'} Risk
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {holding.sector || 'Unknown'}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                Bought: {holding.buyDate || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:text-right">
                        <div className={`text-xl font-bold ${holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.profitLoss >= 0 ? '+' : ''}{formatCurrency(holding.profitLoss || 0)}
                        </div>
                        <div className={`font-medium ${holding.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.profitLossPercent >= 0 ? '+' : ''}{(holding.profitLossPercent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs">Avg. Price</div>
                        <div className="font-bold text-gray-900">{formatCurrency(holding.avgPrice || holding.currentPrice)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs">Current Price</div>
                        <div className="font-bold text-gray-900">{formatCurrency(holding.currentPrice || holding.avgPrice)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs">Quantity</div>
                        <div className="font-bold text-gray-900">{holding.quantity || 0} shares</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs">Current Value</div>
                        <div className="font-bold text-gray-900">{formatCurrency(holding.currentValue || 0)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <FaRobot className="w-4 h-4 text-blue-600" />
                          <h4 className="font-bold text-blue-900 text-sm">AI Analysis</h4>
                        </div>
                        <p className="text-sm text-blue-800">
                          {holding.profitLossPercent > 15 ? 'Consider taking partial profits' : 
                           holding.profitLossPercent < -15 ? 'Review investment strategy' :
                           'Hold for long-term growth'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleSellStock(holding)}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                      >
                        <FaRegStopCircle className="w-4 h-4" />
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <FaShoppingBag className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your portfolio is empty</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Start building your investment portfolio by buying stocks from the market
                </p>
                <button
                  onClick={() => navigate('/market')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <FaShoppingBag className="w-5 h-5" />
                  Browse Market
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaTrophy className="w-5 h-5 text-yellow-600" />
              Top Performer
            </h3>
            {totalStocks > 0 ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">
                      {portfolioData.holdings.reduce((prev, current) => 
                        (prev.profitLossPercent > current.profitLossPercent) ? prev : current
                      ).symbol?.replace('.BO', '') || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {portfolioData.holdings.reduce((prev, current) => 
                        (prev.profitLossPercent > current.profitLossPercent) ? prev : current
                      ).name || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      +{portfolioData.holdings.reduce((prev, current) => 
                        (prev.profitLossPercent > current.profitLossPercent) ? prev : current
                      ).profitLossPercent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Best Return</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No holdings yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaRobot className="w-5 h-5 text-blue-600" />
              AI Insights
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {totalStocks > 0 
                    ? `💡 Portfolio has ${portfolioData.holdings.filter(h => h.profitLoss > 0).length} winning stocks`
                    : '💡 Start building your portfolio with quality stocks'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {totalStocks > 0 
                    ? `📈 Average return: ${(portfolioData.holdings.reduce((sum, h) => sum + (h.profitLossPercent || 0), 0) / totalStocks || 0).toFixed(1)}%`
                    : '📈 Add stocks to see performance insights'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaBolt className="w-5 h-5 text-purple-600" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/market')}
                className="block w-full text-center bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Buy More Stocks
              </button>
              <button
                onClick={refreshPortfolio}
                disabled={refreshing}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Portfolio'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sell Modal */}
      {showSellModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sell Stock</h3>
              <p className="text-gray-600 mb-6">
                How many shares of <span className="font-bold">{selectedStock.symbol?.replace('.BO', '')}</span> would you like to sell?
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current Price</p>
                    <p className="font-bold">{formatCurrency(selectedStock.currentPrice || selectedStock.avgPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="font-bold">{selectedStock.quantity} shares</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Value</p>
                    <p className="font-bold">{formatCurrency(selectedStock.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">P&L</p>
                    <p className={`font-bold ${selectedStock.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedStock.profitLoss >= 0 ? '+' : ''}{formatCurrency(selectedStock.profitLoss)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Quantity to Sell
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-l-lg border border-r-0 border-gray-300"
                  >
                    <FaMinus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedStock.quantity}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.min(selectedStock.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="flex-1 p-3 border-y border-gray-300 text-center font-bold text-lg"
                  />
                  <button
                    onClick={() => setSellQuantity(Math.min(selectedStock.quantity, sellQuantity + 1))}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-r-lg border border-l-0 border-gray-300"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <button
                    onClick={() => setSellQuantity(1)}
                    className="hover:text-gray-700"
                  >
                    Min (1)
                  </button>
                  <button
                    onClick={() => setSellQuantity(selectedStock.quantity)}
                    className="hover:text-gray-700"
                  >
                    Max ({selectedStock.quantity})
                  </button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Sale Amount:</span>
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency((selectedStock.currentPrice || selectedStock.avgPrice) * sellQuantity)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Selling {sellQuantity} shares at {formatCurrency(selectedStock.currentPrice || selectedStock.avgPrice)} each
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSellModal(false)
                    setSelectedStock(null)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSellStock}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Confirm Sell
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio