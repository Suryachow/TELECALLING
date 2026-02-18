# Payment Record API Testing Tools

This folder contains multiple tools to test and interact with the Payment Record API endpoint.

## 📁 Files Overview

### 1. **payment_record_form.html** - Interactive HTML Form
A beautiful, responsive HTML form with pre-filled test data for manually testing the payment record endpoint.

**Features:**
- ✨ Modern, gradient UI design
- 📝 All payment fields with validation
- 🔄 Auto-generate transaction IDs (double-click field)
- 🎯 Pre-filled with sample data
- 📊 Live response display with syntax highlighting
- 📱 Mobile responsive
- ⚡ Real-time API calls

**How to use:**
1. Open `payment_record_form.html` in any web browser
2. Update the API URL if needed (defaults to `http://localhost:8000/api`)
3. Fill/modify the form fields
4. Click "Submit Payment Record"
5. View the response below the form

**Quick Tips:**
- Double-click Transaction ID field to auto-generate a new one
- Type a phone number and session_id + user_id will auto-populate
- Reset button restores default test values

---

### 2. **test_payment_record.rest** - REST Client Tests
Comprehensive test suite for VS Code REST Client extension.

**Features:**
- 20+ test scenarios
- Query parameter examples
- Filter combinations
- Gateway verification tests
- Full workflow examples

**How to use:**
1. Install [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension in VS Code
2. Open `test_payment_record.rest`
3. Update `@baseUrl` variable at top
4. Click "Send Request" link above any test

**Test Categories:**
- Basic CRUD operations
- Query with filters (phone, status, session_id, etc.)
- Gateway verification
- Validation error testing
- Combined workflows

---

### 3. **payment_record_swagger.yaml** - OpenAPI 3.0 Specification
Complete API documentation in OpenAPI format.

**Features:**
- 📋 Full endpoint specifications
- 🔍 Request/response schemas
- 📝 Multiple examples for each endpoint
- 🎯 Parameter descriptions
- ✅ Validation rules

**How to use:**
- View online: [Swagger Editor](https://editor.swagger.io/)
- Use with Swagger UI (see next file)
- Import into Postman/Insomnia
- Generate client SDKs

**Direct import:**
```bash
# Copy the file path and import into:
https://editor.swagger.io/
```

---

### 4. **payment_record_swagger_ui.html** - Interactive Swagger Documentation
Beautiful Swagger UI interface for testing the API directly from the browser.

**Features:**
- 🎨 Interactive API documentation
- 🔧 Built-in "Try it out" functionality
- 📊 Request/response samples
- 🔍 Schema validation
- 📝 Automatic code generation

**How to use:**
1. Ensure `payment_record_swagger.yaml` is in the same folder
2. Open `payment_record_swagger_ui.html` in a web browser
3. Click on any endpoint to expand it
4. Click "Try it out" button
5. Fill in parameters and click "Execute"

**Note:** For local testing, you may need to:
- Run a local web server (Python: `python -m http.server`)
- Or adjust CORS settings on your API server

---

## 🚀 Quick Start

### Method 1: Simple HTML Form (Recommended for beginners)
```bash
# Just open the file
start payment_record_form.html  # Windows
open payment_record_form.html   # Mac
xdg-open payment_record_form.html  # Linux
```

### Method 2: REST Client (VS Code)
```bash
# 1. Install REST Client extension
# 2. Open test_payment_record.rest in VS Code
# 3. Click "Send Request"
```

### Method 3: Swagger UI
```bash
# Serve files locally (required for YAML loading)
cd RestTest
python -m http.server 8080

# Then open in browser:
http://localhost:8080/payment_record_swagger_ui.html
```

---

## 📋 API Endpoint Summary

### POST /payments/record/
Creates a new payment record.

**Required Fields:**
- `paymentAmount` (number)
- `session_id` (string, auto-generated if not provided)

**Optional Fields:**
- `amount`, `paymentMethod`, `transactionId`, `paymentStatus`, `paymentDate`
- `discountApplied`, `couponCode`, `applicationStatus`
- `user_id`, `phone`

**Gateway Verification:**
If both `phone` and `transactionId` are provided, the system automatically verifies with payment gateway.

---

### GET /payments/
Retrieves payment records with filtering.

**Query Parameters:**
- `session_id`, `user_id`, `phone`, `transactionId`
- `status` (pending, completed)
- `verification_status`, `gateway_verified`
- `page`, `limit` (pagination)

---

### POST /payments/verify/
Manually triggers gateway verification.

**Required:**
- `session_id` (string)

---

### DELETE /payments/
Deletes a payment record.

**Required:**
- `session_id` (query parameter)

---

## 🧪 Test Data Examples

### Complete Record
```json
{
  "amount": 1200,
  "paymentAmount": 1200,
  "paymentMethod": "UPI",
  "transactionId": "TXN1769524284417PD1E7O",
  "paymentStatus": "completed",
  "paymentDate": "2026-01-27 20:01:25",
  "discountApplied": 0,
  "couponCode": "",
  "applicationStatus": "payment_completed",
  "session_id": "pending-8297551666",
  "user_id": "8297551666",
  "phone": "8297551666"
}
```

### Minimal Record
```json
{
  "paymentAmount": 1500,
  "transactionId": "TXN987654321",
  "phone": "9876543210"
}
```

### With Discount
```json
{
  "amount": 3000,
  "paymentAmount": 2500,
  "discountApplied": 500,
  "couponCode": "SAVE500",
  "transactionId": "TXN777888999",
  "phone": "9123456789"
}
```

---

## 🔧 Configuration

### Update API URL

**HTML Form:**
```html
<!-- In payment_record_form.html, line 251 -->
<input type="text" id="apiUrl" value="http://localhost:8000/api/payments/record/">
```

**REST Client:**
```http
# In test_payment_record.rest, line 3
@baseUrl = http://localhost:8000/api
```

**Swagger:**
```yaml
# In payment_record_swagger.yaml, lines 18-21
servers:
  - url: http://localhost:8000/api
```

---

## 🐛 Troubleshooting

### CORS Errors
Add to Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
```

### Swagger UI Not Loading
1. Use a local web server:
   ```bash
   python -m http.server 8080
   ```
2. Ensure YAML file is in same directory
3. Check browser console for errors

### REST Client Not Working
1. Install REST Client extension
2. Ensure server is running
3. Check `@baseUrl` variable
4. Verify Content-Type headers

---

## 📊 Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Payment record stored",
  "session_id": "pending-8297551666",
  "mongodb_id": "507f1f77bcf86cd799439011",
  "payment_verification": {
    "verified": true,
    "status": "verified",
    "gateway_data": {
      "status": "success",
      "amount": 1200,
      "bank_ref_no": "BANK123456",
      "mode": "UPI",
      "bank_name": "HDFC Bank"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "paymentStatus": ["\"invalid_status\" is not a valid choice."]
  }
}
```

---

## 📚 Additional Resources

- [REST Client Documentation](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [MongoDB Queries](https://www.mongodb.com/docs/manual/tutorial/query-documents/)

---

## 🎯 Common Use Cases

### 1. Test Complete Payment Flow
```bash
# Use HTML form for step-by-step testing
1. Open payment_record_form.html
2. Fill all fields
3. Submit and verify response
4. Check MongoDB for stored data
```

### 2. Bulk Testing with Multiple Scenarios
```bash
# Use REST Client
1. Open test_payment_record.rest in VS Code
2. Run tests sequentially
3. Check different filters and queries
```

### 3. API Documentation & Client Generation
```bash
# Use Swagger
1. Import payment_record_swagger.yaml to Swagger Editor
2. Generate client code (Python, JavaScript, etc.)
3. Share documentation with team
```

---

## ✅ Validation Rules

- `paymentStatus`: Must be one of ['pending', 'completed', 'failed']
- `phone`: Must be 10 digits (when provided)
- `amount`, `paymentAmount`, `discountApplied`: Must be >= 0
- `transactionId`: Used for gateway verification (with phone)

---

## 🔐 Security Notes

- Never commit sensitive credentials
- Use environment variables for API URLs in production
- Implement proper authentication/authorization
- Validate all input on server side
- Use HTTPS in production

---

**Need Help?** Check the inline comments in each file or open an issue.
