import pytest
import requests

BASE_URL = "http://localhost:5000/api"

def test_simple_check():
    """Simple test to verify pytest is working"""
    assert 1 + 1 == 2
    print("Pytest is working!")

def test_backend_is_running():
    """Test if backend is accessible"""
    try:
        response = requests.get(BASE_URL, timeout=5)
        print(f"Backend responded with status: {response.status_code}")
        assert True
    except requests.exceptions.ConnectionError:
        pytest.fail("Backend is not running. Start your backend first!")