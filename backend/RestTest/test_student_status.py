import requests
import json

# Test the student status API
base_url = "http://127.0.0.1:8000"

def test_student_status_api():
    """
    Test the /api/student/status/ endpoint
    """
    
    # Test case 1: Query by email (if you have a student with this email)
    print("=== Test 1: Query by Email ===")
    test_data_email = {
        "email": "test@example.com"  # Replace with actual email from your DB
    }
    
    try:
        response = requests.post(f"{base_url}/api/student/status/", 
                               json=test_data_email,
                               headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if 'student_details' in data and data['student_details']:
                generated_id = data['student_details'].get('generated_student_id')
                print(f"Generated Student ID: {generated_id}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test case 2: Query by generated student ID (if you have one)
    print("=== Test 2: Query by Generated Student ID ===")
    test_data_generated_id = {
        "student_id": "VSAT2025000001"  # Replace with actual generated ID
    }
    
    try:
        response = requests.post(f"{base_url}/api/student/status/", 
                               json=test_data_generated_id,
                               headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

    print("\n" + "="*50 + "\n")
    
    # Test case 3: Get summary (GET request)
    print("=== Test 3: Get Summary ===")
    try:
        response = requests.get(f"{base_url}/api/student/status/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if 'recent_applications' in data:
                for app in data['recent_applications']:
                    generated_id = app.get('generated_student_id')
                    print(f"Recent Application - Generated ID: {generated_id}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_student_status_api()
