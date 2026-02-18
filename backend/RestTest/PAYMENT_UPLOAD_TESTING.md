# Payment Gateway Upload API - Testing Guide

## 📋 Overview
This feature allows bulk upload of payment details from Excel files into the MongoDB database. It supports all 79 columns as specified by the payment gateway.

## 🚀 Quick Start

### 1. Generate Sample Excel File
Run the Python script to generate a sample Excel file for testing:

```bash
cd RestTest
python generate_sample_payments.py
```

This will create `sample_payments.xlsx` with 20 sample payment records.

### 2. Test the API
Open `test_payment_gateway_upload.rest` in VS Code with REST Client extension.

## 📡 API Endpoints

### 1. Upload Excel File
**POST** `/api/payment-gateway/upload/`

Upload an Excel file (.xlsx or .xls) with payment details.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (Excel file)

**Response:**
```json
{
  "message": "Payment details uploaded successfully",
  "total_records": 150,
  "inserted_count": 150,
  "status": "success"
}
```

**Error Response:**
```json
{
  "message": "Missing required columns in Excel file",
  "missing_columns": ["txnid", "email"]
}
```

---

### 2. Retrieve Payment Records
**GET** `/api/payment-gateway/data/`

Retrieve uploaded payment records with optional filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)
- `txnid` (optional): Filter by transaction ID
- `email` (optional): Filter by email
- `phone` (optional): Filter by phone number
- `status` (optional): Filter by payment status

**Examples:**
```http
# Get all records (paginated)
GET /api/payment-gateway/data/?page=1&limit=50

# Filter by transaction ID
GET /api/payment-gateway/data/?txnid=TXN123456789

# Filter by email
GET /api/payment-gateway/data/?email=student@example.com

# Filter by status and paginate
GET /api/payment-gateway/data/?status=success&page=1&limit=20

# Multiple filters
GET /api/payment-gateway/data/?email=test@example.com&status=success
```

**Response:**
```json
{
  "records": [...],
  "total_count": 150,
  "page": 1,
  "limit": 50,
  "total_pages": 3
}
```

---

### 3. Delete Payment Records
**DELETE** `/api/payment-gateway/data/`

Delete payment records (use with caution).

**Query Parameters:**
- `id` (optional): Delete specific record by MongoDB ObjectId
- `confirm_delete_all` (optional): Set to "YES_DELETE_ALL" to delete all records

**Examples:**
```http
# Delete specific record
DELETE /api/payment-gateway/data/?id=507f1f77bcf86cd799439011

# Delete all records (DANGEROUS!)
DELETE /api/payment-gateway/data/?confirm_delete_all=YES_DELETE_ALL
```

**Response:**
```json
{
  "message": "Payment record deleted successfully",
  "deleted_count": 1
}
```

---

## 📊 Excel File Requirements

### Required Columns (79 total):
The Excel file must contain these exact column headers:

1. status
2. txnid
3. addedon
4. id
5. amount
6. productinfo
7. firstname
8. email
9. phone
10. ip
11. merchant_id
12. bank_name
13. bank_ref_no
14. cardtype
15. mode
16. error_code
17. errorDescription
18. error_message
19. pgmid
20. pg_response
21. issuing_bank
22. payment_source
23. name_on_card
24. card_number
25. address_line1
26. address_line2
27. state
28. country
29. zipcode
30. shipping_firstname
31. shipping_lastname
32. shipping_address1
33. shipping_address2
34. shipping_city
35. shipping_state
36. shipping_country
37. shipping_zipcode
38. shipping_phone
39. transaction_fee
40. discount
41. additional_charges
42. amount(inr)
43. udf1
44. udf2
45. udf3
46. udf4
47. udf5
48. field0
49. field1
50. field2
51. field3
52. field4
53. field5
54. field6
55. field7
56. field8
57. device_info
58. merchant_subvention_amount
59. utr
60. recon_ref_number
61. settlement_amount
62. settlement_date
63. service_fees
64. tsp_charges
65. convenience_fee
66. cgst
67. sgst
68. igst
69. token_bin
70. last_four_digits
71. arn
72. auth_code
73. conversion_status
74. conversion_date
75. conversion_remarks
76. mer_service_fee
77. currency_type
78. network_type
79. unmapped_status
80. category
81. sub_category

### File Specifications:
- **Format:** .xlsx or .xls
- **Max Size:** 10 MB
- **Encoding:** UTF-8 recommended

---

## 🧪 Testing with REST Client

1. Install the **REST Client** extension in VS Code
2. Open `test_payment_gateway_upload.rest`
3. Click "Send Request" above any HTTP request
4. View the response in the right panel

### Test Scenarios Included:

✅ Upload valid Excel file
✅ Retrieve all records (paginated)
✅ Filter by transaction ID
✅ Filter by email
✅ Filter by phone
✅ Filter by status
✅ Multiple filters combined
✅ Delete specific record
✅ Delete all records
✅ Invalid file upload (error handling)
✅ Wrong file type (error handling)

---

## 🗄️ Database Storage

**Database:** MongoDB
**Collection:** `payment_gateway_data`
**Database Name:** `initReg`

### Additional Metadata:
Each uploaded record includes:
- `uploaded_at`: Timestamp of upload
- `uploaded_by`: Username (if authenticated) or "anonymous"

---

## 🔒 Security Considerations

1. **File Validation:** Only .xlsx and .xls files are accepted
2. **Size Limit:** Maximum 10 MB per file
3. **Column Validation:** All required columns must be present
4. **Data Sanitization:** NaN values are converted to None for MongoDB compatibility

---

## 📝 Example Usage with cURL

### Upload File:
```bash
curl -X POST http://localhost:8000/api/payment-gateway/upload/ \
  -F "file=@sample_payments.xlsx"
```

### Get Records:
```bash
curl -X GET "http://localhost:8000/api/payment-gateway/data/?page=1&limit=10"
```

### Filter by Email:
```bash
curl -X GET "http://localhost:8000/api/payment-gateway/data/?email=student1@example.com"
```

### Delete Record:
```bash
curl -X DELETE "http://localhost:8000/api/payment-gateway/data/?id=507f1f77bcf86cd799439011"
```

---

## 🐛 Troubleshooting

### Error: "Missing required columns"
- Ensure all 79 columns are present in your Excel file
- Check for typos in column names
- Column names are case-sensitive

### Error: "Only Excel files (.xlsx, .xls) are allowed"
- Ensure file has .xlsx or .xls extension
- CSV files are not supported

### Error: "File size should not exceed 10MB"
- Split large files into smaller chunks
- Remove unnecessary rows or compress the file

### Error: "ModuleNotFoundError: No module named 'pandas'"
- Run: `pip install pandas openpyxl`

---

## 📞 Support

For issues or questions, check:
1. Django server logs
2. MongoDB connection status
3. File format and column names
4. Network connectivity

---

## 🎯 Next Steps

1. ✅ Generate sample file: `python generate_sample_payments.py`
2. ✅ Start Django server: `python manage.py runserver`
3. ✅ Test upload endpoint in `test_payment_gateway_upload.rest`
4. ✅ Verify data in MongoDB
5. ✅ Test retrieve and filter endpoints

Happy Testing! 🚀
