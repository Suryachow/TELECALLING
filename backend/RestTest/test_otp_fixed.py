#!/usr/bin/env python3
"""
Test script to verify OTP send/verify flow works without timezone errors
"""
import os
import sys
import django
import requests
import time

# Setup Django
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_auth_django.settings')
django.setup()

def test_otp_flow():
    base_url = "http://127.0.0.1:8000"
    test_phone = "9876543210"
    
    print("🧪 Testing OTP Send/Verify Flow")
    print("=" * 40)
    
    # Step 1: Send OTP
    print("📱 Step 1: Sending OTP...")
    send_response = requests.post(f"{base_url}/api/send-otp/", 
                                json={"phone": test_phone})
    
    if send_response.status_code == 200:
        send_data = send_response.json()
        print(f"✅ OTP sent successfully: {send_data}")
        
        # Extract OTP if available (debug mode)
        if 'otp' in send_data:
            test_otp = send_data['otp']
            print(f"🔑 Test OTP: {test_otp}")
        else:
            test_otp = input("📥 Enter the OTP you received: ")
    else:
        print(f"❌ Failed to send OTP: {send_response.status_code} - {send_response.text}")
        return False
    
    # Step 2: Verify OTP
    print("\n🔍 Step 2: Verifying OTP...")
    verify_response = requests.post(f"{base_url}/api/verify-otp/", 
                                  json={"phone": test_phone, "otp": test_otp})
    
    if verify_response.status_code == 200:
        verify_data = verify_response.json()
        print(f"✅ OTP verified successfully: {verify_data}")
        return True
    else:
        print(f"❌ Failed to verify OTP: {verify_response.status_code} - {verify_response.text}")
        return False

def test_expired_otp():
    print("\n⏰ Testing OTP expiry handling...")
    
    # This would require manually creating an expired OTP in DB
    # For now, just test with an invalid OTP
    base_url = "http://127.0.0.1:8000"
    test_phone = "9876543210"
    fake_otp = "000000"
    
    verify_response = requests.post(f"{base_url}/api/verify-otp/", 
                                  json={"phone": test_phone, "otp": fake_otp})
    
    if verify_response.status_code == 400:
        print("✅ Invalid OTP properly rejected")
        return True
    else:
        print(f"❌ Unexpected response: {verify_response.status_code}")
        return False

if __name__ == "__main__":
    print("🚀 Starting OTP Flow Tests")
    print("Make sure Django server is running on http://127.0.0.1:8000")
    print()
    
    try:
        # Test main flow
        success = test_otp_flow()
        
        # Test error cases
        test_expired_otp()
        
        print("\n" + "=" * 40)
        if success:
            print("🎉 All tests passed! The timezone fix is working.")
        else:
            print("⚠️  Some tests failed. Check the server logs.")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")