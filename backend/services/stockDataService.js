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
        sector: 'Banking', // You'll need to map this
        marketCap: this.formatMarketCap(quote.marketCap),
        riskLevel: 'Medium'
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
}

module.exports = new IndianStockService();