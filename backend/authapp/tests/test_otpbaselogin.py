import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.mark.django_db
def test_otpbase_login_success(monkeypatch):
    client = APIClient()
    url = reverse('otpbase_login')

    # Mock DB and OTP record
    class DummyUser:
        def get(self, key, default=None):
            return {'name': 'Test User', 'email': 'test@example.com', 'phone': '1234567890', 'role': 'user'}.get(key, default)
    
    dummy_user = DummyUser()
    dummy_otps = type('DummyOTPS', (), {
        'find_one': lambda self, q: {'phone': '1234567890', 'otp': '123456', 'verified': True} if q['phone'] == '1234567890' and q['otp'] == '123456' else None
    })()
    dummy_users = type('DummyUsers', (), {
        'find_one': lambda self, q: {'name': 'Test User', 'email': 'test@example.com', 'phone': '1234567890', 'role': 'user'} if q['phone'] == '1234567890' else None
    })()
    dummy_db = {'otps': dummy_otps, 'users': dummy_users}

    # Patch settings.MONGO_DB
    monkeypatch.setattr('django.conf.settings.MONGO_DB', {'initReg': dummy_db})

    data = {'phone': '1234567890', 'otp': '123456'}
    response = client.post(url, data, format='json')
    assert response.status_code == 200
    assert response.data['success'] is True
    assert response.data['user']['email'] == 'test@example.com'

def test_otpbase_login_invalid_otp(monkeypatch):
    client = APIClient()
    url = reverse('otpbase_login')

    dummy_otps = type('DummyOTPS', (), {
        'find_one': lambda self, q: None
    })()
    dummy_users = type('DummyUsers', (), {
        'find_one': lambda self, q: None
    })()
    dummy_db = {'otps': dummy_otps, 'users': dummy_users}
    monkeypatch.setattr('django.conf.settings.MONGO_DB', {'initReg': dummy_db})

    data = {'phone': '1234567890', 'otp': '000000'}
    response = client.post(url, data, format='json')
    assert response.status_code == 400
    assert response.data['success'] is False
    assert 'Invalid OTP' in response.data['message']
