# Vercel Deployment Guide for Django Admissions API

## 🚀 Quick Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## 📁 Files Created for Vercel Deployment

### 1. `vercel.json` - Vercel Configuration
- Configures Python runtime
- Routes all requests to Django WSGI app

### 2. `api/index.py` - WSGI Entrypoint
- Sets Django settings module
- Creates WSGI application for Vercel

## 🔧 Environment Variables (Set in Vercel Dashboard)

Required environment variables to set in Vercel:

```bash
DJANGO_SETTINGS_MODULE=user_auth_django.settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
MONGO_URI=your-mongodb-atlas-connection-string
ALLOWED_HOSTS=your-app-name.vercel.app
```

## 🆔 Student ID Generation Feature

### Format
- **Pattern**: `VSAT{YEAR}{SEQUENTIAL_NUMBER}`
- **Example**: `VSAT2025000001`, `VSAT2025000002`, etc.

### Implementation
- Automatically generates unique student IDs
- Year-based sequential numbering
- 6-digit zero-padded sequential numbers
- Stored in MongoDB as `student_id` field

### API Response Updates
All student endpoints now return:
- `student_id`: MongoDB ObjectId (internal)
- `generated_student_id`: Human-readable ID (e.g., `VSAT2025000001`)

## 🌐 CORS Configuration
- Configured for localhost development
- Supports Vercel.app subdomains
- Production-ready CORS settings

## 📊 Database
- Uses MongoDB Atlas (cloud database)
- Connection string configurable via environment variable
- Persistent storage for production

## 🔗 API Endpoints

### Student Registration
- **POST** `/api/students/` - Create student with auto-generated ID

### Student Status
- **POST** `/api/students/status/` - Check application status
- **GET** `/api/students/approval/` - Get approval status

### Applications Management
- **GET** `/api/applications/` - List all applications
- **POST** `/api/applications/` - Filter applications

## 🛠️ Development vs Production

### Development
```python
DEBUG = True
CORS_ALLOW_ALL_ORIGINS = True  # Enable for local testing
```

### Production (Vercel)
```python
DEBUG = False
CORS_ALLOWED_ORIGINS = [specific domains]
CORS_ALLOWED_ORIGIN_REGEXES = [vercel domains]
```

## 🚨 Important Notes

1. **Static Files**: Vercel doesn't persist files. Use AWS S3 or similar for file uploads
2. **Database**: Must use external database (MongoDB Atlas recommended)
3. **Environment Variables**: Never commit secrets to code
4. **CORS**: Configure properly for your frontend domain

## 📝 Testing Locally

Before deploying, test locally:
```bash
python manage.py check
python manage.py runserver
```

## 🎯 Next Steps After Deployment

1. Set environment variables in Vercel dashboard
2. Test API endpoints
3. Update frontend to use new Vercel API URL
4. Monitor logs for any issues

Your Django API with automatic student ID generation is now ready for Vercel deployment! 🎉
