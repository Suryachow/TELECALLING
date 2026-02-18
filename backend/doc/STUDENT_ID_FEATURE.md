# Student ID Generation Feature

## Overview
The Django API now automatically generates unique student IDs in the format: `VSAT{year}{sequential_number}`

## Format Details
- **Prefix**: `VSAT` (fixed)
- **Year**: Current year (e.g., `2025`)
- **Sequential Number**: 6-digit padded number starting from `000001`

## Examples
- First student in 2025: `VSAT2025000001`
- Second student in 2025: `VSAT2025000002`
- 100th student in 2025: `VSAT2025000100`

## Implementation
The `generate_student_id()` function in `authapp/views.py`:
1. Gets the current year
2. Queries MongoDB for existing student IDs with the same year prefix
3. Finds the highest sequential number for the current year
4. Increments by 1 and formats with leading zeros

## API Response Changes
All student-related API responses now include both:
- `student_id`: The MongoDB ObjectId (for internal use)
- `generated_student_id`: The human-readable student ID (e.g., `VSAT2025000001`)

## Affected Endpoints
- **POST /api/students/**: Creates student with auto-generated ID
- **GET /api/students/approval/**: Shows generated student ID
- **POST /api/students/status/**: Shows generated student ID in response
- **GET /api/applications/**: Shows generated student ID for all applications

## Database Storage
The generated student ID is stored in the MongoDB document as the `student_id` field, separate from the MongoDB `_id` field.

## Deployment Notes for Vercel
- The `api/index.py` file properly sets up Django WSGI
- `vercel.json` configures Vercel to use Python runtime
- Remember to set environment variables in Vercel dashboard
- Use a cloud database (MongoDB Atlas) for persistence
