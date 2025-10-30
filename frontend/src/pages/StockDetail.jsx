import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft, FaArrowUp, FaArrowDown } from 'react-icons/fa'

const StockDetail = () => {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderType, setOrderType] = useState('BUY')
  const [quantity, setQuantity] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchStockDetails()
  }, [symbol])

  const fetchStockDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/market/${symbol}`)
      setStock(response.data.stock)
    } catch (error) {
      console.error('Error fetching stock:', error)
      setMessage({ type: 'error', text: 'Stock not found' })
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setMessage({ type: '', text: '' })

    try {
      const endpoint = orderType === 'BUY' ? '/orders/buy' : '/orders/sell'
      const response = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        symbol: stock.symbol,
        quantity: parseInt(quantity)
      })

      setMessage({ 
        type: 'success', 
        text: `${orderType} order placed successfully! Total: ₹${response.data.order.totalAmount.toFixed(2)}` 
      })
      
      setTimeout(() => {
        navigate('/portfolio')
      }, 2000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Order failed. Please try again.' 
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Stock not found</p>
          <Link to="/market" className="text-blue-600 hover:underline">
            ← Back to Market
          </Link>
        </div>
      </div>
    )
  }

  const totalAmount = stock.price * quantity

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Back Button */}
      <Link
        to="/market"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Market
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Stock Info */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
                <p className="text-lg text-gray-600">{stock.name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                stock.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                stock.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {stock.riskLevel} Risk
              </span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">₹{stock.price.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                {stock.changePercent >= 0 ? (
                  <FaArrowUp className="text-green-600 mr-2" />
                ) : (
                  <FaArrowDown className="text-red-600 mr-2" />
                )}
                <span className={`text-lg font-semibold ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sector</p>
                <p className="font-semibold text-gray-900">{stock.sector}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Market Cap</p>
                <p className="font-semibold text-gray-900">{stock.marketCap}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">P/E Ratio</p>
                <p className="font-semibold text-gray-900">{stock.pe_ratio}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Volatility</p>
                <p className="font-semibold text-gray-900">{stock.volatility}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Avg Return</p>
                <p className="font-semibold text-green-600">{stock.avgReturn}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Dividend Yield</p>
                <p className="font-semibold text-gray-900">{stock.dividendYield}%</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{stock.description}</p>
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trade {stock.symbol}</h2>

            {message.text && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              </div>
            )}

            <form onSubmit={handleTrade} className="space-y-4">
              {/* Buy/Sell Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('BUY')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    orderType === 'BUY'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('SELL')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    orderType === 'SELL'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per share:</span>
                  <span className="font-semibold text-gray-900">₹{stock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-900">{quantity}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-blue-600 text-lg">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  orderType === 'BUY'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? 'Processing...' : `${orderType} Now`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockDetail