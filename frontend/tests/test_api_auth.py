import pytest

@pytest.mark.auth
class TestAuthentication:
    
    def test_server_is_running(self, api_client, api_base_url):
        response = api_client.get(api_base_url)
        assert response.status_code == 200
        assert "WealthMind" in response.json()["message"]
        print(f"✓ Server running: {response.json()['message']}")
    
    def test_health_check(self, api_client, api_base_url):
        response = api_client.get(f"{api_base_url}/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "OK"
        print("✓ Health check passed")
    
    def test_register_success(self, api_client, api_base_url, test_user):
        url = f"{api_base_url}/api/auth/register"
        response = api_client.post(url, json=test_user)
        
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["email"] == test_user["email"]
        assert response.elapsed.total_seconds() < 5.0
        print(f"✓ Registration successful: {test_user['email']}")
    
    def test_register_missing_fields(self, api_client, api_base_url):
        url = f"{api_base_url}/api/auth/register"
        incomplete_user = {"name": "Test", "email": "test@example.com"}
        response = api_client.post(url, json=incomplete_user)
        
        assert response.status_code == 400
        print(f"✓ Validation working: {response.json()['message']}")
    
    def test_register_duplicate_email(self, api_client, api_base_url, test_user):
        url = f"{api_base_url}/api/auth/register"
        api_client.post(url, json=test_user)
        response = api_client.post(url, json=test_user)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["message"].lower()
        print("✓ Duplicate email prevention working")
    
    def test_login_success(self, api_client, api_base_url, registered_user):
        url = f"{api_base_url}/api/auth/login"
        credentials = {
            "email": registered_user["user"]["email"],
            "password": registered_user["user"]["password"]
        }
        response = api_client.post(url, json=credentials)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        print(f"✓ Login successful: {credentials['email']}")
    
    def test_login_wrong_password(self, api_client, api_base_url, registered_user):
        url = f"{api_base_url}/api/auth/login"
        credentials = {
            "email": registered_user["user"]["email"],
            "password": "WrongPassword123"
        }
        response = api_client.post(url, json=credentials)
        
        assert response.status_code == 401
        print("✓ Wrong password rejected")
    
    def test_login_nonexistent_user(self, api_client, api_base_url):
        url = f"{api_base_url}/api/auth/login"
        credentials = {"email": "ghost@example.com", "password": "Test123"}
        response = api_client.post(url, json=credentials)
        
        assert response.status_code == 401
        print("✓ Non-existent user rejected")
