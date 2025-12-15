import pytest

@pytest.mark.market
class TestMarketEndpoints:
    
    def test_get_single_stock(self, api_client, api_base_url):
        symbol = "TCS.BO"
        url = f"{api_base_url}/api/market/yahoo/{symbol}"
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == symbol
        assert "price" in data
        assert data["price"] > 0
        assert response.elapsed.total_seconds() < 5.0
        print(f"✓ Stock data: {symbol} @ ₹{data['price']}")
    
    def test_get_multiple_stocks(self, api_client, api_base_url):
        symbols = ["RELIANCE.BO", "INFY.BO", "HDFCBANK.BO"]
        
        for symbol in symbols:
            url = f"{api_base_url}/api/market/yahoo/{symbol}"
            response = api_client.get(url)
            assert response.status_code == 200
            assert response.json()["price"] > 0
        print(f"✓ Retrieved {len(symbols)} stocks")
    
    def test_batch_stocks(self, api_client, api_base_url):
        symbols = "TCS.BO,RELIANCE.BO,INFY.BO"
        url = f"{api_base_url}/api/market/stocks?symbols={symbols}"
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert response.elapsed.total_seconds() < 5.0
        print(f"✓ Batch data: {len(data)} stocks")
    
    def test_market_search(self, api_client, api_base_url):
        url = f"{api_base_url}/api/market/search/TCS"
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Search returned {len(data)} results")
    
    def test_stock_data_format(self, api_client, api_base_url):
        url = f"{api_base_url}/api/market/yahoo/TCS.BO"
        response = api_client.get(url)
        data = response.json()
        
        assert isinstance(data["price"], float)
        assert isinstance(data["change"], float)
        assert data["riskLevel"] in ["Low", "Medium", "High"]
        print("✓ Stock data format validated")
