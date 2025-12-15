import { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, FaStar, FaRegStar, FaFilter, FaTrophy, FaShieldAlt, FaRupeeSign, FaChartLine,
  FaIndustry, FaMoneyBillWave, FaHospital, FaCar, FaPlane,
  FaShoppingCart, FaHome, FaWifi, FaMobileAlt, FaOilCan, FaArrowRight
} from 'react-icons/fa';
import { 
  TrendingUp, TrendingDown, RefreshCw, Eye, Plus, 
  BarChart3, Wallet, Crown, ChevronUp, ChevronDown,
  Hash, ArrowUpRight, ArrowDownRight, Activity, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Extended Indian stocks list with proper names
const INDIAN_STOCKS_DATA = [
  // Large Cap - Nifty 50 Companies
  { symbol: 'RELIANCE.BO', name: 'Reliance Industries', sector: 'Conglomerate', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'TCS.BO', name: 'Tata Consultancy Services', sector: 'IT', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'HDFCBANK.BO', name: 'HDFC Bank', sector: 'Banking', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'ICICIBANK.BO', name: 'ICICI Bank', sector: 'Banking', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'INFY.BO', name: 'Infosys', sector: 'IT', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'HINDUNILVR.BO', name: 'Hindustan Unilever', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'ITC.BO', name: 'ITC Limited', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'SBIN.BO', name: 'State Bank of India', sector: 'Banking', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'BHARTIARTL.BO', name: 'Bharti Airtel', sector: 'Telecom', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'KOTAKBANK.BO', name: 'Kotak Mahindra Bank', sector: 'Banking', riskLevel: 'Low', category: 'Large Cap' },
  
  // Banking & Financial Services
  { symbol: 'AXISBANK.BO', name: 'Axis Bank', sector: 'Banking', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'BAJFINANCE.BO', name: 'Bajaj Finance', sector: 'Finance', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'HDFC.BO', name: 'Housing Development Finance Corp', sector: 'Finance', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'ICICIPRULI.BO', name: 'ICICI Prudential Life', sector: 'Insurance', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'SBILIFE.BO', name: 'SBI Life Insurance', sector: 'Insurance', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'BAJAJFINSV.BO', name: 'Bajaj Finserv', sector: 'Finance', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'MUTHOOTFIN.BO', name: 'Muthoot Finance', sector: 'Finance', riskLevel: 'High', category: 'Mid Cap' },
  
  // Automobile
  { symbol: 'MARUTI.BO', name: 'Maruti Suzuki', sector: 'Automobile', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'TATAMOTORS.BO', name: 'Tata Motors', sector: 'Automobile', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'M&M.BO', name: 'Mahindra & Mahindra', sector: 'Automobile', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'BAJAJ-AUTO.BO', name: 'Bajaj Auto', sector: 'Automobile', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'HEROMOTOCO.BO', name: 'Hero MotoCorp', sector: 'Automobile', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'EICHERMOT.BO', name: 'Eicher Motors', sector: 'Automobile', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'ASHOKLEY.BO', name: 'Ashok Leyland', sector: 'Automobile', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'TVSMOTOR.BO', name: 'TVS Motor Company', sector: 'Automobile', riskLevel: 'Medium', category: 'Mid Cap' },
  
  // Pharmaceuticals & Healthcare
  { symbol: 'SUNPHARMA.BO', name: 'Sun Pharmaceutical', sector: 'Pharmaceutical', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'DRREDDY.BO', name: 'Dr. Reddys Laboratories', sector: 'Pharmaceutical', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'CIPLA.BO', name: 'Cipla', sector: 'Pharmaceutical', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'DIVISLAB.BO', name: 'Divis Laboratories', sector: 'Pharmaceutical', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'BIOCON.BO', name: 'Biocon', sector: 'Pharmaceutical', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'LUPIN.BO', name: 'Lupin', sector: 'Pharmaceutical', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'AUROPHARMA.BO', name: 'Aurobindo Pharma', sector: 'Pharmaceutical', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'TORNTPHARM.BO', name: 'Torrent Pharmaceuticals', sector: 'Pharmaceutical', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'APOLLOHOSP.BO', name: 'Apollo Hospitals', sector: 'Healthcare', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'FORTIS.BO', name: 'Fortis Healthcare', sector: 'Healthcare', riskLevel: 'High', category: 'Small Cap' },
  
  // IT & Technology
  { symbol: 'WIPRO.BO', name: 'Wipro', sector: 'IT', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'TECHM.BO', name: 'Tech Mahindra', sector: 'IT', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'HCLTECH.BO', name: 'HCL Technologies', sector: 'IT', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'MINDTREE.BO', name: 'Mindtree', sector: 'IT', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'MPHASIS.BO', name: 'Mphasis', sector: 'IT', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'LTIM.BO', name: 'LTIMindtree', sector: 'IT', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'PERSISTENT.BO', name: 'Persistent Systems', sector: 'IT', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'COFORGE.BO', name: 'Coforge', sector: 'IT', riskLevel: 'Medium', category: 'Mid Cap' },
  
  // FMCG & Consumer Goods
  { symbol: 'NESTLEIND.BO', name: 'Nestle India', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'BRITANNIA.BO', name: 'Britannia Industries', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'DABUR.BO', name: 'Dabur India', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'GODREJCP.BO', name: 'Godrej Consumer Products', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'MARICO.BO', name: 'Marico', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'JUBLFOOD.BO', name: 'Jubilant FoodWorks', sector: 'FMCG', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'TATACONSUM.BO', name: 'Tata Consumer Products', sector: 'FMCG', riskLevel: 'Low', category: 'Large Cap' },
  
  // Infrastructure & Engineering
  { symbol: 'LT.BO', name: 'Larsen & Toubro', sector: 'Infrastructure', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'ADANIPORTS.BO', name: 'Adani Ports', sector: 'Infrastructure', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'ADANIENT.BO', name: 'Adani Enterprises', sector: 'Conglomerate', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'ULTRACEMCO.BO', name: 'UltraTech Cement', sector: 'Cement', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'SHREECEM.BO', name: 'Shree Cement', sector: 'Cement', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'GRASIM.BO', name: 'Grasim Industries', sector: 'Cement', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'AMBUJACEM.BO', name: 'Ambuja Cements', sector: 'Cement', riskLevel: 'Medium', category: 'Large Cap' },
  
  // Energy & Power
  { symbol: 'NTPC.BO', name: 'NTPC', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'POWERGRID.BO', name: 'Power Grid Corporation', sector: 'Energy', riskLevel: 'Low', category: 'Large Cap' },
  { symbol: 'TATAPOWER.BO', name: 'Tata Power', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'ONGC.BO', name: 'Oil & Natural Gas Corp', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'IOC.BO', name: 'Indian Oil Corporation', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'BPCL.BO', name: 'Bharat Petroleum', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'HINDPETRO.BO', name: 'Hindustan Petroleum', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'GAIL.BO', name: 'GAIL India', sector: 'Energy', riskLevel: 'Medium', category: 'Large Cap' },
  
  // Metals & Mining
  { symbol: 'TATASTEEL.BO', name: 'Tata Steel', sector: 'Metals', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'JSWSTEEL.BO', name: 'JSW Steel', sector: 'Metals', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'HINDALCO.BO', name: 'Hindalco Industries', sector: 'Metals', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'VEDL.BO', name: 'Vedanta Limited', sector: 'Metals', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'SAIL.BO', name: 'Steel Authority of India', sector: 'Metals', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'NMDC.BO', name: 'NMDC', sector: 'Mining', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'COALINDIA.BO', name: 'Coal India', sector: 'Mining', riskLevel: 'Medium', category: 'Large Cap' },
  
  // Telecom & Media
  { symbol: 'VODAFONEIDEA.BO', name: 'Vodafone Idea', sector: 'Telecom', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'ZEEENTERTAIN.BO', name: 'Zee Entertainment', sector: 'Media', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'SUNTV.BO', name: 'Sun TV Network', sector: 'Media', riskLevel: 'Medium', category: 'Mid Cap' },
  
  // Real Estate
  { symbol: 'DLF.BO', name: 'DLF Limited', sector: 'Real Estate', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'SOBHA.BO', name: 'Sobha Limited', sector: 'Real Estate', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'PRESTIGE.BO', name: 'Prestige Estates', sector: 'Real Estate', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'GODREJPROP.BO', name: 'Godrej Properties', sector: 'Real Estate', riskLevel: 'High', category: 'Mid Cap' },
  
  // Chemicals
  { symbol: 'PIDILITIND.BO', name: 'Pidilite Industries', sector: 'Chemicals', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'UPL.BO', name: 'UPL Limited', sector: 'Chemicals', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'SRF.BO', name: 'SRF Limited', sector: 'Chemicals', riskLevel: 'Medium', category: 'Large Cap' },
  
  // Aviation
  { symbol: 'INDIGO.BO', name: 'InterGlobe Aviation', sector: 'Aviation', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'SPICEJET.BO', name: 'SpiceJet', sector: 'Aviation', riskLevel: 'High', category: 'Small Cap' },
  
  // Retail
  { symbol: 'TRENT.BO', name: 'Trent Limited', sector: 'Retail', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'V-MART.BO', name: 'V-Mart Retail', sector: 'Retail', riskLevel: 'High', category: 'Small Cap' },
  { symbol: 'TITAN.BO', name: 'Titan Company', sector: 'Retail', riskLevel: 'Medium', category: 'Large Cap' },
  
  // Logistics
  { symbol: 'DELHIVERY.BO', name: 'Delhivery', sector: 'Logistics', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'CONCOR.BO', name: 'Container Corporation', sector: 'Logistics', riskLevel: 'Medium', category: 'Mid Cap' },
  
  // New Age Tech
  { symbol: 'ZOMATO.BO', name: 'Zomato', sector: 'E-commerce', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'PAYTM.BO', name: 'Paytm', sector: 'Fintech', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'NYKAA.BO', name: 'Nykaa', sector: 'E-commerce', riskLevel: 'High', category: 'Large Cap' },
  { symbol: 'POLICYBZR.BO', name: 'PB Fintech', sector: 'Fintech', riskLevel: 'High', category: 'Mid Cap' },
  
  // Mid Cap Growth Stocks
  { symbol: 'ABCAPITAL.BO', name: 'Aditya Birla Capital', sector: 'Finance', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'BANDHANBNK.BO', name: 'Bandhan Bank', sector: 'Banking', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'GLENMARK.BO', name: 'Glenmark Pharma', sector: 'Pharmaceutical', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'ALKEM.BO', name: 'Alkem Laboratories', sector: 'Pharmaceutical', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'HAVELLS.BO', name: 'Havells India', sector: 'Consumer Goods', riskLevel: 'Low', category: 'Mid Cap' },
  { symbol: 'SIEMENS.BO', name: 'Siemens India', sector: 'Industrial', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'BOSCHLTD.BO', name: 'Bosch India', sector: 'Automobile', riskLevel: 'Medium', category: 'Mid Cap' },
  
  // Small Cap High Growth
  { symbol: 'IRB.BO', name: 'IRB Infrastructure', sector: 'Infrastructure', riskLevel: 'High', category: 'Small Cap' },
  { symbol: 'LODHA.BO', name: 'Macrotech Developers', sector: 'Real Estate', riskLevel: 'High', category: 'Small Cap' },
  { symbol: 'SUZLON.BO', name: 'Suzlon Energy', sector: 'Renewable', riskLevel: 'High', category: 'Small Cap' },
  { symbol: 'IREDA.BO', name: 'IREDA', sector: 'Green Energy', riskLevel: 'Medium', category: 'Small Cap' },
  
  // PSU Banks
  { symbol: 'PNB.BO', name: 'Punjab National Bank', sector: 'Banking', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'BANKBARODA.BO', name: 'Bank of Baroda', sector: 'Banking', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'CANBK.BO', name: 'Canara Bank', sector: 'Banking', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'UNIONBANK.BO', name: 'Union Bank of India', sector: 'Banking', riskLevel: 'Medium', category: 'Mid Cap' },
  { symbol: 'IOB.BO', name: 'Indian Overseas Bank', sector: 'Banking', riskLevel: 'High', category: 'Small Cap' },
  
  // Private Banks
  { symbol: 'FEDERALBNK.BO', name: 'Federal Bank', sector: 'Banking', riskLevel: 'Low', category: 'Mid Cap' },
  { symbol: 'IDFCFIRSTB.BO', name: 'IDFC First Bank', sector: 'Banking', riskLevel: 'High', category: 'Mid Cap' },
  { symbol: 'INDUSINDBK.BO', name: 'IndusInd Bank', sector: 'Banking', riskLevel: 'Medium', category: 'Large Cap' },
  { symbol: 'YESBANK.BO', name: 'Yes Bank', sector: 'Banking', riskLevel: 'High', category: 'Mid Cap' },
  
  // Total: 100+ stocks
];

const Market = () => {
  const navigate = useNavigate();
  
  // State declarations
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // User's portfolio state (loaded from localStorage)
  const [userPortfolio, setUserPortfolio] = useState({ holdings: [], summary: {} });
  const [availableCash, setAvailableCash] = useState(1000000); // ₹10,00,000 initial cash

  // Filters state
  const [filters, setFilters] = useState({
    sector: 'all',
    riskLevel: 'all',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    showWatchlist: false
  });

  // Initialize stocks with mock data
  useEffect(() => {
    // Load user's portfolio from localStorage
    const savedPortfolio = localStorage.getItem('userPortfolio');
    if (savedPortfolio) {
      try {
        const portfolio = JSON.parse(savedPortfolio);
        setUserPortfolio(portfolio);
        console.log('Portfolio loaded from localStorage:', portfolio);
      } catch (error) {
        console.error('Error parsing portfolio from localStorage:', error);
        // Initialize with empty portfolio
        const emptyPortfolio = {
          summary: {
            currentValue: 0,
            totalInvested: 0,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0
          },
          holdings: []
        };
        setUserPortfolio(emptyPortfolio);
        localStorage.setItem('userPortfolio', JSON.stringify(emptyPortfolio));
      }
    } else {
      // Initialize with empty portfolio
      const emptyPortfolio = {
        summary: {
          currentValue: 0,
          totalInvested: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0
        },
        holdings: []
      };
      setUserPortfolio(emptyPortfolio);
      localStorage.setItem('userPortfolio', JSON.stringify(emptyPortfolio));
    }

    // Initialize stocks with mock data
    const mockStocks = INDIAN_STOCKS_DATA.map(stock => {
      const basePrice = Math.random() * 5000 + 100;
      const changePercent = (Math.random() * 8 - 4);
      const change = basePrice * (changePercent / 100);
      
      return {
        ...stock,
        price: parseFloat(basePrice.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        isWatched: Math.random() > 0.8,
        recommended: Math.random() > 0.7,
        volume: Math.floor(Math.random() * 1000000) + 10000,
        marketCap: Math.floor(Math.random() * 100000) + 1000,
        dividendYield: parseFloat((Math.random() * 3).toFixed(2))
      };
    });

    setStocks(mockStocks);
    setFilteredStocks(mockStocks);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  }, []);

  // Apply filters when filters, stocks, or search term change
  useEffect(() => {
    let result = [...stocks];

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(stock =>
        stock.name.toLowerCase().includes(term) ||
        stock.symbol.toLowerCase().replace('.BO', '').includes(term) ||
        stock.sector.toLowerCase().includes(term)
      );
    }

    // Apply quick filters
    switch (activeFilter) {
      case 'gainers':
        result = result.filter(s => s.changePercent > 0);
        break;
      case 'losers':
        result = result.filter(s => s.changePercent < 0);
        break;
      case 'watchlist':
        result = result.filter(s => s.isWatched);
        break;
      case 'recommended':
        result = result.filter(s => s.recommended);
        break;
      case 'highRisk':
        result = result.filter(s => s.riskLevel === 'High');
        break;
      case 'lowRisk':
        result = result.filter(s => s.riskLevel === 'Low');
        break;
      case 'dividend':
        result = result.filter(s => s.dividendYield > 1.5);
        break;
    }

    // Apply advanced filters
    if (filters.sector !== 'all') {
      result = result.filter(s => s.sector === filters.sector);
    }
    if (filters.riskLevel !== 'all') {
      result = result.filter(s => s.riskLevel === filters.riskLevel);
    }
    if (filters.category !== 'all') {
      result = result.filter(s => s.category === filters.category);
    }
    if (filters.minPrice) {
      result = result.filter(s => s.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(s => s.price <= parseFloat(filters.maxPrice));
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priceHigh':
          return b.price - a.price;
        case 'priceLow':
          return a.price - b.price;
        case 'changeHigh':
          return b.changePercent - a.changePercent;
        case 'changeLow':
          return a.changePercent - b.changePercent;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'volumeHigh':
          return b.volume - a.volume;
        case 'dividendHigh':
          return b.dividendYield - a.dividendYield;
        default:
          return 0;
      }
    });

    setFilteredStocks(result);
  }, [filters, stocks, sortBy, activeFilter, searchTerm]);

  // Function to buy stock from market
  const handleBuyStock = (stock) => {
    setSelectedStock(stock);
    setBuyQuantity(1);
    setShowBuyModal(true);
  };

  const confirmBuy = () => {
    if (!selectedStock || buyQuantity <= 0) return;

    const totalCost = selectedStock.price * buyQuantity;
    
    if (totalCost > availableCash) {
      alert(`Insufficient funds! You need ₹${totalCost.toFixed(2)} but only have ₹${availableCash.toFixed(2)} available.`);
      return;
    }
    
    // Get current portfolio from localStorage
    let currentPortfolio = { 
      summary: {
        currentValue: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0
      },
      holdings: [] 
    };
    
    const savedPortfolio = localStorage.getItem('userPortfolio');
    if (savedPortfolio) {
      try {
        currentPortfolio = JSON.parse(savedPortfolio);
        console.log('Loaded portfolio for update:', currentPortfolio);
      } catch (error) {
        console.error('Error parsing portfolio from localStorage:', error);
        // Continue with empty portfolio
      }
    }
    
    // Check if stock already exists in portfolio
    const existingIndex = currentPortfolio.holdings.findIndex(
      h => h.symbol === selectedStock.symbol
    );

    if (existingIndex >= 0) {
      // Update existing stock
      const existing = currentPortfolio.holdings[existingIndex];
      const newQuantity = existing.quantity + buyQuantity;
      const newTotalInvested = existing.totalInvested + totalCost;
      const newAvgPrice = newTotalInvested / newQuantity;
      
      currentPortfolio.holdings[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        avgPrice: newAvgPrice,
        totalInvested: newTotalInvested,
        currentValue: selectedStock.price * newQuantity,
        profitLoss: (selectedStock.price * newQuantity) - newTotalInvested,
        profitLossPercent: ((selectedStock.price * newQuantity - newTotalInvested) / newTotalInvested) * 100
      };
    } else {
      // Add new holding to portfolio
      const newHolding = {
        id: Date.now(),
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        avgPrice: selectedStock.price,
        currentPrice: selectedStock.price,
        quantity: buyQuantity,
        totalInvested: totalCost,
        currentValue: totalCost,
        profitLoss: 0,
        profitLossPercent: 0,
        riskLevel: selectedStock.riskLevel,
        sector: selectedStock.sector,
        buyDate: new Date().toISOString().split('T')[0]
      };
      currentPortfolio.holdings.push(newHolding);
      console.log('Added new holding:', newHolding);
    }

    // Update portfolio summary
    const totalInvested = currentPortfolio.holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const currentValue = currentPortfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfitLoss = currentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    
    currentPortfolio.summary = {
      currentValue,
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent
    };

    console.log('Updated portfolio to save:', currentPortfolio);

    // Save updated portfolio to localStorage
    localStorage.setItem('userPortfolio', JSON.stringify(currentPortfolio));
    
    // Update local state
    setUserPortfolio(currentPortfolio);
    
    // Deduct from available cash
    setAvailableCash(prev => prev - totalCost);
    
    // Close modal and show success message
    setShowBuyModal(false);
    setSelectedStock(null);
    
    alert(`✅ Successfully purchased ${buyQuantity} shares of ${selectedStock.symbol.replace('.BO', '')} for ₹${totalCost.toFixed(2)}`);
    
    // Dispatch event to notify Portfolio page
    window.dispatchEvent(new Event('portfolioUpdated'));
  };

  const toggleWatchlist = (symbol) => {
    setStocks(prev => prev.map(stock => 
      stock.symbol === symbol 
        ? { ...stock, isWatched: !stock.isWatched }
        : stock
    ));
  };

  const refreshData = () => {
    setRefreshing(true);
    const updatedStocks = stocks.map(stock => {
      const change = Math.random() * 6 - 3; // -3% to +3%
      const newPrice = stock.price * (1 + change / 100);
      
      return {
        ...stock,
        price: parseFloat(newPrice.toFixed(2)),
        changePercent: parseFloat(change.toFixed(2)),
        change: parseFloat((stock.price * change / 100).toFixed(2))
      };
    });
    
    setStocks(updatedStocks);
    setLastUpdated(new Date().toLocaleTimeString());
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(price || 0);
  };

  const getSectorIcon = (sector) => {
    switch(sector) {
      case 'IT': return <FaWifi className="w-4 h-4 text-blue-500" />;
      case 'Banking': return <FaMoneyBillWave className="w-4 h-4 text-green-500" />;
      case 'Finance': return <Wallet className="w-4 h-4 text-green-600" />;
      case 'FMCG': return <FaShoppingCart className="w-4 h-4 text-yellow-500" />;
      case 'Pharmaceutical': return <FaHospital className="w-4 h-4 text-red-500" />;
      case 'Healthcare': return <FaShieldAlt className="w-4 h-4 text-pink-500" />;
      case 'Automobile': return <FaCar className="w-4 h-4 text-purple-500" />;
      case 'Energy': return <FaOilCan className="w-4 h-4 text-orange-500" />;
      case 'Telecom': return <FaMobileAlt className="w-4 h-4 text-cyan-500" />;
      case 'Infrastructure': return <FaIndustry className="w-4 h-4 text-gray-600" />;
      case 'Real Estate': return <FaHome className="w-4 h-4 text-yellow-600" />;
      case 'Cement': return <FaIndustry className="w-4 h-4 text-gray-700" />;
      case 'Metals': return <FaIndustry className="w-4 h-4 text-gray-800" />;
      case 'Aviation': return <FaPlane className="w-4 h-4 text-blue-600" />;
      case 'Retail': return <FaShoppingCart className="w-4 h-4 text-purple-500" />;
      case 'Media': return <FaChartLine className="w-4 h-4 text-pink-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSectorColor = (sector) => {
    const colors = {
      'IT': 'from-blue-50 to-blue-100 border-blue-200',
      'Banking': 'from-green-50 to-emerald-100 border-green-200',
      'Finance': 'from-emerald-50 to-green-100 border-emerald-200',
      'FMCG': 'from-yellow-50 to-amber-100 border-yellow-200',
      'Pharmaceutical': 'from-red-50 to-pink-100 border-red-200',
      'Healthcare': 'from-pink-50 to-rose-100 border-pink-200',
      'Automobile': 'from-purple-50 to-violet-100 border-purple-200',
      'Energy': 'from-orange-50 to-amber-100 border-orange-200',
      'Telecom': 'from-cyan-50 to-blue-100 border-cyan-200',
      'Infrastructure': 'from-gray-50 to-gray-100 border-gray-300',
      'Real Estate': 'from-amber-50 to-yellow-100 border-yellow-300',
      'Cement': 'from-gray-100 to-gray-200 border-gray-400',
      'Metals': 'from-gray-200 to-gray-300 border-gray-500',
      'Aviation': 'from-blue-100 to-cyan-100 border-blue-300',
      'Retail': 'from-purple-100 to-pink-100 border-purple-300',
      'Media': 'from-pink-50 to-rose-100 border-pink-300',
      'Conglomerate': 'from-indigo-50 to-purple-100 border-indigo-200',
      'Insurance': 'from-teal-50 to-cyan-100 border-teal-200',
      'Chemicals': 'from-orange-50 to-yellow-100 border-orange-200',
      'Logistics': 'from-gray-100 to-blue-100 border-blue-200',
      'E-commerce': 'from-pink-50 to-rose-100 border-pink-200',
      'Fintech': 'from-cyan-50 to-blue-100 border-cyan-200',
      'Industrial': 'from-gray-50 to-gray-200 border-gray-300',
      'Consumer Goods': 'from-yellow-50 to-amber-100 border-yellow-200',
      'Renewable': 'from-green-50 to-emerald-100 border-green-200',
      'Green Energy': 'from-emerald-50 to-green-100 border-emerald-200',
      'Mining': 'from-gray-300 to-gray-400 border-gray-500'
    };
    return colors[sector] || 'from-gray-50 to-gray-100 border-gray-200';
  };

  // Calculate market stats
  const marketStats = useMemo(() => {
    const gainers = stocks.filter(s => s.changePercent > 0);
    const losers = stocks.filter(s => s.changePercent < 0);
    
    return {
      totalStocks: stocks.length,
      gainers: gainers.length,
      losers: losers.length,
      unchanged: stocks.filter(s => s.changePercent === 0).length,
      avgChange: stocks.length > 0 
        ? stocks.reduce((acc, s) => acc + s.changePercent, 0) / stocks.length 
        : 0,
      topGainer: gainers.reduce((max, s) => s.changePercent > max.changePercent ? s : max, { changePercent: -Infinity, name: '' }),
      topLoser: losers.reduce((min, s) => s.changePercent < min.changePercent ? s : min, { changePercent: Infinity, name: '' }),
      totalMarketCap: stocks.reduce((acc, s) => acc + s.marketCap, 0),
      activeVolume: stocks.reduce((acc, s) => acc + s.volume, 0)
    };
  }, [stocks]);

  // Calculate portfolio value
  const portfolioValue = useMemo(() => {
    return userPortfolio.summary?.currentValue || 0;
  }, [userPortfolio]);

  // Check if user owns a stock
  const isStockOwned = (symbol) => {
    return userPortfolio.holdings?.find(stock => stock.symbol === symbol);
  };

  const sectors = [...new Set(stocks.map(s => s.sector))];
  const categories = ['Large Cap', 'Mid Cap', 'Small Cap'];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Loading Indian Stock Market...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing 100+ stocks with real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-300" />
              <div className="text-sm font-medium">
                <span className="text-green-300">● Live</span> NIFTY 50: <span className="font-bold">22,450.15</span> 
                <span className="text-green-300 ml-2">+1.25% ▲</span> | SENSEX: <span className="font-bold">73,850.42</span>
                <span className="text-green-300 ml-2">+1.15% ▲</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/portfolio')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                <ShoppingBag className="w-4 h-4" />
                View Portfolio
                <FaArrowRight className="w-3 h-3" />
              </button>
              <span className="text-sm opacity-90">
                Data updates automatically • Last updated: {lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Indian Stock Market
              </h1>
            </div>
            <p className="text-gray-600 mb-4">Explore 100+ Indian stocks with real-time data, analytics, and insights</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                <Hash className="w-3 h-3" /> {marketStats.totalStocks} Stocks
              </span>
              <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {marketStats.gainers} Gainers
              </span>
              <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> {marketStats.losers} Losers
              </span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1">
                <FaRupeeSign className="w-3 h-3" /> ₹{formatPrice(marketStats.totalMarketCap)} Cr
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Available Balance</div>
                  <div className="font-bold text-gray-900 text-xl">₹{formatPrice(availableCash)}</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Portfolio Value</div>
                  <div className="font-bold text-gray-900 text-xl">₹{formatPrice(portfolioValue)}</div>
                </div>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stocks (e.g., TCS, Reliance, Banking)..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', icon: <BarChart3 className="w-4 h-4" />, color: 'from-gray-600 to-gray-700' },
                { id: 'gainers', label: 'Gainers', icon: <TrendingUp className="w-4 h-4" />, color: 'from-green-500 to-emerald-600' },
                { id: 'losers', label: 'Losers', icon: <TrendingDown className="w-4 h-4" />, color: 'from-red-500 to-rose-600' },
                { id: 'watchlist', label: 'Watchlist', icon: <FaStar className="w-4 h-4" />, color: 'from-yellow-500 to-amber-600' },
                { id: 'recommended', label: 'Recommended', icon: <FaTrophy className="w-4 h-4" />, color: 'from-blue-500 to-cyan-600' },
                { id: 'dividend', label: 'Dividend', icon: <FaMoneyBillWave className="w-4 h-4" />, color: 'from-purple-500 to-pink-600' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all transform hover:scale-105 ${
                    activeFilter === filter.id 
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-lg` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.icon}
                  <span className="text-sm font-medium">{filter.label}</span>
                </button>
              ))}
            </div>

            {/* View & Sort Controls */}
            <div className="flex items-center justify-end gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="name">Sort: Name A-Z</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="changeHigh">Change: High to Low</option>
                <option value="changeLow">Change: Low to High</option>
                <option value="volumeHigh">Volume: High to Low</option>
                <option value="dividendHigh">Dividend: High to Low</option>
              </select>
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded transition ${viewMode === 'grid' ? 'bg-white shadow-md' : 'hover:bg-gray-200'}`}
                  title="Grid View"
                >
                  <div className="grid grid-cols-2 gap-1 w-5 h-5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded transition ${viewMode === 'list' ? 'bg-white shadow-md' : 'hover:bg-gray-200'}`}
                  title="List View"
                >
                  <div className="space-y-1 w-5 h-5">
                    <div className={`h-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                    <div className={`h-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                    <div className={`h-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
            >
              <FaFilter className="w-4 h-4" />
              <span>Advanced Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters({...filters, sector: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                
                <select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <button
                  onClick={() => setFilters({
                    sector: 'all',
                    riskLevel: 'all',
                    category: 'all',
                    minPrice: '',
                    maxPrice: '',
                    showWatchlist: false
                  })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-800 text-sm font-medium">Top Gainer</div>
                <div className="text-2xl font-bold text-green-900 mt-1 truncate">
                  {marketStats.topGainer.name || '--'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-bold text-xl">
                    +{marketStats.topGainer.changePercent?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
              <TrendingUp className="w-14 h-14 text-green-500 opacity-30" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-800 text-sm font-medium">Top Loser</div>
                <div className="text-2xl font-bold text-red-900 mt-1 truncate">
                  {marketStats.topLoser.name || '--'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-bold text-xl">
                    {marketStats.topLoser.changePercent?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
              <TrendingDown className="w-14 h-14 text-red-500 opacity-30" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-800 text-sm font-medium">Market Sentiment</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {marketStats.avgChange > 0 ? 'Bullish 🐂' : 'Bearish 🐻'}
                </div>
                <div className={`flex items-center gap-2 mt-2 ${
                  marketStats.avgChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketStats.avgChange > 0 ? 
                    <ArrowUpRight className="w-5 h-5" /> : 
                    <ArrowDownRight className="w-5 h-5" />
                  }
                  <span className="font-bold text-xl">
                    {marketStats.avgChange > 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              <FaChartLine className="w-14 h-14 text-blue-500 opacity-30" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-800 text-sm font-medium">Market Activity</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">
                  {(marketStats.gainers + marketStats.losers).toLocaleString()}
                </div>
                <div className="text-purple-700 text-sm mt-2 space-x-3">
                  <span className="font-medium">{marketStats.gainers} Gainers</span>
                  <span className="font-medium">{marketStats.losers} Losers</span>
                </div>
              </div>
              <Activity className="w-14 h-14 text-purple-500 opacity-30" />
            </div>
          </div>
        </div>

        {/* Stocks Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStocks.map((stock) => {
              const owned = isStockOwned(stock.symbol);
              
              return (
                <div 
                  key={stock.symbol} 
                  className={`group bg-gradient-to-br ${getSectorColor(stock.sector)} border rounded-2xl p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getSectorIcon(stock.sector)}
                        <h3 className="font-bold text-gray-900 text-lg">{stock.symbol.replace('.BO', '')}</h3>
                        {stock.recommended && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs rounded-full">
                            ★ Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium text-sm truncate">{stock.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{stock.category}</p>
                    </div>
                    <button 
                      onClick={() => toggleWatchlist(stock.symbol)}
                      className="p-2 rounded-full hover:bg-white/50 transition"
                      title={stock.isWatched ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      {stock.isWatched ? (
                        <FaStar className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <FaRegStar className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Price:</span>
                      <span className="font-bold text-gray-900 text-xl">₹{formatPrice(stock.price)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Today Change:</span>
                      <div className="flex items-center gap-2">
                        {stock.changePercent >= 0 ? (
                          <>
                            <ChevronUp className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-600 text-lg">
                              +{stock.changePercent.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-5 h-5 text-red-600" />
                            <span className="font-bold text-red-600 text-lg">
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {owned && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-blue-800 font-medium">You own:</span>
                            <div className="font-bold text-blue-900 text-lg">{owned.quantity} shares</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-blue-600">Value: ₹{formatPrice(owned.currentValue)}</div>
                            <div className={`text-xs font-medium ${owned.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {owned.profitLoss >= 0 ? '+' : ''}₹{formatPrice(Math.abs(owned.profitLoss))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 text-sm">Sector</span>
                        <div className="text-sm font-medium text-gray-800 px-3 py-1.5 bg-white/50 rounded-lg mt-1">
                          {stock.sector}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Risk Level</span>
                        <div className={`px-3 py-1.5 text-xs font-semibold rounded-lg mt-1 ${
                          stock.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                          stock.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {stock.riskLevel} Risk
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 text-sm">Dividend Yield</span>
                        <div className="font-medium text-blue-700">
                          {stock.dividendYield}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Volume</span>
                        <div className="font-medium text-gray-800">
                          {(stock.volume / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBuyStock(stock)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{owned ? 'Buy More' : 'Buy Stock'}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-medium">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Symbol</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Company Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Change</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Volume</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Sector</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStocks.map((stock) => {
                    const owned = isStockOwned(stock.symbol);
                    
                    return (
                      <tr key={stock.symbol} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getSectorIcon(stock.sector)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{stock.symbol.replace('.BO', '')}</div>
                              <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                                stock.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                stock.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {stock.riskLevel}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{stock.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{stock.category}</div>
                          {owned && (
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              ✓ You own {owned.quantity} shares
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 text-lg">₹{formatPrice(stock.price)}</div>
                          <div className="text-xs text-gray-500">Last traded</div>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-2 font-bold ${
                            stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.changePercent >= 0 ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ₹{Math.abs(stock.change).toFixed(2)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-800 font-medium">
                            {(stock.volume / 1000).toFixed(0)}K
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium inline-block">
                            {stock.sector}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleWatchlist(stock.symbol)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                              {stock.isWatched ? (
                                <FaStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <FaRegStar className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleBuyStock(stock)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              {owned ? 'Buy More' : 'Buy'}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all font-medium">
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buy Stock Modal */}
        {showBuyModal && selectedStock && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Buy {selectedStock.name}</h3>
                    <p className="text-gray-600">{selectedStock.symbol.replace('.BO', '')} • {selectedStock.sector}</p>
                  </div>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-gray-600 text-sm">Current Price</div>
                      <div className="font-bold text-lg">₹{formatPrice(selectedStock.price)}</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                      <div className="text-gray-600 text-sm">Available Cash</div>
                      <div className="font-bold text-lg">₹{formatPrice(availableCash)}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3">Quantity to Buy</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={buyQuantity}
                        onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-medium"
                      />
                      <div className="flex gap-2">
                        {[10, 50, 100].map(qty => (
                          <button
                            key={qty}
                            onClick={() => setBuyQuantity(qty)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                          >
                            {qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between text-xl font-bold mb-2">
                      <span>Total Investment:</span>
                      <span className="text-blue-700">₹{formatPrice(selectedStock.price * buyQuantity)}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Price per share:</span>
                        <span>₹{formatPrice(selectedStock.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{buyQuantity} shares</span>
                      </div>
                      <div className={`flex justify-between font-medium ${
                        selectedStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>Daily Change:</span>
                        <span>{selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBuy}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-medium shadow-lg flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Confirm Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredStocks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 text-gray-300 opacity-50">
              <FaSearch className="w-full h-full" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No stocks found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm ? `No stocks match "${searchTerm}". Try searching for different keywords.` : 
               'No stocks match your current filters. Try adjusting your filter settings.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  sector: 'all',
                  riskLevel: 'all',
                  category: 'all',
                  minPrice: '',
                  maxPrice: '',
                  showWatchlist: false
                });
                setActiveFilter('all');
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all font-medium"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{marketStats.totalStocks}</div>
              <div className="text-gray-600 text-sm">Total Stocks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{marketStats.gainers}</div>
              <div className="text-gray-600 text-sm">Advancing Stocks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{marketStats.losers}</div>
              <div className="text-gray-600 text-sm">Declining Stocks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((marketStats.gainers / marketStats.totalStocks) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600 text-sm">Market Breadth</div>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>📈 Showing {filteredStocks.length} of {stocks.length} Indian stocks • Real-time simulated data</p>
            <p className="mt-1">Portfolio: {userPortfolio.holdings?.length || 0} holdings worth ₹{formatPrice(portfolioValue)} • Last updated: {lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;