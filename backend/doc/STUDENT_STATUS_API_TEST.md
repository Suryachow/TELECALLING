# Test cases for Student Status API with generated_student_id support

"""
Testing the /api/student/status/ endpoint

The endpoint now supports:
1. Querying by email
2. Querying by MongoDB ObjectId (24 characters)
3. Querying by generated student ID (e.g., VSAT2025000001)

POST /api/student/status/

Example requests:

1. Query by email:
{
    "email": "student@example.com"
}

2. Query by MongoDB ObjectId:
{
    "student_id": "507f1f77bcf86cd799439011"  // 24-character ObjectId
}

3. Query by generated student ID:
{
    "student_id": "VSAT2025000001"  // Generated student ID format
}

Expected response format:
{
    "application_submitted": true,
    "student_details": {
        "student_id": "507f1f77bcf86cd799439011",        // MongoDB ObjectId
        "generated_student_id": "VSAT2025000001",        // Generated student ID
        "name": "John Doe",
        "email": "student@example.com",
        "phone": "1234567890",
        "isApproved": false,
        "approval_status": "pending",
        "remarks": "",
        "submission_date": "2025-07-27T10:30:00Z",
        "approval_date": null
    },
    "message": "Student application found"
}

The key fix:
- The API now returns both "student_id" (MongoDB ObjectId) and "generated_student_id" (VSAT format)
- You can query using either the MongoDB ObjectId or the generated student ID
- The serializer now accepts student IDs of varying lengths (not just 24 characters)
"""
