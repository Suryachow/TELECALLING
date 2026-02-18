# Payments Collection Feature (Step-wise Payment Storage)

## Overview
This feature automatically stores payment step data in a separate `payments` collection when submitted through the step-wise application process. It provides dedicated storage, automatic gateway verification, and specialized query capabilities for payment data.

## Key Changes

### Modified: `StepCacheView.post()`
**Location:** [authapp/views.py](authapp/views.py)

**Behavior Change:**
- **Before**: All step data (including payment) stored in `step_cache` collection
- **After**: Payment step data stored in dedicated `payments` collection

**Detection Logic:**
```python
if step_name.lower() == 'payment':
    # Store in payments collection
else:
    # Store in step_cache collection (existing behavior)
```

### Automatic Payment Verification
When payment step is submitted:
1. Data stored in `payments` collection
2. If `transactionId` and `phone` are present:
   - Automatically queries `payment_gateway_data` collection
   - Matches `txnid` and `phone` (handles string/numeric formats)
   - Updates payment record with verification status
3. Returns verification result immediately

## Database Collections

### Before
```
step_cache: {
  session_id: "pending-1234567890",
  personal: {...},
  educational: {...},
  payment: {...},      // ← Mixed with other steps
  documents: {...}
}
```

### After
```
step_cache: {
  session_id: "pending-1234567890",
  personal: {...},
  educational: {...},
  documents: {...}
  // payment step removed
}

payments: {               // ← New dedicated collection
  session_id: "pending-1234567890",
  user_id: "user123",
  payment_data: {...},
  gateway_verified: true,
  gateway_data: {...},
  verification_status: "verified",
  status: "pending",
  created_at: "2026-02-08T10:30:00",
  last_updated: "2026-02-08T10:35:00"
}
```

## Payments Collection Schema

```javascript
{
  "_id": ObjectId,
  "session_id": String,              // Unique session identifier
  "user_id": String,                 // User identifier (optional)
  "payment_data": {                  // Nested payment information
    "phone": String,
    "email": String,
    "paymentAmount": Number,
    "paymentCurrency": String,
    "paymentMethod": String,
    "transactionId": String,
    "paymentStatus": String,
    // ... other payment fields
  },
  "gateway_verified": Boolean,       // True if verified with gateway
  "gateway_data": {                  // Gateway transaction details
    "status": String,
    "amount": Number,
    "bank_ref_no": String,
    "mode": String,
    "bank_name": String,
    "addedon": String
  },
  "verification_status": String,     // "verified", "not_verified", etc.
  "status": String,                  // "pending", "completed"
  "created_at": DateTime,
  "last_updated": DateTime
}
```

## API Endpoints

### Submit Payment Step
**Endpoint:** `POST /authapp/step/payment/`

**Request:**
```json
{
  "session_id": "payment-session-123",
  "user_id": "user123",
  "data": {
    "phone": "1234567890",
    "email": "test@example.com",
    "paymentAmount": 5000.0,
    "paymentCurrency": "INR",
    "paymentMethod": "UPI",
    "transactionId": "TXN123456789",
    "paymentStatus": "pending"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "payment stored in payments collection",
  "session_id": "payment-session-123",
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

### New View: `PaymentsCollectionView`

#### GET `/authapp/payments/`
Query payment records with filtering and pagination.

**Query Parameters:**
- `session_id` - Filter by session ID
- `user_id` - Filter by user ID
- `phone` - Filter by phone number
- `transactionId` - Filter by transaction ID
- `verification_status` - Filter by verification status
- `gateway_verified` - Filter by gateway verification (true/false)
- `status` - Filter by payment status (pending, completed)
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 50)

**Example:**
```http
GET /authapp/payments/?phone=1234567890&gateway_verified=true&page=1&limit=20
```

**Response:**
```json
{
  "records": [...],
  "pagination": {
    "total_count": 50,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  },
  "statistics": {
    "verified_count": 35,
    "unverified_count": 15,
    "pending_count": 40,
    "completed_count": 10
  }
}
```

#### POST `/authapp/payments/verify/`
Manually trigger payment verification for a session.

**Request:**
```json
{
  "session_id": "payment-session-123"
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

#### DELETE `/authapp/payments/`
Delete a payment record by session_id.

**Example:**
```http
DELETE /authapp/payments/?session_id=payment-session-123
```

## Verification Statuses

| Status | Description |
|--------|-------------|
| `verified` | Successfully matched with payment gateway |
| `not_verified` | Not yet checked against gateway |
| `not_found_in_gateway` | No matching record in gateway data |
| `verification_failed` | Error occurred during verification |

## Payment Statuses

| Status | Description |
|--------|-------------|
| `pending` | Payment not yet completed |
| `completed` | Payment successfully completed |

## Data Flow

```
User Submits Payment Step
        ↓
POST /authapp/step/payment/
        ↓
StepCacheView detects step_name == 'payment'
        ↓
Store in 'payments' collection (not step_cache)
        ↓
Extract transactionId and phone
        ↓
Query 'payment_gateway_data' {txnid + phone match}
        ↓
Update payment record with verification status
        ↓
Return response with verification result
```

## Benefits

1. **Separation of Concerns**
   - Payment data isolated from other step data
   - Easier to query and manage payment-specific records

2. **Automatic Verification**
   - Real-time verification on submission
   - Immediate feedback to the application

3. **Dedicated Queries**
   - Filter payments by verification status
   - Track payment completion separately
   - Generate payment-specific statistics

4. **Audit Trail**
   - Tracks creation and update timestamps
   - Stores gateway verification data
   - Maintains verification history

5. **Backward Compatibility**
   - Non-payment steps continue to use step_cache
   - No changes needed to existing step submission logic

## Testing

Use the REST test file: [RestTest/test_payments_collection.rest](RestTest/test_payments_collection.rest)

Test scenarios:
1. Submit payment step data
2. Query all payment records
3. Filter by various criteria
4. Manually trigger verification
5. Delete payment records

## Usage Examples

### Submit Payment Step
```bash
curl -X POST http://localhost:8000/authapp/step/payment/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "data": {
      "phone": "1234567890",
      "transactionId": "TXN123",
      "paymentAmount": 5000
    }
  }'
```

### Query Verified Payments
```bash
curl http://localhost:8000/authapp/payments/?gateway_verified=true
```

### Verify Payment
```bash
curl -X POST http://localhost:8000/authapp/payments/verify/ \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session-123"}'
```

## Integration with Existing Features

### Works With:
- ✅ `users_payments` collection (payment records from completed applications)
- ✅ `payment_gateway_data` collection (raw gateway data)
- ✅ `step_cache` collection (other step data)
- ✅ Existing step-wise submission flow

### Does Not Affect:
- ❌ Other step types (personal, educational, documents)
- ❌ Existing `step_cache` queries for non-payment steps
- ❌ Final submission process (`StepSubmitView`)

## Migration Notes

### Existing Data
- Old payment data in `step_cache` remains unchanged
- New payment submissions automatically use new collection
- No migration required for existing records

### Accessing Old Payment Data
Old payment data in `step_cache`:
```http
GET /authapp/step/cache/?phone=1234567890&current=payment
```

New payment data in `payments` collection:
```http
GET /authapp/payments/?phone=1234567890
```

## Troubleshooting

### Payment not storing in payments collection
- Verify `step_name` is exactly "payment" (case-insensitive)
- Check that session_id is provided or auto-generated

### Verification not working
- Ensure `transactionId` and `phone` are in payment_data
- Verify payment gateway data exists in `payment_gateway_data` collection
- Check phone format matches (string vs numeric)

### Cannot find payment record
- Use correct collection endpoint: `/authapp/payments/`
- Don't look in step_cache for new payment submissions

## Future Enhancements

1. Add payment status transitions tracking
2. Implement payment retry mechanism
3. Add payment notification/webhooks
4. Support multiple payment methods
5. Add payment reconciliation reports
6. Implement refund tracking

## Related Documentation

- [Users Payments Feature](USERS_PAYMENTS_FEATURE.md) - Completed application payment records
- [Payment Gateway Upload](../RestTest/PAYMENT_UPLOAD_TESTING.md) - Gateway data upload
- REST Tests: [test_payments_collection.rest](../RestTest/test_payments_collection.rest)
