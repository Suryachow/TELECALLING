import os
import logging
import uuid
import random
import bcrypt
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query, Body, Request, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

# ─── CONFIGURATION ────────────────────────────────────────────────────────────
MONGO_URI = os.getenv('MONGO_URI', "mongodb://admin:Vfstr%21%40%23@18.60.148.8:27017/?authSource=admin")
DB_NAME = "initReg"

app = FastAPI(title="Telecalling & LeadLoop Backend (FastAPI)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DATABASE ─────────────────────────────────────────────────────────────────
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

def serialize_doc(doc):
    if not doc: return None
    doc["id"] = str(doc.pop("_id"))
    # Handle binary data (for photos/marks) if any
    for k, v in doc.items():
        if isinstance(v, bytes):
            doc[k] = "binary_data_omitted"
    return doc

# ─── MODELS ───────────────────────────────────────────────────────────────────

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminRegister(BaseModel):
    institutionCode: str
    institutionName: str
    name: str
    db_uri: str
    admin_email: EmailStr
    password: str
    contactPhone: Optional[str] = ""
    logo_url: Optional[str] = ""
    address: Optional[str] = ""
    settings: Optional[dict] = {}

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    campus: str
    program: str
    specialization: str
    password: str = "admin@123"

class FollowUpCreate(BaseModel):
    phone: str
    name: str
    email: Optional[str] = ""
    program: Optional[str] = ""
    campus: Optional[str] = ""
    next_follow_up: Optional[str] = ""
    priority: Optional[str] = "medium"
    status: Optional[str] = "scheduled"
    notes: Optional[str] = ""

class CallLog(BaseModel):
    lead_id: str
    duration: int
    notes: str
    outcome: str

class StepData(BaseModel):
    session_id: Optional[str] = None
    data: dict
    user_id: Optional[str] = None

# ─── UTILS ────────────────────────────────────────────────────────────────────

def generate_student_id(phone: str) -> str:
    # Mimic Django's logic if needed, otherwise simplified unique ID
    suffix = phone[-4:]
    random_str = str(random.randint(1000, 9999))
    return f"VU25GNT{suffix}{random_str}"

# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.post("/api/admin/register/")
async def admin_register(data: AdminRegister):
    existing = await db.admins.find_one({"admin_email": data.admin_email})
    if existing:
        raise HTTPException(status_code=409, detail="Admin with this email already exists")
    
    hashed = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt())
    doc = data.dict()
    doc["password"] = hashed.decode('utf-8')
    await db.admins.insert_one(doc)
    return {"success": True, "message": "Admin registered successfully"}

@app.post("/api/admin/login/")
async def admin_login(data: AdminLogin):
    admin = await db.admins.find_one({"admin_email": data.email})
    if not admin or not bcrypt.checkpw(data.password.encode('utf-8'), admin["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "admin": {
            "name": admin["name"],
            "admin_email": admin["admin_email"],
            "institutionName": admin["institutionName"]
        }
    }

@app.post("/api/register/")
async def user_register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    
    doc = data.dict()
    # Simple store for demo, ideally hash password
    await db.users.insert_one(doc)
    return {"success": True, "message": "User registered successfully"}

@app.post("/api/login/")
async def user_login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "success": True,
        "user": serialize_doc(user)
    }

# ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

@app.get("/api/applications/")
async def get_all_applications():
    cursor = db.students.find({})
    apps = await cursor.to_list(length=1000)
    return [serialize_doc(a) for a in apps]

@app.get("/api/student/status/")
async def get_student_status(email: Optional[str] = None, phone: Optional[str] = None):
    query = {}
    if email: query["email"] = email
    if phone: query["phone"] = phone
    if not query: raise HTTPException(status_code=400, detail="Email or Phone required")
    
    student = await db.students.find_one(query)
    if not student: return {"submitted": False}
    return {"submitted": True, "status": student.get("isApproved", False)}

# ─── STEP CACHE ROUTES ────────────────────────────────────────────────────────

@app.post("/api/step/{step_name}/")
async def cache_step(step_name: str, payload: StepData):
    session_id = payload.session_id or f"pending-{payload.data.get('phone', str(uuid.uuid4()))}"
    
    await db.step_cache.update_one(
        {"session_id": session_id},
        {"$set": {step_name: payload.data, "last_updated": datetime.utcnow()}},
        upsert=True
    )
    return {"success": True, "session_id": session_id}

@app.get("/api/step/cache/")
async def get_step_cache(phone: Optional[str] = None):
    if phone:
        session_id = f"pending-{phone}"
        cache = await db.step_cache.find_one({"session_id": session_id})
        return serialize_doc(cache) if cache else {"message": "No cache found"}
    
    cursor = db.step_cache.find({})
    caches = await cursor.to_list(length=1000)
    return [serialize_doc(c) for c in caches]

@app.post("/api/step/submit/")
async def submit_application(payload: dict = Body(...)):
    session_id = payload.get("session_id")
    cached = await db.step_cache.find_one({"session_id": session_id})
    if not cached: raise HTTPException(status_code=404, detail="No cached data found")
    
    # Merge all steps, generate student ID
    merged = {k: v for k, v in cached.items() if k not in ["_id", "session_id", "last_updated"]}
    phone = merged.get("personal", {}).get("phone") or merged.get("phone")
    merged["student_id"] = generate_student_id(str(phone))
    merged["isApproved"] = False
    merged["created_at"] = datetime.utcnow()
    
    await db.students.insert_one(merged)
    await db.step_cache.delete_one({"session_id": session_id})
    return {"success": True, "student_id": merged["student_id"]}

# ─── FOLLOW-UP & CALL ROUTES ─────────────────────────────────────────────────

@app.get("/api/follow-ups/")
async def get_follow_ups(status: Optional[str] = None, phone: Optional[str] = None):
    query = {}
    if status: query["status"] = status
    if phone: query["phone"] = phone
    cursor = db.follow_ups.find(query).sort("next_follow_up", 1)
    res = await cursor.to_list(length=500)
    return {"follow_ups": [serialize_doc(f) for f in res]}

@app.post("/api/follow-ups/")
async def create_follow_up(data: FollowUpCreate):
    doc = data.dict()
    doc["created_at"] = datetime.utcnow()
    await db.follow_ups.insert_one(doc)
    return {"success": True}

@app.post("/api/telecalling/calls/log/")
async def log_call(log: CallLog):
    doc = log.dict()
    doc["timestamp"] = datetime.utcnow()
    await db.call_logs.insert_one(doc)
    return {"success": True}

# ─── HEALTH & MISC ────────────────────────────────────────────────────────────

@app.get("/api/health/db/")
async def health_check():
    try:
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/messaging/whatsapp/templates/")
async def get_templates():
    return {
        "dataObj": [
            {"id": 1, "templateName": "Welcome Msg", "msgText": "Hello [Name], welcome to VIGNAN!", "isActive": True},
            {"id": 2, "templateName": "Payment Reminder", "msgText": "Hi [Name], your payment is due.", "isActive": True}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
