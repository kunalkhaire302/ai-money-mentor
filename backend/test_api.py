import requests

# Set backend URL - using the local testing port 8000
BASE_URL = "http://localhost:8000"

def test_create_account():
    print("Testing /auth/register...")
    test_user = {
        "username": "test_user_ai_mentor",
        "password": "secure_password_123"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Account created successfully!")
        elif response.status_code == 400 and "already registered" in response.text:
            print("⚠️ Account already exists, but endpoint is working.")
        else:
            print("❌ Account creation failed.")
            return False
            
        print("\nTesting /auth/token (Login)...")
        # FastAPI OAuth2 expects form data for login
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        login_response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
        print(f"Status Code: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            print(f"✅ Login successful, Access Token retrieved: {token[:20]}...")
        else:
            print("❌ Login failed.")
            print(login_response.text)

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to localhost:8000. Is the FastAPI server running?")

if __name__ == "__main__":
    test_create_account()
