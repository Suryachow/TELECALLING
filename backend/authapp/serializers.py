from rest_framework import serializers

class OTPBaseLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate_otp(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value
    
class AdminRegisterSerializer(serializers.Serializer):
    institutionCode = serializers.CharField(max_length=100)
    institutionName = serializers.CharField(max_length=200)
    name = serializers.CharField(max_length=200)
    db_uri = serializers.CharField(max_length=1000)
    admin_email = serializers.EmailField()
    contactPhone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    logo_url = serializers.URLField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    settings = serializers.DictField(required=False, default={})

    def validate_institutionCode(self, value):
        if not value.strip():
            raise serializers.ValidationError("institutionCode is required.")
        return value

    def validate_db_uri(self, value):
        if not value.strip():
            raise serializers.ValidationError("db_uri is required.")
        return value

    def validate_logo_url(self, value):
        # allow blank, URLField already validates when provided
        return value

    def validate(self, data):
        if not data.get("institutionName"):
            raise serializers.ValidationError("institutionName is required.")
        if not data.get("admin_email"):
            raise serializers.ValidationError("admin_email is required.")
        return data

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    campus = serializers.CharField()
    program = serializers.CharField()
    specialization = serializers.CharField()
    password = serializers.CharField(write_only=True, default="admin@123")
    confirmPassword = serializers.CharField(write_only=True, default="admin@123")

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('confirmPassword'):
            raise serializers.ValidationError("Passwords do not match.")
        return data

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class ugStudentSerializer(serializers.Serializer):
    # Personal Information (from formData.personal)
    firstName = serializers.CharField(max_length=100, required=True)
    lastName = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    dob = serializers.CharField(max_length=20, required=False, allow_blank=True)
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    category = serializers.CharField(max_length=50, required=False, allow_blank=True)
    parentPhone = serializers.CharField(max_length=15, required=False, allow_blank=True)

    # Educational Information (from formData.education)
    interMarks = serializers.CharField(max_length=20, required=False, allow_blank=True)
    percentage = serializers.CharField(max_length=10, required=False, allow_blank=True)
    schoolName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    board = serializers.CharField(max_length=100, required=False, allow_blank=True)
    interStream = serializers.CharField(max_length=100, required=False, allow_blank=True)
    rollNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    passingYear = serializers.CharField(max_length=10, required=False, allow_blank=True)

    # Address Information (from formData.address)
    street = serializers.CharField(max_length=200, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)

    # Payment Information (from formData.payment)
    paymentAmount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    paymentMethod = serializers.CharField(max_length=50, required=False, allow_blank=True)
    transactionId = serializers.CharField(max_length=100, required=False, allow_blank=True)
    paymentStatus = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Exam schedule
    examDate = serializers.CharField(max_length=50, required=False, allow_blank=True)
    examSlot = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Documents and file types
    photo = serializers.FileField(required=False, allow_null=True)
    marksheet10 = serializers.FileField(required=False, allow_null=True)
    marksheet12 = serializers.FileField(required=False, allow_null=True)
    signature = serializers.FileField(required=False, allow_null=True)
    otherCert = serializers.FileField(required=False, allow_null=True)
    fileTypes = serializers.DictField(child=serializers.CharField(), required=False)

    # Approval Status
    isApproved = serializers.BooleanField(default=True, required=False)

    def validate_phone(self, value):
        if value and (not value.isdigit() or len(value) != 10):
            raise serializers.ValidationError("Phone number must be 10 digits if provided.")
        return value

    def validate_pincode(self, value):
        if value and (not value.isdigit() or len(value) not in (5, 6)):
            raise serializers.ValidationError("Pincode should be 5 or 6 digits if provided.")
        return value

    def validate_percentage(self, value):
        if value:
            try:
                val = float(value)
                if val < 0 or val > 100:
                    raise serializers.ValidationError("Percentage must be between 0 and 100.")
            except (ValueError, TypeError):
                raise serializers.ValidationError("Percentage must be a number.")
        return value


class StudentSerializer(serializers.Serializer):
    # Personal Information
    firstName = serializers.CharField(max_length=100, required=True)
    lastName = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    dob = serializers.CharField(max_length=20, required=False, allow_blank=True)  # Date of birth as string
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    category = serializers.CharField(max_length=50, required=False, allow_blank=True)
    parentPhone = serializers.CharField(max_length=15, required=False, allow_blank=True)

    # SSC (10th) Educational Information
    sscName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    sscBoard = serializers.CharField(max_length=100, required=False, allow_blank=True)
    sscMarks = serializers.CharField(max_length=20, required=False, allow_blank=True)
    sscYearOfPassing = serializers.CharField(max_length=10, required=False, allow_blank=True)

    # Intermediate (12th) Educational Information
    schoolName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    board = serializers.CharField(max_length=100, required=False, allow_blank=True)
    percentage = serializers.CharField(max_length=10, required=False, allow_blank=True)
    passingYear = serializers.CharField(max_length=10, required=False, allow_blank=True)
    rollNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    interMarks = serializers.CharField(max_length=20, required=False, allow_blank=True)
    interStream = serializers.CharField(max_length=100, required=False, allow_blank=True)

    # B.Tech Educational Information
    btechUniversity = serializers.CharField(max_length=200, required=False, allow_blank=True)
    btechCollege = serializers.CharField(max_length=200, required=False, allow_blank=True)
    btechCgpa = serializers.CharField(max_length=10, required=False, allow_blank=True)
    btechSpecialization = serializers.CharField(max_length=100, required=False, allow_blank=True)
    btechYearOfPassing = serializers.CharField(max_length=10, required=False, allow_blank=True)
    btechDegreeType = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # M.Tech Educational Information
    mtechUniversity = serializers.CharField(max_length=200, required=False, allow_blank=True)
    mtechCollege = serializers.CharField(max_length=200, required=False, allow_blank=True)
    mtechCgpa = serializers.CharField(max_length=10, required=False, allow_blank=True)
    mtechSpecialization = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mtechYearOfPassing = serializers.CharField(max_length=10, required=False, allow_blank=True)
    mtechDegreeType = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Address Information
    street = serializers.CharField(max_length=200, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)

    # Payment Information
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    paymentAmount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    paymentMethod = serializers.CharField(max_length=50, required=False, allow_blank=True)
    transactionId = serializers.CharField(max_length=100, required=False, allow_blank=True)
    paymentStatus = serializers.ChoiceField(choices=['pending', 'completed', 'failed'], default='pending', required=False)
    paymentDate = serializers.CharField(max_length=50, required=False, allow_blank=True)
    discountApplied = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    couponCode = serializers.CharField(max_length=50, required=False, allow_blank=True)
    applicationStatus = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Exam schedule
    examDate = serializers.CharField(max_length=50, required=False, allow_blank=True)
    examSlot = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # File fields (Binary data will be stored as Buffer in MongoDB)
    marksheet10 = serializers.FileField(required=False, allow_null=True)
    marksheet12 = serializers.FileField(required=False, allow_null=True)
    photo = serializers.FileField(required=False, allow_null=True)
    signature = serializers.FileField(required=False, allow_null=True)
    categoryCert = serializers.FileField(required=False, allow_null=True)
    otherCert = serializers.FileField(required=False, allow_null=True)
    fileTypes = serializers.DictField(child=serializers.CharField(), required=False)

    # Approval Status
    isApproved = serializers.BooleanField(default=True)
    
    def validate_email(self, value):
        """Custom validation for email field"""
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value
    
    def validate_phone(self, value):
        """Custom validation for phone field"""
        if not value.isdigit():
            raise serializers.ValidationError("Phone number should contain only digits.")
        if len(value) != 10:
            raise serializers.ValidationError("Phone number should be 10 digits.")
        return value
    
    def validate_percentage(self, value):
        """Custom validation for percentage field"""
        try:
            percentage = float(value)
            if percentage < 0 or percentage > 100:
                raise serializers.ValidationError("Percentage should be between 0 and 100.")
        except ValueError:
            raise serializers.ValidationError("Percentage should be a valid number.")
        return value
    
    def validate_pincode(self, value):
        """Custom validation for pincode field"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Pincode should contain only digits.")
        if value and len(value) not in (5, 6):
            raise serializers.ValidationError("Pincode should be 5 or 6 digits.")
        return value
    
    def validate(self, data):
        """Custom validation for the entire serializer"""
        # Add any cross-field validation logic here
        return data

class StudentApprovalSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=24, help_text="MongoDB ObjectId of the student")
    isApproved = serializers.BooleanField(help_text="True for approval, False for rejection")
    remarks = serializers.CharField(max_length=500, required=False, allow_blank=True, 
                                   help_text="Optional remarks for approval/rejection")
    
    def validate_student_id(self, value):
        """Custom validation for student_id field"""
        if len(value) != 24:
            raise serializers.ValidationError("Student ID must be a valid 24-character MongoDB ObjectId.")
        return value

class StudentStatusSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, help_text="Email to check submission status")
    phone = serializers.CharField(max_length=15, required=False, help_text="Phone number to check submission status")
    student_id = serializers.CharField(max_length=50, required=False, help_text="MongoDB ObjectId or generated student ID (e.g., VSAT2025000001)")

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate(self, data):
        email = data.get('email')
        phone = data.get('phone')
        student_id = data.get('student_id')
        if not email and not phone and not student_id:
            raise serializers.ValidationError("Either email, phone, or student_id must be provided.")
        return data


class PaymentRecordSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    paymentAmount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    paymentMethod = serializers.CharField(max_length=50, required=False, allow_blank=True)
    transactionId = serializers.CharField(max_length=100, required=False, allow_blank=True)
    paymentStatus = serializers.ChoiceField(choices=['pending', 'completed', 'failed'], default='pending', required=False)
    paymentDate = serializers.CharField(max_length=50, required=False, allow_blank=True)
    discountApplied = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    couponCode = serializers.CharField(max_length=50, required=False, allow_blank=True)
    applicationStatus = serializers.CharField(max_length=50, required=False, allow_blank=True)


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate_otp(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value

class StepCacheSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    step_name = serializers.CharField(max_length=50)
    data = serializers.JSONField()

    def validate(self, data):
        # Auto-generate session_id if not provided
        if not data.get('session_id'):
            import uuid
            data['session_id'] = str(uuid.uuid4())
        if not data.get('step_name'):
            raise serializers.ValidationError("step_name is required.")
        if not data.get('data'):
            raise serializers.ValidationError("step data is required.")
        return data

class PaymentStepSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField(max_length=50)
    transaction_id = serializers.CharField(max_length=100)
    payment_date = serializers.DateTimeField()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value



    def validate_document_type(self, value):
        allowed_types = ["marksheet10", "marksheet12", "photo", "signature", "categoryCert"]
        if value not in allowed_types:
            raise serializers.ValidationError(f"Document type must be one of {allowed_types}.")
        return value

class PersonalInfoStepSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    dob = serializers.CharField(max_length=20)
    gender = serializers.CharField(max_length=10)

class EducationStepSerializer(serializers.Serializer):
    schoolName = serializers.CharField(max_length=200)
    board = serializers.CharField(max_length=100)
    percentage = serializers.CharField(max_length=10)
    passingYear = serializers.CharField(max_length=4)
    rollNumber = serializers.CharField(max_length=50)

class AddressStepSerializer(serializers.Serializer):
    street = serializers.CharField(max_length=200)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=10)
    country = serializers.CharField(max_length=100)

class CategoryStepSerializer(serializers.Serializer):
    category = serializers.CharField(max_length=50)
    categoryCert = serializers.FileField(required=False, allow_null=True)

class ReviewStepSerializer(serializers.Serializer):
    declaration = serializers.BooleanField()

class PaymentUploadSerializer(serializers.Serializer):
    """Serializer for validating Excel file upload for payment details"""
    file = serializers.FileField(required=True)
    
    def validate_file(self, value):
        # Check file extension
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError("Only Excel files (.xlsx, .xls) are allowed.")
        
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size should not exceed 10MB.")
        
        return value
