const yahooFinance = require('yahoo-finance2').default;

class IndianStockService {
  async getStockQuote(symbol) {
    try {
      const fullSymbol = `${symbol}.NS`; // NSE stocks
      const quote = await yahooFinance.quote(fullSymbol);
      
      return {
        symbol: symbol,
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        sector: this.getSector(symbol),
        marketCap: this.formatMarketCap(quote.marketCap),
        riskLevel: this.getRiskLevel(symbol),
        volume: quote.regularMarketVolume
      };
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error.message);
      return null;
    }
  }

  async getMultipleStocks(symbols) {
    const promises = symbols.map(symbol => this.getStockQuote(symbol));
    const results = await Promise.all(promises);
    return results.filter(stock => stock !== null);
  }

  formatMarketCap(marketCap) {
    if (!marketCap) return 'Mid Cap';
    const billion = 1000000000;
    if (marketCap >= billion * 20) return 'Large Cap';
    if (marketCap >= billion * 5) return 'Mid Cap';
    return 'Small Cap';
  }

  getSector(symbol) {
    const sectorMap = {
      'RELIANCE': 'Energy',
      'TCS': 'IT',
      'HDFCBANK': 'Banking',
      'INFY': 'IT', 
      'ICICIBANK': 'Banking',
      'BHARTIARTL': 'Telecom',
      'SBIN': 'Banking',
      'HINDUNILVR': 'FMCG',
      'ITC': 'FMCG',
      'KOTAKBANK': 'Banking'
    };
    return sectorMap[symbol] || 'Diversified';
  }

  getRiskLevel(symbol) {
    const highRisk = ['TATAMOTORS', 'YESBANK'];
    const lowRisk = ['RELIANCE', 'HDFCBANK', 'TCS', 'HINDUNILVR'];
    
    if (highRisk.includes(symbol)) return 'High';
    if (lowRisk.includes(symbol)) return 'Low';
    return 'Medium';
  }
}

module.exports = new IndianStockService();