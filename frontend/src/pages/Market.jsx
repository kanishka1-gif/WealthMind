import { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import { TrendingUp, TrendingDown, RefreshCw, Eye, Plus } from 'lucide-react';
import { getMultipleStocks, INDIAN_STOCKS, portfolioService, investmentService, recommendationService } from '../services/stockApi';

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [recommendedStocks, setRecommendedStocks] = useState([]);

  // Auto-refresh and initial load
  useEffect(() => {
    fetchStocks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter stocks when search term or stocks change
  useEffect(() => {
    filterStocks();
  }, [searchTerm, stocks]);

  // Test portfolio and recommendations
  useEffect(() => {
    if (stocks.length > 0) {
      // Test portfolio
      const portfolio = portfolioService.getPortfolio();
      console.log('Current portfolio:', portfolio);
      console.log('Available cash:', investmentService.getAvailableCash());
      
      // Test recommendations
      const topStocks = recommendationService.getTopStocks(stocks, 5);
      console.log('Top recommended stocks:', topStocks);
      setRecommendedStocks(topStocks);
    }
  }, [stocks]);

  const fetchStocks = async () => {
    try {
      setRefreshing(true);
      // ✅ CHANGED: Use ALL stocks now that API is working
      const demoStocks = INDIAN_STOCKS; // No slice - use all stocks
      const stockData = await getMultipleStocks(demoStocks);
      
      setStocks(stockData);
      setFilteredStocks(stockData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterStocks = () => {
    if (!searchTerm) {
      setFilteredStocks(stocks);
      return;
    }

    const result = stocks.filter(stock =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.sector && stock.sector.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredStocks(result);
  };

  const handleBuyStock = (stock) => {
    setSelectedStock(stock);
    setBuyQuantity(1);
    setShowBuyModal(true);
  };

  const confirmBuy = () => {
    if (selectedStock && buyQuantity > 0) {
      const availableCash = investmentService.getAvailableCash();
      const totalCost = selectedStock.price * buyQuantity;
      
      if (totalCost > availableCash) {
        alert(`Insufficient funds! You need ₹${totalCost.toFixed(2)} but only have ₹${availableCash.toFixed(2)} available.`);
        return;
      }
      
      portfolioService.addToPortfolio(selectedStock, buyQuantity, selectedStock.price);
      alert(`Successfully bought ${buyQuantity} shares of ${selectedStock.symbol} for ₹${totalCost.toFixed(2)}`);
      setShowBuyModal(false);
      setSelectedStock(null);
      
      // Refresh portfolio data
      const updatedPortfolio = portfolioService.getPortfolio();
      console.log('Updated portfolio:', updatedPortfolio);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Indian Stock Market</h1>
          <p className="text-gray-600 mt-2">{stocks.length} stocks available for trading</p>
          {recommendedStocks.length > 0 && (
            <p className="text-green-600 text-sm mt-1">
              💡 Top picks: {recommendedStocks.map(s => s.symbol.replace('.BO', '')).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {lastUpdated && (
            <span className="text-sm text-gray-500">Updated: {lastUpdated}</span>
          )}
          <button
            onClick={fetchStocks}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${stocks.length} Indian stocks by name, symbol, or sector...`}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Gainers</div>
          <div className="text-2xl font-bold text-green-600">
            {stocks.filter(s => s.changePercent > 0).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Losers</div>
          <div className="text-2xl font-bold text-red-600">
            {stocks.filter(s => s.changePercent < 0).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Stocks</div>
          <div className="text-2xl font-bold text-blue-600">{stocks.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Available Cash</div>
          <div className="text-2xl font-bold text-purple-600">₹{formatPrice(investmentService.getAvailableCash())}</div>
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStocks.map((stock) => (
          <div key={stock.symbol} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{stock.symbol.replace('.BO', '')}</h3>
                <p className="text-gray-600 text-sm truncate">{stock.name}</p>
              </div>
              <button className="text-gray-400 hover:text-yellow-500 transition">
                <FaRegStar className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-gray-900">₹{formatPrice(stock.price)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Change:</span>
                <div className="flex items-center gap-1">
                  {stock.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sector:</span>
                <span className="text-sm text-gray-700">{stock.sector}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  stock.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                  stock.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stock.riskLevel}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => handleBuyStock(stock)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Buy
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Buy Stock</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className="font-semibold">{selectedStock.symbol.replace('.BO', '')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-semibold">₹{formatPrice(selectedStock.price)}</span>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between text-lg font-semibold border-t pt-4">
                <span>Total Amount:</span>
                <span>₹{formatPrice(selectedStock.price * buyQuantity)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Available Cash:</span>
                <span>₹{formatPrice(investmentService.getAvailableCash())}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                Confirm Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No stocks found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default Market;