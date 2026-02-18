import os
import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .serializers import AdminRegisterSerializer, OTPBaseLoginSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse, Http404
from datetime import datetime
import random
from bson import ObjectId
import bcrypt
from datetime import timedelta
from django.utils import timezone as djtimezone
import pandas as pd
import math

from .serializers import SendOTPSerializer, VerifyOTPSerializer
from .serializers import RegisterSerializer, LoginSerializer, StudentSerializer, StudentApprovalSerializer, StudentStatusSerializer, PaymentUploadSerializer, PaymentRecordSerializer

from requests.auth import HTTPBasicAuth

class AdminLoginView(APIView):
    def post(self, request):
        serializer = {'email': request.data.get('email'), 'password': request.data.get('password')}
        if serializer:
            data = serializer
            db = settings.MONGO_DB["initReg"]
            admins = db.admins

            admin = admins.find_one({"admin_email": data['email']})
            if not admin:
                return Response({"message": "Admin not found"}, status=404)

            if not bcrypt.checkpw(data['password'].encode('utf-8'), admin['password'].encode('utf-8')):
                return Response({"message": "Incorrect password"}, status=400)

            return Response({
                "message": "Admin login successful",
                "admin": {
                    "institutionCode": admin.get('institutionCode', ''),
                    "institutionName": admin.get('institutionName', ''),
                    "admin_email": admin.get('admin_email', ''),
                    "name": admin.get('name', ''),
                    "contactPhone": admin.get('contactPhone', ''),
                    "logo_url": admin.get('logo_url', ''),
                    "address": admin.get('address', ''),
                    "settings": admin.get('settings', {})
                }
            }, status=200)

        return Response(serializer.errors, status=400)

class AdminRegistrationView(APIView):
    # get the admin registration details by passing admin_email as a parameter
    def get(self, request):
        admin_email = request.GET.get('admin_email')
        if not admin_email:
            return Response({"message": "Admin email parameter is required"}, status=400)
        db = settings.MONGO_DB["initReg"]
        admins = db.admins
        admin = admins.find_one({"admin_email": admin_email})
        if not admin:
            return Response({"message": "Admin not found"}, status=404)
        admin_details = {
            "institutionCode": admin.get('institutionCode', ''),
            "institutionName": admin.get('institutionName', ''),
            "db_uri": admin.get('db_uri', ''),
            "name": admin.get('name', ''),
            "admin_email": admin.get('admin_email', ''),
            "contactPhone": admin.get('contactPhone', ''),
            "logo_url": admin.get('logo_url', ''),
            "address": admin.get('address', ''),
            "settings": admin.get('settings', {})
        }
        return Response({"admin": admin_details}, status=200)

    # update admin password by passing admin_email as a parameter
    def put(self, request):
        serializer = {'admin_email': request.data.get('admin_email'), 'admin_password': request.data.get('new_password')}

        db = settings.MONGO_DB["initReg"]
        admins = db.admins
        admin = admins.find_one({"admin_email": serializer['admin_email']})
        if not admin:
            return Response({"success": False, "message": "Admin not found"}, status=404)
        hashed = bcrypt.hashpw(serializer['admin_password'].encode('utf-8'), bcrypt.gensalt())
        admins.update_one(
            {"admin_email": serializer['admin_email']},
            {"$set": {"password": hashed.decode('utf-8')}}
        )
        return Response({"success": True, "message": "Admin password updated successfully"}, status=200)

    def post(self, request):
        serializer = AdminRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": serializer.errors}, status=400)

        data = serializer.validated_data
        db = settings.MONGO_DB["initReg"]
        admins = db.admins
        # Check for unique email
        if admins.find_one({"admin_email": data['admin_email']}):
            return Response({"success": False, "message": "Admin with this email already exists"}, status=409)
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        admin = {
            "institutionCode": data.get('institutionCode', ''),
            "institutionName": data.get('institutionName', ''),
            "db_uri": data.get('db_uri', ''),
            "name": data['name'],
            "admin_email": data['admin_email'],
            "password": hashed.decode('utf-8'),
            "contactPhone": data.get('contactPhone', ''),
            "logo_url": data.get('logo_url', ''),
            "address": data.get('address', ''),
            "settings": data.get('settings', {})
        }
        admins.insert_one(admin)
        return Response({"success": True, "message": "Admin registered successfully"}, status=201)

class UGStudentRegistrationView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed",
                "errors": serializer.errors
            }, status=400)

        db = settings.MONGO_DB["initReg"]
        students = db.students

        validated_data = serializer.validated_data
        files = request.FILES

        # Get selected program, specialization, campus using phone from RegisterSerializer
        phone = validated_data.get('phone')
        # Get user details by phone number using RegisterView logic
        db_users = settings.MONGO_DB["initReg"].users
        reg_user = db_users.find_one({"phone": phone})
        selected_program = reg_user.get('program', '') if reg_user else ''
        selected_specialization = reg_user.get('specialization', '') if reg_user else ''
        selected_campus = reg_user.get('campus', '') if reg_user else ''

        # Generate unique student ID for UG registration
        student_id = generate_student_id(validated_data.get('phone'))

        student_data = {
            "student_id": student_id,
            "firstName": validated_data.get('firstName'),
            "lastName": validated_data.get('lastName'),
            "email": validated_data.get('email'),
            "phone": phone,
            "dob": validated_data.get('dob'),
            "gender": validated_data.get('gender'),
            "category": validated_data.get('category'),
            "schoolName": validated_data.get('schoolName'),
            "board": validated_data.get('board'),
            "percentage": validated_data.get('percentage'),
            "passingYear": validated_data.get('passingYear'),
            "rollNumber": validated_data.get('rollNumber'),
            "street": validated_data.get('street'),
            "city": validated_data.get('city'),
            "state": validated_data.get('state'),
            "pincode": validated_data.get('pincode'),
            "country": validated_data.get('country'),
            "isApproved": validated_data.get('isApproved', False),
            "registration_type": "UG",
            "program": selected_program,
            "specialization": selected_specialization,
            "campus": selected_campus
        }

        # Check for duplicate email
        if students.find_one({"email": student_data['email']}):
            return Response({
                "success": False,
                "message": "Student with this email already exists"
            }, status=409)

        # Handle file uploads
        file_fields = ['marksheet10', 'marksheet12', 'photo', 'signature', 'categoryCert']
        file_types = {}
        for field_name in file_fields:
            if field_name in files:
                file_obj = files[field_name]
                student_data[field_name] = file_obj.read()
                file_types[field_name] = file_obj.content_type
            else:
                student_data[field_name] = None
                file_types[field_name] = ''

        student_data['fileTypes'] = file_types

        result = students.insert_one(student_data)

        return Response({
            "success": True,
            "message": "UG student registered successfully.",
            "student_id": student_id,
            "mongodb_id": str(result.inserted_id)
        }, status=201)

class OTPBaseLoginView(APIView):
    def post(self, request):
        serializer = OTPBaseLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": serializer.errors}, status=400)

        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']

        db = settings.MONGO_DB["initReg"]
        otps = db.otps
        users = db.users
        record = otps.find_one({"phone": phone, "otp": otp})
        if not record:
            return Response({"success": False, "message": "Invalid OTP"}, status=400)
        if record.get("verified"):
            # Check if user exists for this phone
            user = users.find_one({"phone": phone})
            if not user:
                return Response({"success": False, "message": "User not found for this phone"}, status=404)
            # Return user info (customize as needed)
            return Response({
                "success": True,
                "message": "Login successful",
                "user": {
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "phone": user.get('phone'),
                    "role": user.get('role', 'user')
                }
            }, status=200)
        else:
            return Response({"success": False, "message": "OTP not verified yet"}, status=400)

def log_user_login(user_id, status):
    db = settings.MONGO_DB["initReg"]
    db.login_logs.insert_one({
        "user_id": user_id,
        "timestamp": datetime.utcnow(),
        "status": status  # "success" or "failure"
    })

def log_step_activity(session_id, step_name, user_id=None):
    db = settings.MONGO_DB["initReg"]
    db.step_logs.insert_one({
        "session_id": session_id,
        "step_name": step_name,
        "user_id": user_id,
        "timestamp": datetime.utcnow()
    })

def store_payment_record(student_data, verify_gateway=True):
    """
    Store payment record in users_payments collection and optionally verify with payment gateway.
    
    Args:
        student_data: Dictionary containing student and payment information
        verify_gateway: Boolean to enable/disable gateway verification
    
    Returns:
        Dictionary with verification status and gateway data if available
    """
    try:
        db = settings.MONGO_DB["initReg"]
        users_payments = db.users_payments
        payment_gateway_data = db.payment_gateway_data
        
        payment_record = {
            "student_id": str(student_data.get("_id", "")),
            "generated_student_id": student_data.get('student_id', ''),
            "name": f"{student_data.get('firstName', '')} {student_data.get('lastName', '')}",
            "email": student_data.get('email', ''),
            "phone": student_data.get('phone', ''),
            "payment_details": {
                "paymentAmount": student_data.get('paymentAmount', 0.0),
                "paymentCurrency": student_data.get('paymentCurrency', 'INR'),
                "paymentMethod": student_data.get('paymentMethod', ''),
                "transactionId": student_data.get('transactionId', ''),
                "paymentStatus": student_data.get('paymentStatus', 'pending'),
                "paymentDate": student_data.get('paymentDate').isoformat() if student_data.get('paymentDate') else datetime.now().isoformat(),
                "discountApplied": student_data.get('discountApplied', 0.0),
                "couponCode": student_data.get('couponCode', ''),
                "applicationStatus": student_data.get('applicationStatus', '')
            },
            "gateway_verified": False,
            "gateway_data": None,
            "verification_status": "not_verified",
            "created_at": datetime.now(),
            "last_updated": datetime.now()
        }
        
        # Cross-verify with payment_gateway_data if enabled
        verification_result = {
            "verified": False,
            "status": "not_verified",
            "gateway_data": None
        }
        
        if verify_gateway:
            txn_id = student_data.get('transactionId')
            phone = student_data.get('phone')
            
            if txn_id and phone:
                try:
                    # Handle phone as both string and numeric
                    phone_query = {'$in': [phone, str(phone)]}
                    try:
                        phone_as_int = int(phone)
                        phone_query = {'$in': [phone, str(phone), phone_as_int]}
                    except ValueError:
                        pass
                    
                    gateway_record = payment_gateway_data.find_one({
                        'txnid': txn_id,
                        'phone': phone_query
                    })
                    
                    if gateway_record:
                        payment_record['gateway_verified'] = True
                        payment_record['verification_status'] = "verified"
                        payment_record['gateway_data'] = {
                            "status": gateway_record.get('status'),
                            "amount": gateway_record.get('amount'),
                            "bank_ref_no": gateway_record.get('bank_ref_no'),
                            "mode": gateway_record.get('mode'),
                            "bank_name": gateway_record.get('bank_name'),
                            "addedon": gateway_record.get('addedon'),
                            "txnid": gateway_record.get('txnid')
                        }
                        
                        verification_result["verified"] = True
                        verification_result["status"] = "verified"
                        verification_result["gateway_data"] = payment_record['gateway_data']
                        
                        # Update payment status based on gateway data
                        gateway_status = str(gateway_record.get('status', '')).lower()
                        if gateway_status in ['success', 'completed']:
                            payment_record['payment_details']['paymentStatus'] = 'completed'
                    else:
                        payment_record['verification_status'] = "not_found_in_gateway"
                        verification_result["status"] = "not_found_in_gateway"
                except Exception as verify_err:
                    print(f"Payment verification error: {verify_err}")
                    payment_record['verification_status'] = "verification_failed"
                    verification_result["status"] = "verification_failed"
        
        # Store/update in users_payments collection
        if payment_record.get('payment_details', {}).get('transactionId'):
            users_payments.update_one(
                {
                    "student_id": payment_record["student_id"],
                    "payment_details.transactionId": payment_record["payment_details"]["transactionId"]
                },
                {"$set": payment_record},
                upsert=True
            )
        
        return verification_result
    
    except Exception as err:
        print(f"Error in store_payment_record: {err}")
        return {
            "verified": False,
            "status": "error",
            "error": str(err)
        }

class StepCacheView(APIView):
    def post(self, request, step_name):
        session_id = request.data.get('session_id')
        step_data = request.data.get('data')
        user_id = request.data.get('user_id')
        # Auto-generate session_id if missing
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())
        if not step_data:
            return Response({"success": False, "message": "Missing step data"}, status=400)
        
        db = settings.MONGO_DB["initReg"]
        
        # If step_name is 'payment', store in payments collection
        if step_name.lower() == 'payment':
            payments_collection = db.payments
            
            # Prepare payment record
            payment_status = step_data.get('paymentStatus') or "pending"
            payment_record = {
                "session_id": session_id,
                "user_id": user_id,
                "payment_data": step_data,
                "created_at": datetime.now(),
                "last_updated": datetime.now(),
                "status": payment_status
            }
            
            # Store in payments collection
            payments_collection.update_one(
                {"session_id": session_id},
                {"$set": payment_record},
                upsert=True
            )

            # Also store payment step in step_cache for step-wise tracking
            cache = db.step_cache
            cache.update_one(
                {"session_id": session_id},
                {"$set": {"payment": step_data}},
                upsert=True
            )
            
            # Cross-verify with payment gateway if transaction details are present
            verification_result = None
            txn_id = step_data.get('transactionId') or step_data.get('txnid')
            phone = step_data.get('phone')
            
            if txn_id and phone:
                try:
                    payment_gateway_data = db.payment_gateway_data
                    
                    # Handle phone as both string and numeric
                    phone_query = {'$in': [phone, str(phone)]}
                    try:
                        phone_as_int = int(phone)
                        phone_query = {'$in': [phone, str(phone), phone_as_int]}
                    except ValueError:
                        pass
                    
                    gateway_record = payment_gateway_data.find_one({
                        'txnid': txn_id,
                        'phone': phone_query
                    })
                    
                    if gateway_record:
                        verification_result = {
                            "verified": True,
                            "status": "verified",
                            "gateway_data": {
                                "status": gateway_record.get('status'),
                                "amount": gateway_record.get('amount'),
                                "bank_ref_no": gateway_record.get('bank_ref_no'),
                                "mode": gateway_record.get('mode'),
                                "bank_name": gateway_record.get('bank_name')
                            }
                        }
                        
                        # Update payment record with verification
                        payments_collection.update_one(
                            {"session_id": session_id},
                            {
                                "$set": {
                                    "gateway_verified": True,
                                    "gateway_data": verification_result["gateway_data"],
                                    "verification_status": "verified",
                                    "last_updated": datetime.now()
                                }
                            }
                        )
                    else:
                        verification_result = {
                            "verified": False,
                            "status": "not_found_in_gateway"
                        }
                except Exception as verify_err:
                    print(f"Payment verification error in StepCacheView: {verify_err}")
                    verification_result = {
                        "verified": False,
                        "status": "verification_failed"
                    }
            
            log_step_activity(session_id, step_name, user_id)
            
            response_data = {
                "success": True,
                "message": f"{step_name} stored in payments collection",
                "session_id": session_id
            }
            
            if verification_result:
                response_data['payment_verification'] = verification_result
            
            return Response(response_data, status=200)
        
        # For non-payment steps, store in step_cache as usual
        cache = db.step_cache
        cache.update_one(
            {"session_id": session_id},
            {"$set": {step_name: step_data}},
            upsert=True
        )
        log_step_activity(session_id, step_name, user_id)
        return Response({"success": True, "message": f"{step_name} cached", "session_id": session_id}, status=200)

    def get(self, request, *args, **kwargs):
        """
        If 'phone' query param is present, return last completed step for that phone.
        Otherwise, return all cached step applications (for /step/cache/ endpoint).
        """
        db = settings.MONGO_DB["initReg"]
        cache = db.step_cache
        phone = request.GET.get('phone')
        current_step = request.GET.get('current')
        if phone and not current_step:
            # Use phone number as session_id
            session_id = f"pending-{phone}"
            entry = cache.find_one({"session_id": session_id})
            last_step = None
            if entry:
                step_keys = [k for k in entry.keys() if k not in ['_id', 'session_id']]
                if step_keys:
                    last_step = step_keys[-1]
            if last_step:
                return Response({
                    "success": True,
                    "message": f"Last completed step for phone {phone}: {last_step}",
                    "step_name": last_step,
                    "session_id": phone
                }, status=200)
            else:
                return Response({
                    "success": False,
                    "message": "No step data found for this phone number"
                }, status=404)
        if phone and current_step:
            session_id = f"pending-{phone}"
            all_cached = list(cache.find({"session_id": session_id}))
            result = []
            steps_completed_list = []
            for entry in all_cached:
                ordered_keys = [k for k in entry.keys() if k not in ["_id", "session_id"]]
                if current_step in ordered_keys:
                    steps = {current_step: entry.get(current_step)}
                else:
                    steps = {}
                app = {
                    "_id": str(entry.get("_id")),
                    "session_id": entry.get("session_id", ""),
                    "steps": steps,
                    "steps_completed": len(steps)
                }
                result.append(app)
                steps_completed_list.append(len(steps))
            summary = {
                "total_cached_applications": len(result),
                "steps_completed_per_application": steps_completed_list,
                "average_steps_completed": round(sum(steps_completed_list) / len(steps_completed_list), 2) if steps_completed_list else 0
            }
            return Response({
                "cached_applications": result,
                "summary": summary
            }, status=200)
        else:
            # Return all cached step applications with summary
            all_cached = list(cache.find({}))
            result = []
            steps_completed_list = []
            for entry in all_cached:
                steps = {k: v for k, v in entry.items() if k not in ["_id", "session_id"]}
                app = {
                    "_id": str(entry.get("_id")),
                    "session_id": entry.get("session_id", ""),
                    "steps": steps,
                    "steps_completed": len(steps)
                }
                result.append(app)
                steps_completed_list.append(len(steps))
            summary = {
                "total_cached_applications": len(result),
                "steps_completed_per_application": steps_completed_list,
                "average_steps_completed": round(sum(steps_completed_list) / len(steps_completed_list), 2) if steps_completed_list else 0
            }
            return Response({
                "cached_applications": result,
                "summary": summary
            }, status=200)
    
    # step/clear/?phone=${userPhone}
    def delete(self, request, *args, **kwargs):
        phone = request.GET.get('phone')
        if not phone:
            return Response({"success": False, "message": "Phone number parameter is required"}, status=400)
        db = settings.MONGO_DB["initReg"]
        cache = db.step_cache
        session_id = f"pending-{phone}"
        result = cache.delete_one({"session_id": session_id})
        if result.deleted_count == 1:
            return Response({"success": True, "message": "Cached data cleared"}, status=200)
        else:
            return Response({"success": False, "message": "No cached data found to clear"}, status=404)

class StepSubmitView(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        db = settings.MONGO_DB["initReg"]
        cache = db.step_cache
        main = db.students
        cached = cache.find_one({"session_id": session_id})
        if not cached:
            return Response({"success": False, "message": "No cached data"}, status=400)
        # Merge all step data (remove session_id)
        merged = {k: v for k, v in cached.items() if k != 'session_id' and k != '_id'}
        main.insert_one(merged)
        cache.delete_one({"session_id": session_id})
        return Response({"success": True, "message": "Final submission complete"}, status=200)


class SinglePaymentRecordView(APIView):
    def post(self, request):
        serializer = PaymentRecordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed",
                "errors": serializer.errors
            }, status=400)

        validated_data = serializer.validated_data
        session_id = request.data.get('session_id')
        user_id = request.data.get('user_id')
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())

        payment_data = {
            "amount": float(validated_data.get('amount')) if validated_data.get('amount') is not None else 0.0,
            "paymentAmount": float(validated_data.get('paymentAmount')) if validated_data.get('paymentAmount') is not None else 0.0,
            "paymentMethod": validated_data.get('paymentMethod') or "",
            "transactionId": validated_data.get('transactionId') or "",
            "paymentStatus": validated_data.get('paymentStatus') or "pending",
            "paymentDate": validated_data.get('paymentDate') or "",
            "discountApplied": float(validated_data.get('discountApplied')) if validated_data.get('discountApplied') is not None else 0.0,
            "couponCode": validated_data.get('couponCode') or "",
            "applicationStatus": validated_data.get('applicationStatus') or ""
        }

        phone = request.data.get('phone')
        if phone:
            payment_data['phone'] = phone

        txnid = request.data.get('txnid')
        if txnid and not payment_data.get('transactionId'):
            payment_data['txnid'] = txnid

        db = settings.MONGO_DB["initReg"]
        payments_collection = db.payments

        payment_status = payment_data.get('paymentStatus') or "pending"
        payment_record = {
            "session_id": session_id,
            "user_id": user_id,
            "payment_data": payment_data,
            "created_at": datetime.now(),
            "last_updated": datetime.now(),
            "status": payment_status
        }

        result = payments_collection.update_one(
            {"session_id": session_id},
            {"$set": payment_record},
            upsert=True
        )

        cache = db.step_cache
        cache.update_one(
            {"session_id": session_id},
            {"$set": {"payment": payment_data}},
            upsert=True
        )

        verification_result = None
        txn_id = payment_data.get('transactionId') or payment_data.get('txnid')
        phone = payment_data.get('phone')

        if txn_id and phone:
            try:
                payment_gateway_data = db.payment_gateway_data

                phone_query = {'$in': [phone, str(phone)]}
                try:
                    phone_as_int = int(phone)
                    phone_query = {'$in': [phone, str(phone), phone_as_int]}
                except ValueError:
                    pass

                gateway_record = payment_gateway_data.find_one({
                    'txnid': txn_id,
                    'phone': phone_query
                })

                if gateway_record:
                    verification_result = {
                        "verified": True,
                        "status": "verified",
                        "gateway_data": {
                            "status": gateway_record.get('status'),
                            "amount": gateway_record.get('amount'),
                            "bank_ref_no": gateway_record.get('bank_ref_no'),
                            "mode": gateway_record.get('mode'),
                            "bank_name": gateway_record.get('bank_name')
                        }
                    }

                    payments_collection.update_one(
                        {"session_id": session_id},
                        {
                            "$set": {
                                "gateway_verified": True,
                                "gateway_data": verification_result["gateway_data"],
                                "verification_status": "verified",
                                "last_updated": datetime.now()
                            }
                        }
                    )
                else:
                    verification_result = {
                        "verified": False,
                        "status": "not_found_in_gateway"
                    }
            except Exception as verify_err:
                print(f"Payment verification error in SinglePaymentRecordView: {verify_err}")
                verification_result = {
                    "verified": False,
                    "status": "verification_failed"
                }

        response_data = {
            "success": True,
            "message": "Payment record stored",
            "session_id": session_id
        }

        if result.upserted_id:
            response_data["mongodb_id"] = str(result.upserted_id)

        if verification_result:
            response_data["payment_verification"] = verification_result

        return Response(response_data, status=201)


class PaymentsCollectionView(APIView):
    """Query and manage the payments collection (step-wise payment data)"""
    
    def get(self, request):
        """Get payment records from payments collection with optional filtering"""
        try:
            db = settings.MONGO_DB["initReg"]
            payments_collection = db.payments
            
            # Build query based on request parameters
            query = {}
            
            # Filter by session_id
            session_id = request.GET.get('session_id')
            if session_id:
                query['session_id'] = session_id
            
            # Filter by user_id
            user_id = request.GET.get('user_id')
            if user_id:
                query['user_id'] = user_id
            
            # Filter by phone (from payment_data)
            phone = request.GET.get('phone')
            if phone:
                try:
                    phone_as_int = int(phone)
                    query['payment_data.phone'] = {'$in': [phone, str(phone), phone_as_int]}
                except ValueError:
                    query['payment_data.phone'] = phone
            
            # Filter by transaction ID (from payment_data)
            txn_id = request.GET.get('transactionId')
            if txn_id:
                query['$or'] = [
                    {'payment_data.transactionId': txn_id},
                    {'payment_data.txnid': txn_id}
                ]
            
            # Filter by verification status
            verification_status = request.GET.get('verification_status')
            if verification_status:
                query['verification_status'] = verification_status
            
            # Filter by gateway verification
            gateway_verified = request.GET.get('gateway_verified')
            if gateway_verified is not None:
                query['gateway_verified'] = gateway_verified.lower() == 'true'
            
            # Filter by status
            status = request.GET.get('status')
            if status:
                query['status'] = status
            
            # Pagination
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 50))
            skip = (page - 1) * limit
            
            # Get total count
            total_count = payments_collection.count_documents(query)
            
            # Fetch records
            cursor = payments_collection.find(query).skip(skip).limit(limit).sort('last_updated', -1)
            
            records = []
            for record in cursor:
                # Convert ObjectId to string
                record['_id'] = str(record['_id'])
                
                # Convert datetime fields to ISO format
                for date_field in ['created_at', 'last_updated']:
                    if date_field in record and record[date_field]:
                        if hasattr(record[date_field], 'isoformat'):
                            record[date_field] = record[date_field].isoformat()
                        else:
                            record[date_field] = str(record[date_field])
                
                records.append(record)
            
            # Calculate statistics
            verified_count = payments_collection.count_documents({**query, 'gateway_verified': True})
            unverified_count = total_count - verified_count
            pending_count = payments_collection.count_documents({**query, 'status': 'pending'})
            completed_count = payments_collection.count_documents({**query, 'status': 'completed'})
            
            return Response({
                "records": records,
                "pagination": {
                    "total_count": total_count,
                    "page": page,
                    "limit": limit,
                    "total_pages": (total_count + limit - 1) // limit
                },
                "statistics": {
                    "verified_count": verified_count,
                    "unverified_count": unverified_count,
                    "pending_count": pending_count,
                    "completed_count": completed_count
                }
            }, status=200)
        
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving payment records.",
                "error": str(err)
            }, status=500)
    
    def post(self, request):
        """Manually trigger payment verification for a specific session"""
        try:
            db = settings.MONGO_DB["initReg"]
            payments_collection = db.payments
            payment_gateway_data = db.payment_gateway_data
            
            # Get session_id from request
            session_id = request.data.get('session_id')
            
            if not session_id:
                return Response({
                    "message": "Please provide session_id"
                }, status=400)
            
            # Find the payment record
            payment_record = payments_collection.find_one({"session_id": session_id})
            if not payment_record:
                return Response({
                    "message": "No payment record found for this session_id"
                }, status=404)
            
            # Extract payment data
            payment_data = payment_record.get('payment_data', {})
            txn_id = payment_data.get('transactionId') or payment_data.get('txnid')
            phone = payment_data.get('phone')
            
            if not txn_id or not phone:
                return Response({
                    "message": "Payment record missing transaction ID or phone number"
                }, status=400)
            
            # Verify with payment gateway
            try:
                # Handle phone as both string and numeric
                phone_query = {'$in': [phone, str(phone)]}
                try:
                    phone_as_int = int(phone)
                    phone_query = {'$in': [phone, str(phone), phone_as_int]}
                except ValueError:
                    pass
                
                gateway_record = payment_gateway_data.find_one({
                    'txnid': txn_id,
                    'phone': phone_query
                })
                
                if gateway_record:
                    gateway_data = {
                        "status": gateway_record.get('status'),
                        "amount": gateway_record.get('amount'),
                        "bank_ref_no": gateway_record.get('bank_ref_no'),
                        "mode": gateway_record.get('mode'),
                        "bank_name": gateway_record.get('bank_name'),
                        "addedon": gateway_record.get('addedon')
                    }
                    
                    # Update payment record
                    payments_collection.update_one(
                        {"session_id": session_id},
                        {
                            "$set": {
                                "gateway_verified": True,
                                "gateway_data": gateway_data,
                                "verification_status": "verified",
                                "last_updated": datetime.now()
                            }
                        }
                    )
                    
                    return Response({
                        "message": "Payment verification completed",
                        "verification_result": {
                            "verified": True,
                            "status": "verified",
                            "gateway_data": gateway_data
                        }
                    }, status=200)
                else:
                    # Update as not found
                    payments_collection.update_one(
                        {"session_id": session_id},
                        {
                            "$set": {
                                "gateway_verified": False,
                                "verification_status": "not_found_in_gateway",
                                "last_updated": datetime.now()
                            }
                        }
                    )
                    
                    return Response({
                        "message": "Payment not found in gateway",
                        "verification_result": {
                            "verified": False,
                            "status": "not_found_in_gateway"
                        }
                    }, status=200)
            
            except Exception as verify_err:
                print(f"Verification error: {verify_err}")
                return Response({
                    "message": "Error during verification",
                    "error": str(verify_err)
                }, status=500)
        
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error triggering payment verification.",
                "error": str(err)
            }, status=500)
    
    def delete(self, request):
        """Delete a payment record by session_id"""
        try:
            db = settings.MONGO_DB["initReg"]
            payments_collection = db.payments
            
            session_id = request.GET.get('session_id')
            if not session_id:
                return Response({
                    "message": "Please provide session_id parameter"
                }, status=400)
            
            result = payments_collection.delete_one({"session_id": session_id})
            
            if result.deleted_count > 0:
                return Response({
                    "message": "Payment record deleted successfully",
                    "deleted_count": result.deleted_count
                }, status=200)
            else:
                return Response({
                    "message": "Payment record not found"
                }, status=404)
        
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error deleting payment record.",
                "error": str(err)
            }, status=500)

class SendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": serializer.errors}, status=400)

        phone = serializer.validated_data['phone']
        otp = f"{random.randint(100000, 999999)}"
        # otp = 123456  # Fixed OTP for testing
        expiry = djtimezone.now() + timedelta(minutes=5)

        db = settings.MONGO_DB["initReg"]
        otps = db.otps
        # Remove any existing OTP for this phone
        otps.delete_many({"phone": phone})
        # Store new OTP
        otps.insert_one({"phone": phone, "otp": otp, "expiry": expiry, "verified": False})

        sms_url = "http://bulk.kitesms.com/v3/api.php"
        params = {
            "username": "vignanapi",
            "apikey": "3e5805d6c9552b34d77c",
            "senderid": "VIGNAN",
            "templateid": "1707160404670335483",
            "mobile": phone,
            "message": f"Your Password is : {otp} -VFSTR"
        }
        try:
            sms_response = requests.get(sms_url, params=params, timeout=10)
            sms_response.raise_for_status()
            sms_result = sms_response.json() if sms_response.headers.get('content-type') == 'application/json' else sms_response.text
        except Exception as e:
            print(f"SMS sending failed: {e}")
            return Response({"success": False, "message": "Failed to send OTP SMS."}, status=500)

        response_data = {
            "success": True,
            "message": "OTP sent"
        }
        
        # Only include OTP in response during debug mode
        if getattr(settings, 'DEBUG', False):
            response_data['otp'] = otp
        
        return Response(response_data, status=200)

        # Integrate with KiteSMS API using a direct POST request (avoid monkeypatching requests.get)
        # import requests
        # sms_url = "https://smsapi.jiocx.com/apggw/vignans/sms/v1/send"
        # payload = {
        #     "username": "jiocx-vignans",
        #     "password": "IyJc16Jyl2U1Cyd9",
        #     "sender_id": "VIGNAN",
        #     "to": phone,
        #     "sms_type": "T",
        #     "sms_content_type": "Static",
        #     "body": f"Your Password is : {otp} -VFSTR",
        #     "dlt_entity_id": "1101385640000011255",
        #     "dlt_template_id": "1707160404670335483",
        #     "domain_id": "devcx"
        # }
        # headers = {"Content-Type": "application/json"}

        # try:
        #     sms_response = requests.post(sms_url, json=payload, headers=headers, timeout=10)
        #     sms_response.raise_for_status()
        # except Exception as e:
        #     print(f"SMS sending failed: {e}")
        #     return Response({"success": False, "message": "Failed to send OTP SMS.", "error": str(e)}, status=500)

        # return Response({
        #     "success": True,
        #     "message": "OTP sent"
        # }, status=200)

class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "message": serializer.errors}, status=400)

        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']

        db = settings.MONGO_DB["initReg"]
        otps = db.otps
        record = otps.find_one({"phone": phone, "otp": otp})
        if not record:
            return Response({"success": False, "message": "Invalid OTP"}, status=400)
        if record.get("verified"):
            return Response({"success": False, "message": "OTP already used"}, status=400)

        # Check OTP expiry with proper timezone handling
        expiry = record.get('expiry')
        if expiry:
            current_time = djtimezone.now()
            
            # Handle different expiry datetime formats from MongoDB
            try:
                if hasattr(expiry, 'tzinfo'):
                    if expiry.tzinfo is None:
                        # Naive datetime - make it timezone-aware
                        expiry = djtimezone.make_aware(expiry)
                else:
                    # Not a datetime object - likely a timestamp or string
                    if isinstance(expiry, (int, float)):
                        expiry = djtimezone.make_aware(datetime.fromtimestamp(expiry))
                    else:
                        # Try to parse as datetime
                        expiry = djtimezone.make_aware(datetime.fromisoformat(str(expiry)))
                
                if current_time > expiry:
                    return Response({"success": False, "message": "OTP expired"}, status=400)
                    
            except Exception as e:
                # If we can't parse expiry, consider it expired for safety
                print(f"Error parsing expiry time: {e}")
                return Response({"success": False, "message": "OTP expired"}, status=400)

        # Mark as verified
        otps.update_one({"_id": record["_id"]}, {"$set": {"verified": True}})

        # Optionally, mark phone as verified in users collection
        db.users.update_one({"phone": phone}, {"$set": {"phone_verified": True}})

        return Response({"success": True, "message": "OTP verified"}, status=200)

def generate_student_id(phone=None):
    """
    Generate student ID in format: VSAT+current_year+sequential_number
    Example: VSAT2025000001
    Example: VU26GNT000001
    """
    current_year = str(datetime.now().year)
    db = settings.MONGO_DB["initReg"]
    students = db.students
    
    # Use two-digit year and the "VU{yy}GNT" prefix (e.g. VU26GNT000001)
    two_digit_year = current_year[-2:]
    # Determine campus code from users collection; default to 'GNT' if not available
    campus_code = "GNT"
    try:
        db_users = settings.MONGO_DB["initReg"].users
        try:
            phone_val = phone  # may exist when generate_student_id is called from contexts that have `phone`
        except NameError:
            phone_val = None
        if phone_val:
            user = db_users.find_one({"phone": phone_val})
        else:
            user = db_users.find_one({"campus": {"$exists": True, "$ne": ""}}, sort=[("_id", -1)])
        if user and user.get("campus"):
            campus_raw = str(user.get("campus")).strip().upper()
            mapping = {
                "GUNTUR": "GNT",
                "GNT": "GNT",
                "HYDERABAD": "HYD",
                "HYD": "HYD"
            }
            campus_code = mapping.get(campus_raw, campus_raw[:3])
    except Exception:
        campus_code = "GNT"
    prefix = f"VU{two_digit_year}{campus_code}"
    
    # Find all students with IDs starting with current year prefix
    students_this_year = students.find({
        "student_id": {"$regex": f"^{prefix}"}
    }).sort("student_id", -1).limit(1)
    
    # Get the next sequential number
    next_number = 1
    for student in students_this_year:
        if student.get("student_id"):
            # Extract the last 6 digits and increment
            last_id = student["student_id"]
            if len(last_id) >= 6:
                try:
                    last_number = int(last_id[-6:])
                    next_number = last_number + 1
                except ValueError:
                    next_number = 1
            break
    
    # Format the sequential number with leading zeros (6 digits)
    sequential_part = str(next_number).zfill(6)
    
    return f"{prefix}{sequential_part}"

class RegisterView(APIView):
    # get the register user details by passing phone number as a parameter
    def get(self, request):
        phone = request.GET.get('phone')
        db = settings.MONGO_DB["initReg"]
        users = db.users
        if phone:
            user = users.find_one({"phone": phone})
            if not user:
                return Response({"message": "User not found"}, status=404)
            user_details = {
                "name": user.get('name', ''),
                "email": user.get('email', ''),
                "phone": user.get('phone', ''),
                "campus": user.get('campus', ''),
                "program": user.get('program', ''),
                "specialization": user.get('specialization', ''),
                "role": user.get('role', 'user')
            }
            return Response({"user": user_details}, status=200)
        # get all users
        all_users = list(users.find({}))
        result = []
        for user in all_users:
            result.append({
                "name": user.get('name', ''),
                "email": user.get('email', ''),
                "phone": user.get('phone', ''),
                "campus": user.get('campus', ''),
                "program": user.get('program', ''),
                "specialization": user.get('specialization', ''),
                "role": user.get('role', 'user')
            })
        return Response({"users": result, "total_count": len(result)}, status=200)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            db = settings.MONGO_DB["initReg"]
            users = db.users

            # Check for unique email and phone
            if users.find_one({"email": data['email']}):
                return Response({"message": "Email already registered"}, status=409)
            if users.find_one({"phone": data['phone']}):
                return Response({"message": "Phone number already registered"}, status=409)

            if data['password'] != data['confirmPassword']:
                return Response({"message": "Passwords do not match"}, status=400)

            hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

            user = {
                "name": data['name'],
                "email": data['email'],
                "password": hashed.decode('utf-8'),
                "phone": data['phone'],
                "campus": data.get('campus', ''),
                "program": data.get('program', ''),
                "specialization": data.get('specialization', ''),
                "role": "user"
            }

            users.insert_one(user)
            return Response({"message": "User registered successfully"}, status=201)

        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            db = settings.MONGO_DB["initReg"]
            users = db.users

            # Allow login with either email or phone
            user = users.find_one({"$or": [
                {"email": data['email']},
                {"phone": data['email']}
            ]})
            if not user:
                log_user_login(data['email'], "failure")
                return Response({"message": "User not found"}, status=404)

            if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                log_user_login(data['email'], "failure")
                return Response({"message": "Invalid password"}, status=401)

            log_user_login(data['email'], "success")
            return Response({
                "message": "Login successful",
                "user": {
                    "name": user['name'],
                    "email": user['email'],
                    "phone": user['phone'],
                    "role": user.get('role', 'user')
                }
            }, status=200)

        return Response(serializer.errors, status=400)

class UGStudentView(APIView):
    def get(self, request):
        """
        Retrieve all UG student registrations.
        """
        db = settings.MONGO_DB["initReg"]
        students = db.students
        ug_students = list(students.find({"registration_type": "UG"}))
        result = []
        for student in ug_students:
            result.append({
                "student_id": student.get("student_id"),
                "firstName": student.get("firstName"),
                "lastName": student.get("lastName"),
                "email": student.get("email"),
                "phone": student.get("phone"),
                "isApproved": student.get("isApproved", False),
                "program": student.get("program", ""),
                "specialization": student.get("specialization", ""),
                "campus": student.get("campus", "")
            })
        return Response({"students": result, "total_count": len(result)}, status=200)

    def post(self, request):
        """
        Register a new UG student (delegates to UGStudentRegistrationView).
        """
        view = UGStudentRegistrationView()
        return view.post(request)

class StudentView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def post(self, request):
        try:
            # Validate the incoming data using the serializer
            serializer = StudentSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=400)

            # Get the MongoDB database
            db = settings.MONGO_DB["initReg"]
            students = db.students

            # Get validated data and files
            validated_data = serializer.validated_data
            files = request.FILES

            # Generate unique student ID
            student_id = generate_student_id(validated_data.get('phone'))

            # Prepare student document with all fields from schema
            student_data = {
                # Generated Student ID
                "student_id": student_id,

                # Personal Information
                "firstName": validated_data.get('firstName'),
                "lastName": validated_data.get('lastName'),
                "email": validated_data.get('email'),
                "phone": validated_data.get('phone'),
                "dob": validated_data.get('dob'),
                "gender": validated_data.get('gender'),
                "category": validated_data.get('category'),
                "parentPhone": validated_data.get('parentPhone'),

                # SSC (10th) Educational Information
                "sscName": validated_data.get('sscName') or "",
                "sscBoard": validated_data.get('sscBoard') or "",
                "sscMarks": validated_data.get('sscMarks') or "",
                "sscYearOfPassing": validated_data.get('sscYearOfPassing') or "",

                # Intermediate (12th) Educational Information
                "schoolName": validated_data.get('schoolName'),
                "board": validated_data.get('board'),
                "percentage": validated_data.get('percentage'),
                "passingYear": validated_data.get('passingYear'),
                "rollNumber": validated_data.get('rollNumber'),
                "interMarks": validated_data.get('interMarks'),
                "interStream": validated_data.get('interStream'),

                # B.Tech Educational Information
                "btechUniversity": validated_data.get('btechUniversity') or "",
                "btechCollege": validated_data.get('btechCollege') or "",
                "btechCgpa": validated_data.get('btechCgpa') or "",
                "btechSpecialization": validated_data.get('btechSpecialization') or "",
                "btechYearOfPassing": validated_data.get('btechYearOfPassing') or "",
                "btechDegreeType": validated_data.get('btechDegreeType') or "",

                # M.Tech Educational Information
                "mtechUniversity": validated_data.get('mtechUniversity') or "",
                "mtechCollege": validated_data.get('mtechCollege') or "",
                "mtechCgpa": validated_data.get('mtechCgpa') or "",
                "mtechSpecialization": validated_data.get('mtechSpecialization') or "",
                "mtechYearOfPassing": validated_data.get('mtechYearOfPassing') or "",
                "mtechDegreeType": validated_data.get('mtechDegreeType') or "",

                # Address Information
                "street": validated_data.get('street'),
                "city": validated_data.get('city'),
                "state": validated_data.get('state'),
                "pincode": validated_data.get('pincode'),
                "country": validated_data.get('country'),

                # Payment Information
                "amount": float(validated_data.get('amount')) if validated_data.get('amount') is not None else 0.0,
                "paymentAmount": float(validated_data.get('paymentAmount')) if validated_data.get('paymentAmount') is not None else 0.0,
                "paymentMethod": validated_data.get('paymentMethod') or "",
                "transactionId": validated_data.get('transactionId') or "",
                "paymentStatus": validated_data.get('paymentStatus') or "pending",

                **({
                    "paymentDate": (lambda _pd: (
                        (lambda d: djtimezone.make_aware(d) if d.tzinfo is None else d)(datetime.fromisoformat(str(_pd)))
                    ))(validated_data.get('paymentDate')) 
                    if validated_data.get('paymentDate') else None
                } if True else {}),

                "discountApplied": float(validated_data.get('discountApplied')) if validated_data.get('discountApplied') is not None else 0.0,
                "couponCode": validated_data.get('couponCode') or "",
                "applicationStatus": validated_data.get('applicationStatus') or "",

                # Exam schedule
                "examDate": validated_data.get('examDate'),
                "examSlot": validated_data.get('examSlot'),

                # Approval Status
                "isApproved": validated_data.get('isApproved', True),
            }

            # Check if email already exists
            existing_student = students.find_one({"email": student_data['email']})
            if existing_student:
                return Response({
                    "message": "Student with this email already exists"
                }, status=409)

            # Handle file uploads and store as binary data (Buffer equivalent)
            file_fields = ['marksheet10', 'marksheet12', 'photo', 'signature', 'categoryCert', 'otherCert']
            file_types = {}

            for field_name in file_fields:
                if field_name in files:
                    file_obj = files[field_name]
                    # Store file content as binary data (equivalent to MongoDB Buffer)
                    student_data[field_name] = file_obj.read()
                    file_types[field_name] = file_obj.content_type
                else:
                    # If serializer provided a fileTypes mapping, respect it; otherwise set to None/empty
                    student_data[field_name] = None
                    file_types[field_name] = ''

            # Merge fileTypes provided in form data (if any) with detected types
            provided_filetypes = validated_data.get('fileTypes') or {}
            # Ensure keys are strings
            merged_filetypes = {**file_types, **{k: str(v) for k, v in provided_filetypes.items()}}
            student_data['fileTypes'] = merged_filetypes

            # Also store any extra document fields from serializer not explicitly handled
            # (keeps compatibility with future fields)
            extras = ['otherCert']
            for extra in extras:
                if extra in validated_data and validated_data.get(extra) is not None and extra not in student_data:
                    student_data[extra] = validated_data.get(extra)

            # Insert student data into MongoDB
            result = students.insert_one(student_data)

            # Store payment record in users_payments collection if payment info exists
            payment_verification = None
            if student_data.get('transactionId'):
                try:
                    # Add the MongoDB _id to student_data for payment record
                    student_data['_id'] = result.inserted_id
                    payment_verification = store_payment_record(student_data, verify_gateway=True)
                except Exception as payment_err:
                    print(f"Payment record storage error: {payment_err}")

            response_data = {
                "message": "Student saved to MongoDB with BLOB files.",
                "student_id": student_id,
                "mongodb_id": str(result.inserted_id)
            }
            
            # Include payment verification status if available
            if payment_verification:
                response_data['payment_verification'] = payment_verification

            return Response(response_data, status=200)

        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error saving student.",
                "error": str(err)
            }, status=500)

class StudentApprovalView(APIView):
    def post(self, request):
        try:
            # Validate the incoming data using the serializer
            serializer = StudentApprovalSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=400)
            
            # Get the MongoDB database
            db = settings.MONGO_DB["initReg"]
            students = db.students
            
            # Get validated data
            validated_data = serializer.validated_data
            student_id = validated_data.get('student_id')
            is_approved = validated_data.get('isApproved')
            remarks = validated_data.get('remarks', '')
            
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(student_id)
            except Exception:
                return Response({
                    "message": "Invalid student ID format"
                }, status=400)
            
            # Find the student
            student = students.find_one({"_id": object_id})
            if not student:
                return Response({
                    "message": "Student not found"
                }, status=404)
            
            # Update approval status
            update_data = {
                "isApproved": is_approved,
                "approvalDate": datetime.utcnow(),
                "remarks": remarks
            }
            
            result = students.update_one(
                {"_id": object_id},
                {"$set": update_data}
            )
            
            if result.modified_count == 1:
                approval_status = "approved" if is_approved else "rejected"
                return Response({
                    "message": f"Student successfully {approval_status}",
                    "student_id": student_id,
                    "approval_status": approval_status,
                    "remarks": remarks,
                    "approval_date": update_data["approvalDate"].isoformat()
                }, status=200)
            else:
                return Response({
                    "message": "Failed to update student approval status"
                }, status=500)
            
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error updating student approval status.",
                "error": str(err)
            }, status=500)
    
    def get(self, request, student_id=None):
        """Get student approval status"""
        try:
            # Get the MongoDB database
            db = settings.MONGO_DB["initReg"]
            students = db.students
            
            if student_id:
                # Get specific student approval status
                try:
                    object_id = ObjectId(student_id)
                except Exception:
                    return Response({
                        "message": "Invalid student ID format"
                    }, status=400)
                
                student = students.find_one({"_id": object_id})
                if not student:
                    return Response({
                        "message": "Student not found"
                    }, status=404)
                
                return Response({
                    "student_id": str(student["_id"]),
                    "generated_student_id": student.get('student_id', ''),
                    "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
                    "email": student.get('email', ''),
                    "isApproved": student.get('isApproved', False),
                    "remarks": student.get('remarks', ''),
                    "approvalDate": student.get('approvalDate', '').isoformat() if student.get('approvalDate') else None
                }, status=200)
            else:
                # Get all students with their approval status
                all_students = list(students.find({}, {
                    "firstName": 1, "lastName": 1, "email": 1, 
                    "isApproved": 1, "remarks": 1, "approvalDate": 1, "student_id": 1
                }))
                
                students_list = []
                for student in all_students:
                    students_list.append({
                        "student_id": str(student["_id"]),
                        "generated_student_id": student.get('student_id', ''),
                        "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
                        "email": student.get('email', ''),
                        "isApproved": student.get('isApproved', False),
                        "remarks": student.get('remarks', ''),
                        "approvalDate": student.get('approvalDate', '').isoformat() if student.get('approvalDate') else None
                    })
                
                return Response({
                    "students": students_list,
                    "total_count": len(students_list)
                }, status=200)
                
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving student approval status.",
                "error": str(err)
            }, status=500)

class StudentStatusView(APIView):
    def post(self, request):
        """Check if student application has been submitted"""
        try:
            # Validate the incoming data
            serializer = StudentStatusSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=400)
            
            # Get the MongoDB database
            db = settings.MONGO_DB["initReg"]
            students = db.students
            
            # Get validated data
            validated_data = serializer.validated_data
            email = validated_data.get('email')
            phone = validated_data.get('phone')
            student_id = validated_data.get('student_id')
            
            # Prepare query based on provided data
            query = {}
            if email:
                query["email"] = email
            if phone:
                query["$or"] = [
                    {"phone": phone},
                    {"parentPhone": phone}
                ]
            if not query and student_id:
                # Check if it's a MongoDB ObjectId (24 characters) or generated student ID
                if len(student_id) == 24:
                    # Assume it's a MongoDB ObjectId
                    try:
                        query["_id"] = ObjectId(student_id)
                    except Exception:
                        return Response({
                            "message": "Invalid MongoDB ObjectId format"
                        }, status=400)
                else:
                    # Assume it's a generated student ID (e.g., VSAT2025000001)
                    query["student_id"] = student_id
            
            # Find the student
            student = students.find_one(query)
            
            if student:
                # Student application found
                return Response({
                    "application_submitted": True,
                    "student_details": {
                        "student_id": str(student["_id"]),
                        "generated_student_id": student.get('student_id', ''),
                        "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
                        "email": student.get('email', ''),
                        "phone": student.get('phone', ''),
                        "isApproved": student.get('isApproved', False),
                        "approval_status": "approved" if student.get('isApproved', False) else "pending",
                        "remarks": student.get('remarks', ''),
                        "submission_date": student.get('_id').generation_time.isoformat() if student.get('_id') else None,
                        "approval_date": student.get('approvalDate', '').isoformat() if student.get('approvalDate') else None
                    },
                    "message": "Student application found"
                }, status=200)
            else:
                # No application found
                return Response({
                    "application_submitted": False,
                    "student_details": None,
                    "message": "No application found for the provided details"
                }, status=404)
                
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error checking student application status.",
                "error": str(err)
            }, status=500)
    
    def get(self, request):
        """Get all submitted applications summary"""
        try:
            # Get the MongoDB database
            db = settings.MONGO_DB["initReg"]
            students = db.students
            
            # Get counts
            total_applications = students.count_documents({})
            approved_applications = students.count_documents({"isApproved": True})
            pending_applications = students.count_documents({"isApproved": False})
            
            # Get recent applications (last 10)
            recent_applications = list(students.find({}, {
                "firstName": 1, "lastName": 1, "email": 1, 
                "isApproved": 1, "remarks": 1, "student_id": 1
            }).sort("_id", -1).limit(10))
            
            recent_list = []
            for app in recent_applications:
                recent_list.append({
                    "student_id": str(app["_id"]),
                    "generated_student_id": app.get('student_id', ''),
                    "name": f"{app.get('firstName', '')} {app.get('lastName', '')}",
                    "email": app.get('email', ''),
                    "isApproved": app.get('isApproved', False),
                    "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None
                })
            
            return Response({
                "summary": {
                    "total_applications": total_applications,
                    "approved_applications": approved_applications,
                    "pending_applications": pending_applications,
                    "approval_rate": round((approved_applications / total_applications * 100), 2) if total_applications > 0 else 0
                },
                "recent_applications": recent_list
            }, status=200)
            
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving application summary.",
                "error": str(err)
            }, status=500)

class AllPaymentsDetailsView(APIView):
    def get(self, request):
        """Get all payment details, store in users_payments collection, and cross-verify with payment_gateway_data"""
        try:
            db = settings.MONGO_DB["initReg"]
            students = db.students
            users_payments = db.users_payments
            payment_gateway_data = db.payment_gateway_data

            payments_cursor = students.find({}, {
                "firstName": 1, "lastName": 1, "email": 1, "phone": 1,
                "paymentAmount": 1, "paymentCurrency": 1, "paymentMethod": 1,
                "transactionId": 1, "paymentStatus": 1, "paymentDate": 1,
                "discountApplied": 1, "couponCode": 1, "applicationStatus": 1,
                "student_id": 1
            })
            payments = []
            for student in payments_cursor:
                payment_record = {
                    "student_id": str(student["_id"]),
                    "generated_student_id": student.get('student_id', ''),
                    "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
                    "email": student.get('email', ''),
                    "phone": student.get('phone', ''),
                    "payment_details": {
                        "paymentAmount": student.get('paymentAmount', 0.0),
                        "paymentCurrency": student.get('paymentCurrency', 'INR'), 
                        "paymentMethod": student.get('paymentMethod', ''),
                        "transactionId": student.get('transactionId', ''),
                        "paymentStatus": student.get('paymentStatus', 'pending'),
                        "paymentDate": student.get('paymentDate').isoformat() if student.get('paymentDate') else None,
                        "discountApplied": student.get('discountApplied', 0.0),
                        "couponCode": student.get('couponCode', ''),
                        "applicationStatus": student.get('applicationStatus', '')
                    },
                    "gateway_verified": False,
                    "gateway_data": None,
                    "verification_status": "not_verified"
                }
                
                # Cross-verify with payment_gateway_data if txnid and phone are available
                txn_id = student.get('transactionId')
                phone = student.get('phone')
                
                if txn_id and phone:
                    # Search in payment_gateway_data collection
                    try:
                        # Handle phone as both string and numeric
                        phone_query = {'$in': [phone, str(phone)]}
                        try:
                            phone_as_int = int(phone)
                            phone_query = {'$in': [phone, str(phone), phone_as_int]}
                        except ValueError:
                            pass
                        
                        gateway_record = payment_gateway_data.find_one({
                            'txnid': txn_id,
                            'phone': phone_query
                        })
                        
                        if gateway_record:
                            payment_record['gateway_verified'] = True
                            payment_record['verification_status'] = "verified"
                            payment_record['gateway_data'] = {
                                "status": gateway_record.get('status'),
                                "amount": gateway_record.get('amount'),
                                "bank_ref_no": gateway_record.get('bank_ref_no'),
                                "mode": gateway_record.get('mode'),
                                "bank_name": gateway_record.get('bank_name'),
                                "addedon": gateway_record.get('addedon')
                            }
                            
                            # Update payment status based on gateway data
                            if gateway_record.get('status') in ['success', 'Success', 'SUCCESS']:
                                payment_record['payment_details']['paymentStatus'] = 'completed'
                        else:
                            payment_record['verification_status'] = "not_found_in_gateway"
                    except Exception as verify_err:
                        print(f"Verification error: {verify_err}")
                        payment_record['verification_status'] = "verification_failed"
                
                # Store/update in users_payments collection
                try:
                    users_payments.update_one(
                        {
                            "student_id": payment_record["student_id"],
                            "payment_details.transactionId": payment_record["payment_details"]["transactionId"]
                        },
                        {
                            "$set": {
                                **payment_record,
                                "last_updated": datetime.now()
                            }
                        },
                        upsert=True
                    )
                except Exception as insert_err:
                    print(f"Error storing in users_payments: {insert_err}")
                
                payments.append(payment_record)

            return Response({
                "payments": payments, 
                "total_count": len(payments),
                "verified_count": len([p for p in payments if p['gateway_verified']]),
                "unverified_count": len([p for p in payments if not p['gateway_verified']])
            }, status=200)

        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving payment details.",
                "error": str(err)
            }, status=500)

class PendingApplicationsPayments(APIView):
    def get(self, request):
        """Get payment details from step_cache (cached step applications)."""
        try:
            db = settings.MONGO_DB["initReg"]
            cache = db.step_cache

            # Optionally filter by phone or session_id
            phone = request.GET.get('phone')
            session_id_q = request.GET.get('session_id')

            query = {}
            if phone:
                query['session_id'] = f"pending-{phone}"
            if session_id_q:
                query['session_id'] = session_id_q

            cached_cursor = cache.find(query)
            payments = []

            for entry in cached_cursor:
                # Build base response structure
                entry_id = str(entry.get('_id'))
                session_id = entry.get('session_id') or "-"

                # Identify payment-related step(s). Look for keys containing 'payment' (case-insensitive)
                payment_steps = {}
                for k, v in entry.items():
                    if k in ['_id', 'session_id']:
                        continue
                    if 'payment' in str(k).lower():
                        # Normalize to "payment" key in response
                        payment_steps['payment'] = v
                        break  # prefer first payment-like step

                # If no explicit payment step found, try to infer from nested dicts (common shapes)
                if not payment_steps:
                    for k, v in entry.items():
                        if k in ['_id', 'session_id']:
                            continue
                        if isinstance(v, dict):
                            # check if dict contains payment-like keys
                            keys_lower = {str(x).lower() for x in v.keys()}
                            if any(pk in keys_lower for pk in ('paymentamount', 'paymentmethod', 'transactionid', 'paymentstatus', 'paymentdate', 'amount')):
                                payment_steps['payment'] = v
                                break

                # Normalize payment fields (ensure date isoformat if datetime)
                if 'payment' in payment_steps:
                    p = payment_steps['payment']
                    if isinstance(p, dict):
                        # normalize paymentDate fields if present
                        for date_key in ('paymentDate', 'payment_date', 'paymentdate'):
                            if date_key in p and p[date_key]:
                                try:
                                    dt = p[date_key]
                                    if hasattr(dt, 'isoformat'):
                                        p[date_key] = dt.isoformat()
                                    else:
                                        # try to parse strings/timestamps safely to isoformat-ish string
                                        p[date_key] = str(dt)
                                except Exception:
                                    p[date_key] = str(p[date_key])
                        # Ensure both 'amount' and 'paymentAmount' are present (mirror if one exists)
                        if 'amount' in p and 'paymentAmount' not in p:
                            try:
                                p['paymentAmount'] = float(p['amount'])
                            except Exception:
                                p['paymentAmount'] = p['amount']
                        if 'paymentAmount' in p and 'amount' not in p:
                            try:
                                p['amount'] = float(p['paymentAmount'])
                            except Exception:
                                p['amount'] = p['paymentAmount']
                    else:
                        # if payment step is not dict, represent it as-is
                        payment_steps['payment'] = p

                # Count steps completed (exclude _id and session_id)
                steps_completed = len([k for k in entry.keys() if k not in ['_id', 'session_id']])

                payments.append({
                    "_id": entry_id,
                    "session_id": session_id,
                    "steps": payment_steps,
                    "steps_completed": steps_completed
                })

            return Response({"cached_payments": payments, "total_count": len(payments)}, status=200)

        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving cached payment details.",
                "error": str(err)
            }, status=500)


class UsersPaymentsView(APIView):
    """Query and manage the users_payments collection"""
    
    def get(self, request):
        """Get payment records from users_payments collection with optional filtering"""
        try:
            db = settings.MONGO_DB["initReg"]
            users_payments = db.users_payments
            
            # Build query based on request parameters
            query = {}
            
            # Filter by student_id
            student_id = request.GET.get('student_id')
            if student_id:
                query['student_id'] = student_id
            
            # Filter by email
            email = request.GET.get('email')
            if email:
                query['email'] = {'$regex': f'^{email}$', '$options': 'i'}
            
            # Filter by phone
            phone = request.GET.get('phone')
            if phone:
                try:
                    phone_as_int = int(phone)
                    query['phone'] = {'$in': [phone, str(phone), phone_as_int]}
                except ValueError:
                    query['phone'] = phone
            
            # Filter by transaction ID
            txn_id = request.GET.get('transactionId')
            if txn_id:
                query['payment_details.transactionId'] = txn_id
            
            # Filter by payment status
            payment_status = request.GET.get('paymentStatus')
            if payment_status:
                query['payment_details.paymentStatus'] = payment_status
            
            # Filter by verification status
            verification_status = request.GET.get('verification_status')
            if verification_status:
                query['verification_status'] = verification_status
            
            # Filter by gateway verification
            gateway_verified = request.GET.get('gateway_verified')
            if gateway_verified is not None:
                query['gateway_verified'] = gateway_verified.lower() == 'true'
            
            # Pagination
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 50))
            skip = (page - 1) * limit
            
            # Get total count
            total_count = users_payments.count_documents(query)
            
            # Fetch records
            cursor = users_payments.find(query).skip(skip).limit(limit).sort('last_updated', -1)
            
            records = []
            for record in cursor:
                # Convert ObjectId to string
                record['_id'] = str(record['_id'])
                
                # Convert datetime fields to ISO format
                for date_field in ['created_at', 'last_updated']:
                    if date_field in record and record[date_field]:
                        if hasattr(record[date_field], 'isoformat'):
                            record[date_field] = record[date_field].isoformat()
                        else:
                            record[date_field] = str(record[date_field])
                
                records.append(record)
            
            # Calculate statistics
            verified_count = users_payments.count_documents({**query, 'gateway_verified': True})
            unverified_count = users_payments.count_documents({**query, 'gateway_verified': False})
            completed_payments = users_payments.count_documents({**query, 'payment_details.paymentStatus': 'completed'})
            pending_payments = users_payments.count_documents({**query, 'payment_details.paymentStatus': 'pending'})
            
            return Response({
                "records": records,
                "pagination": {
                    "total_count": total_count,
                    "page": page,
                    "limit": limit,
                    "total_pages": (total_count + limit - 1) // limit
                },
                "statistics": {
                    "verified_count": verified_count,
                    "unverified_count": unverified_count,
                    "completed_payments": completed_payments,
                    "pending_payments": pending_payments
                }
            }, status=200)
        
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving users payment details.",
                "error": str(err)
            }, status=500)
    
    def post(self, request):
        """Manually trigger payment verification for specific records"""
        try:
            db = settings.MONGO_DB["initReg"]
            users_payments = db.users_payments
            students = db.students
            
            # Get student_id or transaction_id from request
            student_id = request.data.get('student_id')
            txn_id = request.data.get('transactionId')
            
            if not student_id and not txn_id:
                return Response({
                    "message": "Please provide either student_id or transactionId"
                }, status=400)
            
            # Find the student record
            query = {}
            if student_id:
                try:
                    query = {"_id": ObjectId(student_id)}
                except Exception:
                    query = {"student_id": student_id}
            elif txn_id:
                query = {"transactionId": txn_id}
            
            student = students.find_one(query)
            if not student:
                return Response({
                    "message": "No student record found"
                }, status=404)
            
            # Trigger payment verification and storage
            verification_result = store_payment_record(student, verify_gateway=True)
            
            return Response({
                "message": "Payment verification completed",
                "verification_result": verification_result
            }, status=200)
        
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error triggering payment verification.",
                "error": str(err)
            }, status=500)

        
def _build_application_detail(app):
    if app.get('isApproved', False):
        status_val = 'approved'
    elif app.get('remarks', ''):
        status_val = 'rejected'
    else:
        status_val = 'pending'

    application_detail = {
        "student_id": str(app.get("_id")),
        "generated_student_id": app.get('student_id', ''),
        "personal_info": {
            "firstName": app.get('firstName', ''),
            "lastName": app.get('lastName', ''),
            "email": app.get('email', ''),
            "parentPhone": app.get('parentPhone', ''),
            "phone": app.get('phone', ''),
            "dob": app.get('dob', ''),
            "gender": app.get('gender', ''),
            "category": app.get('category', '')
        },
        "educational_info": {
            "ssc": {
                "sscName": app.get('sscName', ''),
                "sscBoard": app.get('sscBoard', ''),
                "sscMarks": app.get('sscMarks', ''),
                "sscYearOfPassing": app.get('sscYearOfPassing', '')
            },
            "intermediate": {
                "schoolName": app.get('schoolName', ''),
                "board": app.get('board', ''),
                "percentage": app.get('percentage', ''),
                "interMarks": app.get('interMarks', ''),
                "interStream": app.get('interStream', ''),
                "passingYear": app.get('passingYear', ''),
                "rollNumber": app.get('rollNumber', '')
            },
            "btech": {
                "btechUniversity": app.get('btechUniversity', ''),
                "btechCollege": app.get('btechCollege', ''),
                "btechCgpa": app.get('btechCgpa', ''),
                "btechSpecialization": app.get('btechSpecialization', ''),
                "btechYearOfPassing": app.get('btechYearOfPassing', ''),
                "btechDegreeType": app.get('btechDegreeType', '')
            },
            "mtech": {
                "mtechUniversity": app.get('mtechUniversity', ''),
                "mtechCollege": app.get('mtechCollege', ''),
                "mtechCgpa": app.get('mtechCgpa', ''),
                "mtechSpecialization": app.get('mtechSpecialization', ''),
                "mtechYearOfPassing": app.get('mtechYearOfPassing', ''),
                "mtechDegreeType": app.get('mtechDegreeType', '')
            }
        },
        "address_info": {
            "street": app.get('street', ''),
            "city": app.get('city', ''),
            "state": app.get('state', ''),
            "pincode": app.get('pincode', ''),
            "country": app.get('country', '')
        },
        "documents": {
            "marksheet10": "uploaded" if app.get('marksheet10') else "not uploaded",
            "marksheet12": "uploaded" if app.get('marksheet12') else "not uploaded",
            "photo": "uploaded" if app.get('photo') else "not uploaded",
            "signature": "uploaded" if app.get('signature') else "not uploaded",
            "categoryCert": "uploaded" if app.get('categoryCert') else "not uploaded",
            "otherCert": "uploaded" if app.get('otherCert') else "not uploaded",
            "fileTypes": app.get('fileTypes', {})
        },
        "payment_info": {
            "paymentAmount": app.get('paymentAmount', 0.0),
            "paymentCurrency": app.get('paymentCurrency', 'INR'),
            "paymentMethod": app.get('paymentMethod', ''),
            "transactionId": app.get('transactionId', ''),
            "paymentStatus": app.get('paymentStatus', 'pending'),
            "paymentDate": None,
            "receiptUrl": app.get('receiptUrl') or app.get('paymentReceiptUrl') or None,
            "paymentConfirmed": False
        },
        "exam_schedule": {
            "examDate": app.get('examDate'),
            "examSlot": app.get('examSlot')
        },
        "application_status": {
            "status": status_val,
            "isApproved": app.get('isApproved', False),
            "remarks": app.get('remarks', ''),
            "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None,
            "approval_date": app.get('approvalDate', '').isoformat() if app.get('approvalDate') else None
        }
    }

    # Normalize paymentDate and paymentConfirmed flags
    try:
        payment_date = app.get('paymentDate')
        if payment_date:
            if hasattr(payment_date, 'isoformat'):
                application_detail['payment_info']['paymentDate'] = payment_date.isoformat()
            else:
                application_detail['payment_info']['paymentDate'] = str(payment_date)
        status_val_lower = str(application_detail['payment_info'].get('paymentStatus', '')).lower()
        if status_val_lower in ['paid', 'success', 'completed']:
            application_detail['payment_info']['paymentConfirmed'] = True
    except Exception:
        pass

    return application_detail


class AllApplicationsView(APIView):
    def get(self, request):
        """Get all application details, or individual by student_id/email, with approval/rejection status"""
        try:
            db = settings.MONGO_DB["initReg"]
            students = db.students
            users = db.users
            # Individual user query support
            student_id = request.GET.get('student_id')
            email = request.GET.get('email')
            # Optional exam schedule check params
            exam_date_q = request.GET.get('examDate')
            exam_slot_q = request.GET.get('examSlot')

            # if they provide from date and to date of exam schedule, filter by that as well
            exam_from_date = request.GET.get('examFromDate')
            exam_to_date = request.GET.get('examToDate')
            query = {}
            def _parse_iso(s):
                if not s:
                    return None
                if s.endswith('Z'):
                    s = s[:-1] + '+00:00'
                dt = datetime.fromisoformat(s)
                if dt.tzinfo is None:
                    dt = djtimezone.make_aware(dt)
                return dt

            if exam_from_date and exam_to_date:
                try:
                    datetime.strptime(exam_from_date, "%Y-%m-%d")
                    datetime.strptime(exam_to_date, "%Y-%m-%d")

                    query["examDate"] = {
                        "$gte": exam_from_date,
                        "$lte": exam_to_date
                    }
                except ValueError as e:
                    return Response({
                        "message": "Invalid examFromDate or examToDate format. Expected 'YYYY-MM-DD'.",
                        "error": str(e)
                    }, status=400)

                # Fetch from MongoDB
                apps_cursor = students.find(query)
                applications = []

                for app in apps_cursor:
                    if app.get('isApproved', False):
                        status_val = 'approved'
                    elif app.get('remarks'):
                        status_val = 'rejected'
                    else:
                        status_val = 'pending'

                    applications.append({
                        "student_id": str(app["_id"]),
                        "generated_student_id": app.get('student_id', ''),
                        "name": f"{app.get('firstName', '')} {app.get('lastName', '')}",
                        "email": app.get('email', ''),
                        "examDate": app.get('examDate'),
                        "examSlot": app.get('examSlot'),
                        "phone": app.get('phone'),
                        "parentPhone": app.get('parentPhone'),
                        "application_status": {
                            "status": status_val,
                            "isApproved": app.get('isApproved', False),
                            "remarks": app.get('remarks', ''),
                            "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None,
                            "approval_date": app.get('approvalDate').isoformat() if app.get('approvalDate') else None
                        }
                    })

                return Response({
                    "applications": applications,
                    "total_count": len(applications)
                }, status=200)
                

            # If student_id (or email) + examDate + examSlot provided, return a focused check response
            if (student_id or email) and (exam_date_q or exam_slot_q):
                # find by student_id (ObjectId or generated id) or by email
                query = {}
                if student_id:
                    try:
                        # try as ObjectId
                        query = {"_id": ObjectId(student_id)}
                    except Exception:
                        # fallback to generated student_id field
                        query = {"student_id": student_id}
                else:
                    query = {"email": email}

                app = students.find_one(query)
                if not app:
                    return Response({"message": "No application found for provided identifier"}, status=404)

                assigned_date = app.get('examDate')
                assigned_slot = app.get('examSlot')

                match = False
                try:
                    if (str(assigned_date) == str(exam_date_q)) and (str(assigned_slot) == str(exam_slot_q)):
                        match = True
                except Exception:
                    match = False

                return Response({
                    "student_id": str(app.get('_id')),
                    "generated_student_id": app.get('student_id', ''),
                    "match": match,
                    "requested": {"examDate": exam_date_q, "examSlot": exam_slot_q},
                    "assigned": {"examDate": assigned_date, "examSlot": assigned_slot}
                }, status=200 if match else 200)
            if exam_date_q and exam_slot_q:
                # Filter all applications by examDate and examSlot
                query = {
                    "examDate": exam_date_q,
                    "examSlot": exam_slot_q
                }
                apps_cursor = students.find(query)
                applications = []
                for app in apps_cursor:
                    if app.get('isApproved', False):
                        status_val = 'approved'
                    elif app.get('remarks', ''):
                        status_val = 'rejected'
                    else:
                        status_val = 'pending'
                    applications.append({
                        "student_id": str(app["_id"]),
                        "generated_student_id": app.get('student_id', ''),
                        "name": f"{app.get('firstName', '')} {app.get('lastName', '')}",
                        "email": app.get('email', ''),
                        "examDate": app.get('examDate'),
                        "examSlot": app.get('examSlot'),
                        "application_status": {
                            "status": status_val,
                            "isApproved": app.get('isApproved', False),
                            "remarks": app.get('remarks', ''),
                            "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None,
                            "approval_date": app.get('approvalDate', '').isoformat() if app.get('approvalDate') else None
                        }
                    })
                return Response({"applications": applications, "total_count": len(applications)}, status=200)
            if student_id:
                try:
                    query = {"_id": ObjectId(student_id)}
                except Exception:
                    query = {"student_id": student_id}
                app = students.find_one(query)
                if not app:
                    return Response({"message": "No application found for this student_id"}, status=404)
                application_detail = _build_application_detail(app)
                return Response({"application": application_detail}, status=200)
            elif email:
                query = {"email": email}
                app = students.find_one(query)
                # get user details from users collection
                userApp = users.find_one({"email": email})
                if not userApp:
                    return Response({"message": "No user found for this email"}, status=404)
                if not app:
                    return Response({"message": "No application found for this email"}, status=404)
                if app.get('isApproved', False):
                    status_val = 'approved'
                elif app.get('remarks', ''):
                    status_val = 'rejected'
                else:
                    status_val = 'pending'
                application_detail = {
                    "student_id": str(app["_id"]),
                    "generated_student_id": app.get('student_id', ''),
                    "user_details":{
                        "name": f"{userApp.get('firstName', '')} {userApp.get('lastName', '')}",
                        "email": app.get('email', ''),
                        "phone": app.get('phone', ''),
                        "campus": userApp.get('campus', ''),
                        "program": userApp.get('program', ''),
                        "specialization": userApp.get('specialization', ''),
                        "role": userApp.get('role', '')
                    },
                    "personal_info": {
                        "firstName": app.get('firstName', ''),
                        "lastName": app.get('lastName', ''),
                        "email": app.get('email', ''),
                        "parentPhone": app.get('parentPhone', ''),
                        "phone": app.get('phone', ''),
                        "dob": app.get('dob', ''),
                        "gender": app.get('gender', ''),
                        "category": app.get('category', '')
                    },
                    "educational_info": {
                        "ssc": {
                            "sscName": app.get('sscName', ''),
                            "sscBoard": app.get('sscBoard', ''),
                            "sscMarks": app.get('sscMarks', ''),
                            "sscYearOfPassing": app.get('sscYearOfPassing', '')
                        },
                        "intermediate": {
                            "schoolName": app.get('schoolName', ''),
                            "board": app.get('board', ''),
                            "percentage": app.get('percentage', ''),
                            "interMarks": app.get('interMarks', ''),
                            "interStream": app.get('interStream', ''),
                            "passingYear": app.get('passingYear', ''),
                            "rollNumber": app.get('rollNumber', '')
                        },
                        "btech": {
                            "btechUniversity": app.get('btechUniversity', ''),
                            "btechCollege": app.get('btechCollege', ''),
                            "btechCgpa": app.get('btechCgpa', ''),
                            "btechSpecialization": app.get('btechSpecialization', ''),
                            "btechYearOfPassing": app.get('btechYearOfPassing', ''),
                            "btechDegreeType": app.get('btechDegreeType', '')
                        },
                        "mtech": {
                            "mtechUniversity": app.get('mtechUniversity', ''),
                            "mtechCollege": app.get('mtechCollege', ''),
                            "mtechCgpa": app.get('mtechCgpa', ''),
                            "mtechSpecialization": app.get('mtechSpecialization', ''),
                            "mtechYearOfPassing": app.get('mtechYearOfPassing', ''),
                            "mtechDegreeType": app.get('mtechDegreeType', '')
                        }
                    },
                    "address_info": {
                        "street": app.get('street', ''),
                        "city": app.get('city', ''),
                        "state": app.get('state', ''),
                        "pincode": app.get('pincode', ''),
                        "country": app.get('country', '')
                    },
                    "documents": {
                        "marksheet10": "uploaded" if app.get('marksheet10') else "not uploaded",
                        "marksheet12": "uploaded" if app.get('marksheet12') else "not uploaded",
                        "photo": "uploaded" if app.get('photo') else "not uploaded",
                        "signature": "uploaded" if app.get('signature') else "not uploaded",
                        "categoryCert": "uploaded" if app.get('categoryCert') else "not uploaded",
                        "otherCert": "uploaded" if app.get('otherCert') else "not uploaded",
                        "fileTypes": app.get('fileTypes', {})
                    },
                    "payment_info": {
                        "paymentAmount": app.get('paymentAmount'),
                        "paymentMethod": app.get('paymentMethod'),
                        "transactionId": app.get('transactionId'),
                        "paymentStatus": app.get('paymentStatus')
                    },
                    "exam_schedule": {
                        "examDate": app.get('examDate'),
                        "examSlot": app.get('examSlot')
                    },
                    "application_status": {
                        "status": status_val,
                        "isApproved": app.get('isApproved', False),
                        "remarks": app.get('remarks', ''),
                        "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None,
                        "approval_date": app.get('approvalDate', '').isoformat() if app.get('approvalDate') else None
                    }
                }
                return Response({"application": application_detail}, status=200)

            # Existing logic for all/filtered applications
            approval_status = request.GET.get('status', None)  # 'approved', 'rejected', 'pending'
            query = {}
            if approval_status == 'approved':
                query['isApproved'] = True
            elif approval_status == 'rejected':
                query['isApproved'] = False
                query['remarks'] = {'$ne': ''}  # Has remarks (indicating manual rejection)
            elif approval_status == 'pending':
                query['isApproved'] = False

            applications = list(students.find(query).sort("_id", -1))
            detailed_applications = []
            for app in applications:
                if app.get('isApproved', False):
                    status = 'approved'
                elif app.get('remarks', ''):
                    status = 'rejected'
                else:
                    status = 'pending'
                # Include linked user details from users collection (if available)
                try:
                    user_record = users.find_one({"email": app.get('email')}) if app.get('email') else None
                    if not user_record and app.get('phone'):
                        user_record = users.find_one({"phone": app.get('phone')})
                except Exception:
                    user_record = None

                user_info = {
                    "name": None,
                    "email": None,
                    "phone": None,
                    "campus": None,
                    "program": None,
                    "specialization": None,
                    "role": None
                }
                if user_record:
                    # prefer explicit 'name' field, else combine first/last name if present
                    name_val = user_record.get('name') or f"{user_record.get('firstName', '')} {user_record.get('lastName', '')}".strip()
                    user_info = {
                        "name": name_val or None,
                        "email": user_record.get('email'),
                        "phone": user_record.get('phone'),
                        "campus": user_record.get('campus'),
                        "program": user_record.get('program'),
                        "specialization": user_record.get('specialization'),
                        "role": user_record.get('role', 'user')
                    }

                application_detail = {
                    "student_id": str(app["_id"]),
                    "generated_student_id": app.get('student_id', ''),
                    "user_details": user_info,
                    "personal_info": {
                        "firstName": app.get('firstName', ''),
                        "lastName": app.get('lastName', ''),
                        "email": app.get('email', ''),
                        "parentPhone": app.get('parentPhone', ''),
                        "phone": app.get('phone', ''),
                        "dob": app.get('dob', ''),
                        "gender": app.get('gender', ''),
                        "category": app.get('category', '')
                    },
                    "educational_info": {
                        "ssc": {
                            "sscName": app.get('sscName', ''),
                            "sscBoard": app.get('sscBoard', ''),
                            "sscMarks": app.get('sscMarks', ''),
                            "sscYearOfPassing": app.get('sscYearOfPassing', '')
                        },
                        "intermediate": {
                            "schoolName": app.get('schoolName', ''),
                            "board": app.get('board', ''),
                            "percentage": app.get('percentage', ''),
                            "interMarks": app.get('interMarks', ''),
                            "interStream": app.get('interStream', ''),
                            "passingYear": app.get('passingYear', ''),
                            "rollNumber": app.get('rollNumber', '')
                        },
                        "btech": {
                            "btechUniversity": app.get('btechUniversity', ''),
                            "btechCollege": app.get('btechCollege', ''),
                            "btechCgpa": app.get('btechCgpa', ''),
                            "btechSpecialization": app.get('btechSpecialization', ''),
                            "btechYearOfPassing": app.get('btechYearOfPassing', ''),
                            "btechDegreeType": app.get('btechDegreeType', '')
                        },
                        "mtech": {
                            "mtechUniversity": app.get('mtechUniversity', ''),
                            "mtechCollege": app.get('mtechCollege', ''),
                            "mtechCgpa": app.get('mtechCgpa', ''),
                            "mtechSpecialization": app.get('mtechSpecialization', ''),
                            "mtechYearOfPassing": app.get('mtechYearOfPassing', ''),
                            "mtechDegreeType": app.get('mtechDegreeType', '')
                        }
                    },
                    "address_info": {
                        "street": app.get('street', ''),
                        "city": app.get('city', ''),
                        "state": app.get('state', ''),
                        "pincode": app.get('pincode', ''),
                        "country": app.get('country', '')
                    },
                    "documents": {
                        "marksheet10": "uploaded" if app.get('marksheet10') else "not uploaded",
                        "marksheet12": "uploaded" if app.get('marksheet12') else "not uploaded",
                        "photo": "uploaded" if app.get('photo') else "not uploaded",
                        "signature": "uploaded" if app.get('signature') else "not uploaded",
                        "categoryCert": "uploaded" if app.get('categoryCert') else "not uploaded",
                        "otherCert": "uploaded" if app.get('otherCert') else "not uploaded",
                        "fileTypes": app.get('fileTypes', {})
                    },
                    "payment_info": {
                        "paymentAmount": app.get('paymentAmount'),
                        "paymentMethod": app.get('paymentMethod'),
                        "transactionId": app.get('transactionId'),
                        "paymentStatus": app.get('paymentStatus')
                    },
                    "exam_schedule": {
                        "examDate": app.get('examDate'),
                        "examSlot": app.get('examSlot')
                    },
                    "application_status": {
                        "status": status,
                        "isApproved": app.get('isApproved', False),
                        "remarks": app.get('remarks', ''),
                        "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None,
                        "approval_date": app.get('approvalDate', '').isoformat() if app.get('approvalDate') else None
                    }
                }
                detailed_applications.append(application_detail)

            total_count = len(detailed_applications)
            approved_count = len([app for app in detailed_applications if app['application_status']['status'] == 'approved'])
            rejected_count = len([app for app in detailed_applications if app['application_status']['status'] == 'rejected'])
            pending_count = len([app for app in detailed_applications if app['application_status']['status'] == 'pending'])

            return Response({
                "summary": {
                    "total_applications": total_count,
                    "approved_applications": approved_count,
                    "rejected_applications": rejected_count,
                    "pending_applications": pending_count,
                    "filtered_by": approval_status if approval_status else "all"
                },
                "applications": detailed_applications
            }, status=200)

        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving all applications details.",
                "error": str(err)
            }, status=500)
    
    def post(self, request):
        """Get applications with advanced filtering options"""
        try:
            # Get the MongoDB database
            db = settings.MONGO_DB["initReg"]
            students = db.students
            
            # Get filtering criteria from request body
            filters = request.data.get('filters', {})
            
            # Build MongoDB query
            query = {}
            
            # Status filter
            status_filter = filters.get('status')
            if status_filter == 'approved':
                query['isApproved'] = True
            elif status_filter == 'rejected':
                query['isApproved'] = False
                query['remarks'] = {'$ne': ''}
            elif status_filter == 'pending':
                query['isApproved'] = False
            
            # Date range filter
            date_from = filters.get('date_from')
            date_to = filters.get('date_to')
            if date_from or date_to:
                date_query = {}
                if date_from:
                    date_query['$gte'] = ObjectId.from_datetime(datetime.fromisoformat(date_from))
                if date_to:
                    date_query['$lte'] = ObjectId.from_datetime(datetime.fromisoformat(date_to))
                query['_id'] = date_query
            
            # Category filter
            category = filters.get('category')
            if category:
                query['category'] = category
            
            # State filter
            state = filters.get('state')
            if state:
                query['state'] = state
            
            # Board filter
            board = filters.get('board')
            if board:
                query['board'] = board
            
            # Get applications with filters
            applications = list(students.find(query).sort("_id", -1))
            
            # Format detailed response (same as GET method)
            detailed_applications = []
            for app in applications:
                if app.get('isApproved', False):
                    status = 'approved'
                elif app.get('remarks', ''):
                    status = 'rejected'
                else:
                    status = 'pending'
                
                application_detail = {
                    "student_id": str(app["_id"]),
                    "generated_student_id": app.get('student_id', ''),
                    "personal_info": {
                        "firstName": app.get('firstName', ''),
                        "lastName": app.get('lastName', ''),
                        "email": app.get('email', ''),
                        "phone": app.get('phone', ''),
                        "dob": app.get('dob', ''),
                        "gender": app.get('gender', ''),
                        "category": app.get('category', '')
                    },
                    "educational_info": {
                        "schoolName": app.get('schoolName', ''),
                        "board": app.get('board', ''),
                        "percentage": app.get('percentage', ''),
                        "passingYear": app.get('passingYear', ''),
                        "rollNumber": app.get('rollNumber', '')
                    },
                    "address_info": {
                        "street": app.get('street', ''),
                        "city": app.get('city', ''),
                        "state": app.get('state', ''),
                        "pincode": app.get('pincode', ''),
                        "country": app.get('country', '')
                    },
                    "documents": {
                        "marksheet10": "uploaded" if app.get('marksheet10') else "not uploaded",
                        "marksheet12": "uploaded" if app.get('marksheet12') else "not uploaded",
                        "photo": "uploaded" if app.get('photo') else "not uploaded",
                        "signature": "uploaded" if app.get('signature') else "not uploaded",
                        "categoryCert": "uploaded" if app.get('categoryCert') else "not uploaded",
                        "fileTypes": app.get('fileTypes', {})
                    },
                    "application_status": {
                        "status": status,
                        "isApproved": app.get('isApproved', False),
                        "remarks": app.get('remarks', ''),
                        "submission_date": app.get('_id').generation_time.isoformat() if app.get('_id') else None,
                        "approval_date": app.get('approvalDate', '').isoformat() if app.get('approvalDate') else None
                    }
                }
                detailed_applications.append(application_detail)
            
            return Response({
                "filters_applied": filters,
                "summary": {
                    "total_filtered": len(detailed_applications),
                    "approved": len([app for app in detailed_applications if app['application_status']['status'] == 'approved']),
                    "rejected": len([app for app in detailed_applications if app['application_status']['status'] == 'rejected']),
                    "pending": len([app for app in detailed_applications if app['application_status']['status'] == 'pending'])
                },
                "applications": detailed_applications
            }, status=200)
            
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving filtered applications.",
                "error": str(err)
            }, status=500)


class ApplicationDetailByStudentIdView(APIView):
    def get(self, request, student_id):
        """Get full application detail by generated student_id (e.g., VU25HYD000001)."""
        try:
            db = settings.MONGO_DB["initReg"]
            students = db.students
            app = students.find_one({"student_id": student_id})
            if not app:
                return Response({"message": "No application found for this student_id"}, status=404)
            application_detail = _build_application_detail(app)
            return Response({"application": application_detail}, status=200)
        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error retrieving application details.",
                "error": str(err)
            }, status=500)
        
class ApplicationEditView(APIView):
    """Edit application details for a given application id.

    Supports PATCH and PUT. Accepts either a top-level JSON body with fields to update
    or a nested `update_data` object.
    """
    def _perform_update(self, request, application_id):
        try:
            db = settings.MONGO_DB["initReg"]
            students = db.students

            query = None
            app = None
            try:
                obj = ObjectId(application_id)
                query = {"_id": obj}
                app = students.find_one(query)
            except Exception:
                app = None

            if not app:
                query = {"student_id": application_id}
                app = students.find_one(query)

            if not app:
                return Response({"message": "No application found for this student_id"}, status=404)

            update_data = None
            try:
                if isinstance(request.data, dict):
                    if 'update_data' in request.data and isinstance(request.data.get('update_data'), dict):
                        update_data = request.data.get('update_data')
                    else:
                        update_data = {k: v for k, v in request.data.items()}
                else:
                    update_data = {}
            except Exception:
                update_data = {}

            if not update_data:
                return Response({"message": "No update data provided"}, status=400)

            update_result = students.update_one(query, {'$set': update_data})
            if update_result.modified_count == 1:
                return Response({"message": "Application updated successfully"}, status=200)
            else:
                return Response({"message": "No changes made to the application"}, status=200)

        except Exception as err:
            print(f"Error: {err}")
            return Response({
                "message": "Error updating application details.",
                "error": str(err)
            }, status=500)

    def patch(self, request, application_id):
        return self._perform_update(request, application_id)

    def put(self, request, application_id):
        return self._perform_update(request, application_id)

class FileView(APIView):
    def get(self, request, phone, file_name):
        db = settings.MONGO_DB["initReg"]
        students = db.students
        # Search for the file in the student record by phone
        student = students.find_one({"phone": phone, file_name: {"$exists": True, "$ne": None}})
        if not student or not student.get(file_name):
            raise Http404("File not found")
        file_data = student[file_name]
        file_type = student.get('fileTypes', {}).get(file_name, 'application/octet-stream')
        response = HttpResponse(file_data, content_type=file_type)
        response['Content-Disposition'] = f'inline; filename={file_name}'
        return response

class DBHealthView(APIView):
    """Simple DB health endpoint to verify MongoDB connectivity."""
    def get(self, request):
        try:
            # Perform a lightweight ping
            db = settings.MONGO_DB
            ping = db.command('ping')
            # Optionally include client/server address if available
            client_info = {}
            try:
                client = getattr(settings, 'MONGO_CLIENT', None)
                if client:
                    client_info['address'] = getattr(client, 'address', None)
            except Exception:
                pass

            return Response({
                'ok': True,
                'ping': ping,
                'client': client_info
            }, status=200)
        except Exception as e:
            return Response({
                'ok': False,
                'error': str(e)
            }, status=503)

class PaymentUploadView(APIView):
    """Handle bulk upload of payment details from Excel file"""
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Upload and process Excel file with payment details"""
        serializer = PaymentUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                "message": "Invalid file upload",
                "errors": serializer.errors
            }, status=400)
        
        try:
            file = serializer.validated_data['file']
            
            # Read Excel file
            df = pd.read_excel(file)
            
            # Define expected columns
            expected_columns = [
                'status', 'txnid', 'addedon', 'id', 'amount', 'productinfo', 'firstname', 
                'email', 'phone', 'ip', 'merchant_id', 'bank_name', 'bank_ref_no', 
                'cardtype', 'mode', 'error_code', 'errorDescription', 'error_message', 
                'pgmid', 'pg_response', 'issuing_bank', 'payment_source', 'name_on_card', 
                'card_number', 'address_line1', 'address_line2', 'state', 'country', 
                'zipcode', 'shipping_firstname', 'shipping_lastname', 'shipping_address1', 
                'shipping_address2', 'shipping_city', 'shipping_state', 'shipping_country', 
                'shipping_zipcode', 'shipping_phone', 'transaction_fee', 'discount', 
                'additional_charges', 'amount(inr)', 'udf1', 'udf2', 'udf3', 'udf4', 
                'udf5', 'field0', 'field1', 'field2', 'field3', 'field4', 'field5', 
                'field6', 'field7', 'field8', 'device_info', 'merchant_subvention_amount', 
                'utr', 'recon_ref_number', 'settlement_amount', 'settlement_date', 
                'service_fees', 'tsp_charges', 'convenience_fee', 'cgst', 'sgst', 'igst', 
                'token_bin', 'last_four_digits', 'arn', 'auth_code', 'conversion_status', 
                'conversion_date', 'conversion_remarks', 'mer_service_fee', 'currency_type', 
                'network_type', 'unmapped_status', 'category', 'sub_category'
            ]
            
            # Check if all expected columns are present
            missing_columns = set(expected_columns) - set(df.columns)
            if missing_columns:
                return Response({
                    "message": "Missing required columns in Excel file",
                    "missing_columns": list(missing_columns)
                }, status=400)
            
            # Replace NaN with None for MongoDB compatibility
            df = df.where(pd.notna(df), None)
            
            # Convert DataFrame to list of dictionaries
            payment_records = df.to_dict('records')
            
            # Sanitize records: replace NaN, Inf, -Inf with None
            for record in payment_records:
                for key, value in list(record.items()):
                    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
                        record[key] = None
            
            # Add metadata
            for record in payment_records:
                record['uploaded_at'] = datetime.now()
                record['uploaded_by'] = request.user.username if hasattr(request, 'user') and request.user.is_authenticated else 'anonymous'
            
            # Get MongoDB connection
            db = settings.MONGO_DB["initReg"]
            payment_gateway_collection = db.payment_gateway_data
            
            # Insert records into MongoDB
            if payment_records:
                result = payment_gateway_collection.insert_many(payment_records)
                inserted_count = len(result.inserted_ids)
            else:
                inserted_count = 0
            
            return Response({
                "message": "Payment details uploaded successfully",
                "total_records": len(payment_records),
                "inserted_count": inserted_count,
                "status": "success"
            }, status=201)
        
        except Exception as err:
            logging.error(f"Error uploading payment details: {err}")
            return Response({
                "message": "Error processing file",
                "error": str(err)
            }, status=500)
    
    def get(self, request):
        """Retrieve uploaded payment details with optional filtering"""
        try:
            db = settings.MONGO_DB["initReg"]
            payment_gateway_collection = db.payment_gateway_data
            
            # Build query based on request parameters
            query = {}
            
            # Filter by transaction ID
            txnid = request.GET.get('txnid')
            if txnid:
                query['txnid'] = txnid
            
            # Filter by email (case-insensitive)
            email = request.GET.get('email')
            if email:
                query['email'] = {'$regex': f'^{email}$', '$options': 'i'}
            
            # Filter by phone (handle both string and numeric values)
            phone = request.GET.get('phone')
            if phone:
                # Try to match both string and numeric representations
                try:
                    phone_as_int = int(phone)
                    query['phone'] = {'$in': [phone, phone_as_int, str(phone_as_int)]}
                except ValueError:
                    # If not a valid number, just search as string
                    query['phone'] = phone
            
            # Filter by status
            status = request.GET.get('status')
            if status:
                query['status'] = status
            
            # Pagination
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 50))
            skip = (page - 1) * limit
            
            # Get total count
            total_count = payment_gateway_collection.count_documents(query)
            
            # Fetch records
            cursor = payment_gateway_collection.find(query).skip(skip).limit(limit).sort('addedon', -1)
            
            records = []
            for record in cursor:
                # Convert ObjectId to string
                record['_id'] = str(record['_id'])
                # Convert datetime to ISO format string
                if 'uploaded_at' in record and record['uploaded_at']:
                    record['uploaded_at'] = record['uploaded_at'].isoformat()
                
                # Sanitize float values (NaN, Inf, -Inf) to None for JSON compliance
                for key, value in record.items():
                    if isinstance(value, float):
                        if math.isnan(value) or math.isinf(value):
                            record[key] = None
                
                records.append(record)
            
            return Response({
                "records": records,
                "total_count": total_count,
                "page": page,
                "limit": limit,
                "total_pages": (total_count + limit - 1) // limit
            }, status=200)
        
        except Exception as err:
            logging.error(f"Error retrieving payment details: {err}")
            return Response({
                "message": "Error retrieving payment details",
                "error": str(err)
            }, status=500)
    
    def delete(self, request):
        """Delete payment records (use with caution)"""
        try:
            db = settings.MONGO_DB["initReg"]
            payment_gateway_collection = db.payment_gateway_data
            
            # Delete specific record by ID
            record_id = request.GET.get('id')
            if record_id:
                result = payment_gateway_collection.delete_one({"_id": ObjectId(record_id)})
                if result.deleted_count > 0:
                    return Response({
                        "message": "Payment record deleted successfully",
                        "deleted_count": result.deleted_count
                    }, status=200)
                else:
                    return Response({
                        "message": "Payment record not found"
                    }, status=404)
            
            # Delete all records (requires confirmation parameter)
            confirm_delete_all = request.GET.get('confirm_delete_all')
            if confirm_delete_all == 'YES_DELETE_ALL':
                result = payment_gateway_collection.delete_many({})
                return Response({
                    "message": "All payment records deleted",
                    "deleted_count": result.deleted_count
                }, status=200)
            
            return Response({
                "message": "Please provide 'id' parameter or 'confirm_delete_all=YES_DELETE_ALL'"
            }, status=400)
        
        except Exception as err:
            logging.error(f"Error deleting payment details: {err}")
            return Response({
                "message": "Error deleting payment details",
                "error": str(err)
            }, status=500)