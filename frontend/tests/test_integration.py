import pytest

@pytest.mark.integration
class TestIntegration:
    
    def test_complete_user_journey(self, api_client, api_base_url, test_user):
        # Register
        reg_url = f"{api_base_url}/api/auth/register"
        reg_resp = api_client.post(reg_url, json=test_user)
        assert reg_resp.status_code in [200, 201]
        token = reg_resp.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ Registered")
        
        # Login
        login_url = f"{api_base_url}/api/auth/login"
        login_resp = api_client.post(login_url, json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        assert login_resp.status_code == 200
        print("✓ Logged in")
        
        # Get stock
        stock_url = f"{api_base_url}/api/market/yahoo/TCS.BO"
        stock_resp = api_client.get(stock_url)
        assert stock_resp.status_code == 200
        price = stock_resp.json()["price"]
        print(f"✓ Got stock: ₹{price}")
        
        # Buy order
        buy_url = f"{api_base_url}/api/orders/buy"
        buy_resp = api_client.post(buy_url, json={
            "symbol": "TCS.BO",
            "quantity": 10,
            "price": price
        }, headers=headers)
        assert buy_resp.status_code == 200
        print("✓ Order placed")
        
        # Portfolio
        port_url = f"{api_base_url}/api/portfolio"
        port_resp = api_client.get(port_url, headers=headers)
        assert port_resp.status_code == 200
        print("✓ Portfolio checked")
        
        print("\n🎉 Complete journey successful!")
