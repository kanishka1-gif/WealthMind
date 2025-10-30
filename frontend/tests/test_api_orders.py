import pytest

@pytest.mark.orders
class TestOrderEndpoints:
    
    def test_place_buy_order(self, api_client, api_base_url, auth_headers):
        url = f"{api_base_url}/api/orders/buy"
        order = {
            "symbol": "TCS.BO",
            "quantity": 10,
            "price": 3500.50
        }
        response = api_client.post(url, json=order, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "orderId" in data
        assert response.elapsed.total_seconds() < 0.5
        print(f"✓ Buy order: {data['orderId']}")
    
    def test_place_sell_order(self, api_client, api_base_url, auth_headers):
        url = f"{api_base_url}/api/orders/sell"
        order = {
            "symbol": "RELIANCE.BO",
            "quantity": 5,
            "price": 2450.75
        }
        response = api_client.post(url, json=order, headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json()["success"] == True
        print(f"✓ Sell order placed")
    
    def test_get_order_history(self, api_client, api_base_url, auth_headers):
        url = f"{api_base_url}/api/orders/history"
        response = api_client.get(url, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        print(f"✓ Order history: {len(data['orders'])} orders")
