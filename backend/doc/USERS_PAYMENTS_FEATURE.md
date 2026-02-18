# Users Payments Collection Feature

## Overview
This feature implements a separate `users_payments` collection to store and manage payment records with automatic cross-verification against the payment gateway data.

## Architecture

### Collections Involved
1. **students** - Main student application data (includes payment info)
2. **users_payments** - Dedicated payment records collection (NEW)
3. **payment_gateway_data** - Raw payment gateway transaction data

### Data Flow
```
Student Submits Application
        ↓
Stored in 'students' collection
        ↓
Payment detected → store_payment_record()
        ↓
Cross-verify with 'payment_gateway_data'
    (Match: txnid + phone)
        ↓
Store/Update in 'users_payments' collection
```

## Implementation Details

### 1. Helper Function: `store_payment_record()`
**Location:** `authapp/views.py` (after `log_step_activity()`)

**Purpose:** 
- Store payment records in `users_payments` collection
- Cross-verify with `payment_gateway_data`
- Update verification status

**Parameters:**
- `student_data` (dict): Student data containing payment information
- `verify_gateway` (bool): Enable/disable gateway verification (default: True)

**Returns:**
```python
{
    "verified": bool,
    "status": str,  # "verified" | "not_verified" | "not_found_in_gateway" | "verification_failed"
    "gateway_data": dict or None
}
```

**Verification Logic:**
1. Extracts `transactionId` and `phone` from student data
2. Queries `payment_gateway_data` collection:
   ```python
   {
       'txnid': transaction_id,
       'phone': {$in: [phone, str(phone), int(phone)]}
   }
   ```
3. If match found:
   - Sets `gateway_verified = True`
   - Stores gateway data (status, amount, bank_ref_no, mode, etc.)
   - Updates payment status if gateway status is "success"
4. Stores/updates record in `users_payments` collection (upsert)

### 2. Modified: `StudentView.post()`
**Location:** `authapp/views.py`

**Changes:**
- After inserting student into `students` collection
- Automatically calls `store_payment_record()` if `transactionId` exists
- Returns verification result in response

**Response Structure:**
```json
{
    "message": "Student saved to MongoDB with BLOB files.",
    "student_id": "VU26GNT000001",
    "mongodb_id": "507f1f77bcf86cd799439011",
    "payment_verification": {
        "verified": true,
        "status": "verified",
        "gateway_data": {
            "status": "success",
            "amount": 5000.0,
            "bank_ref_no": "BANK123",
            "mode": "UPI",
            "bank_name": "State Bank"
        }
    }
}
```

### 3. Modified: `AllPaymentsDetailsView.get()`
**Location:** `authapp/views.py`

**Changes:**
- Fetches all students with payment info
- For each student:
  - Cross-verifies with `payment_gateway_data`
  - Stores/updates in `users_payments` collection
  - Includes verification status in response
- Returns statistics about verified vs unverified payments

**Response Structure:**
```json
{
    "payments": [...],
    "total_count": 150,
    "verified_count": 120,
    "unverified_count": 30
}
```

### 4. New View: `UsersPaymentsView`
**Location:** `authapp/views.py`

#### GET Method
**Purpose:** Query `users_payments` collection with filtering and pagination

**Query Parameters:**
- `student_id` - Filter by student ID
- `email` - Filter by email (case-insensitive)
- `phone` - Filter by phone (handles string/numeric)
- `transactionId` - Filter by transaction ID
- `paymentStatus` - Filter by payment status (pending, completed, etc.)
- `verification_status` - Filter by verification status
- `gateway_verified` - Filter by gateway verification (true/false)
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 50)

**Response Structure:**
```json
{
    "records": [...],
    "pagination": {
        "total_count": 150,
        "page": 1,
        "limit": 50,
        "total_pages": 3
    },
    "statistics": {
        "verified_count": 120,
        "unverified_count": 30,
        "completed_payments": 140,
        "pending_payments": 10
    }
}
```

#### POST Method
**Purpose:** Manually trigger payment verification

**Request Body:**
```json
{
    "student_id": "507f1f77bcf86cd799439011"  // OR
    "transactionId": "TXN123456789"
}
```

**Response:**
```json
{
    "message": "Payment verification completed",
    "verification_result": {
        "verified": true,
        "status": "verified",
        "gateway_data": {...}
    }
}
```

## Database Schema

### users_payments Collection
```python
{
    "_id": ObjectId,
    "student_id": str,                    # MongoDB _id from students collection
    "generated_student_id": str,          # e.g., "VU26GNT000001"
    "name": str,                          # Full name
    "email": str,
    "phone": str,
    "payment_details": {
        "paymentAmount": float,
        "paymentCurrency": str,           # e.g., "INR"
        "paymentMethod": str,             # e.g., "UPI", "NetBanking"
        "transactionId": str,
        "paymentStatus": str,             # "pending", "completed", "failed"
        "paymentDate": str,               # ISO format
        "discountApplied": float,
        "couponCode": str,
        "applicationStatus": str
    },
    "gateway_verified": bool,             # True if verified with gateway
    "gateway_data": {                     # Gateway transaction details
        "status": str,
        "amount": float,
        "bank_ref_no": str,
        "mode": str,
        "bank_name": str,
        "addedon": str,
        "txnid": str
    },
    "verification_status": str,           # "verified", "not_verified", "not_found_in_gateway", "verification_failed"
    "created_at": datetime,
    "last_updated": datetime
}
```

## API Endpoints

### New Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/authapp/users-payments/` | Query users_payments collection |
| POST | `/authapp/users-payments/verify/` | Manually trigger verification |

### Modified Endpoints
| Method | Endpoint | Changes |
|--------|----------|---------|
| POST | `/authapp/student/` | Now stores payment records automatically |
| GET | `/authapp/applications/payments/` | Now includes verification data |

## Usage Examples

### Query all verified payments
```http
GET /authapp/users-payments/?gateway_verified=true&page=1&limit=20
```

### Query completed payments for specific phone
```http
GET /authapp/users-payments/?phone=1234567890&paymentStatus=completed
```

### Manually verify a payment
```http
POST /authapp/users-payments/verify/
Content-Type: application/json

{
    "transactionId": "TXN123456789"
}
```

### Get all payments with statistics
```http
GET /authapp/applications/payments/
```

## Verification Statuses

| Status | Description |
|--------|-------------|
| `verified` | Successfully matched with payment gateway |
| `not_verified` | Not yet checked against gateway |
| `not_found_in_gateway` | No matching record in gateway data |
| `verification_failed` | Error occurred during verification |

## Testing

Use the REST test file: `RestTest/test_users_payments.rest`

Test scenarios included:
1. Get all payment records with pagination
2. Filter by various fields (student_id, email, phone, txnid)
3. Filter by payment status and verification status
4. Manually trigger verification
5. Combined filters

## Benefits

1. **Separation of Concerns**: Payment data stored separately from student applications
2. **Automatic Verification**: Cross-checks with payment gateway on submission
3. **Audit Trail**: Tracks verification status and gateway data
4. **Flexible Querying**: Dedicated endpoints for payment-specific queries
5. **Data Integrity**: Always maintains latest verification status
6. **Performance**: Indexed queries on payment-specific fields

## Future Enhancements

1. Add webhooks for real-time payment gateway updates
2. Implement payment reconciliation reports
3. Add payment retry/refund tracking
4. Support multiple payment gateways
5. Add payment analytics and dashboards
6. Implement scheduled verification jobs for pending payments

## Troubleshooting

### Payment not verified
- Check if transaction ID exists in `payment_gateway_data` collection
- Verify phone number format matches (string vs. numeric)
- Use manual verification endpoint to retry

### Duplicate payment records
- Records are upserted based on `student_id` and `transactionId`
- No duplicates should occur for same student + transaction

### Missing gateway data
- Ensure payment gateway Excel file is uploaded via `/payment-gateway/upload/`
- Check if gateway data contains the transaction ID

## Migration Guide

If you have existing data:
1. Call `GET /authapp/applications/payments/` to populate `users_payments` collection
2. Or use `POST /authapp/users-payments/verify/` for specific students
