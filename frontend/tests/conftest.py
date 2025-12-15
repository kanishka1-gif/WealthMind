import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

@pytest.fixture
def api_base_url():
    return BASE_URL

@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def test_user():
    timestamp = int(time.time())
    return {
        "name": "Test User",
        "email": f"testuser{timestamp}@example.com",
        "phone": "9876543210",
        "password": "Test@1234"
    }

@pytest.fixture
def registered_user(api_client, api_base_url, test_user):
    url = f"{api_base_url}/api/auth/register"
    response = api_client.post(url, json=test_user)
    
    if response.status_code in [200, 201]:
        data = response.json()
        return {
            "user": test_user,
            "token": data.get("token")
        }
    return None

@pytest.fixture
def auth_headers(registered_user):
    if registered_user:
        return {"Authorization": f"Bearer {registered_user['token']}"}
    return {}
