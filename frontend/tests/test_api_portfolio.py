import pytest

@pytest.mark.portfolio
class TestPortfolioEndpoints:
    
    def test_get_portfolio(self, api_client, api_base_url, auth_headers):
        url = f"{api_base_url}/api/portfolio"
        response = api_client.get(url, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "totalValue" in data
        assert "cashBalance" in data
        assert "stocks" in data
        print(f"✓ Portfolio: ₹{data['totalValue']}")
    
    def test_get_portfolio_stats(self, api_client, api_base_url, auth_headers):
        url = f"{api_base_url}/api/portfolio/stats"
        response = api_client.get(url, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "profitLoss" in data
        assert "currentValue" in data
        print(f"✓ P/L: ₹{data['profitLoss']}")
    
    def test_get_user_profile(self, api_client, api_base_url, auth_headers):
        url = f"{api_base_url}/api/user/profile"
        response = api_client.get(url, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "portfolioValue" in data
        print(f"✓ Profile retrieved")
