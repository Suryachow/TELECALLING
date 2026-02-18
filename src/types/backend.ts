export interface OTPBaseLoginRequest {
    phone: string;
    otp: string;
}

export interface AdminRegisterRequest {
    institutionCode: string;
    institutionName: string;
    name: string;
    db_uri: string;
    admin_email: string;
    contactPhone?: string;
    password?: string;
    logo_url?: string;
    address?: string;
    settings?: Record<string, any>;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    campus: string;
    program: string;
    specialization: string;
    password?: string;
    confirmPassword?: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface UGStudentRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    category?: string;
    parentPhone?: string;
    interMarks?: string;
    percentage?: string;
    schoolName?: string;
    board?: string;
    interStream?: string;
    rollNumber?: string;
    passingYear?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    paymentAmount?: number;
    paymentMethod?: string;
    transactionId?: string;
    paymentStatus?: string;
    examDate?: string;
    examSlot?: string;
    photo?: File | null;
    marksheet10?: File | null;
    marksheet12?: File | null;
    signature?: File | null;
    otherCert?: File | null;
    fileTypes?: Record<string, string>;
    isApproved?: boolean;
}

export interface StudentRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    category?: string;
    parentPhone?: string;
    sscName?: string;
    sscBoard?: string;
    sscMarks?: string;
    sscYearOfPassing?: string;
    schoolName?: string;
    board?: string;
    percentage?: string;
    passingYear?: string;
    rollNumber?: string;
    interMarks?: string;
    interStream?: string;
    btechUniversity?: string;
    btechCollege?: string;
    btechCgpa?: string;
    btechSpecialization?: string;
    btechYearOfPassing?: string;
    btechDegreeType?: string;
    mtechUniversity?: string;
    mtechCollege?: string;
    mtechCgpa?: string;
    mtechSpecialization?: string;
    mtechYearOfPassing?: string;
    mtechDegreeType?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    amount?: number;
    paymentAmount?: number;
    paymentMethod?: string;
    transactionId?: string;
    paymentStatus?: 'pending' | 'completed' | 'failed';
    paymentDate?: string;
    discountApplied?: number;
    couponCode?: string;
    applicationStatus?: string;
    examDate?: string;
    examSlot?: string;
    marksheet10?: File | null;
    marksheet12?: File | null;
    photo?: File | null;
    signature?: File | null;
    categoryCert?: File | null;
    otherCert?: File | null;
    fileTypes?: Record<string, string>;
    isApproved?: boolean;
}

export interface StudentApprovalRequest {
    student_id: string;
    isApproved: boolean;
    remarks?: string;
}

export interface StudentStatusRequest {
    email?: string;
    phone?: string;
    student_id?: string;
}

export interface PaymentRecordRequest {
    amount?: number;
    paymentAmount?: number;
    paymentMethod?: string;
    transactionId?: string;
    paymentStatus?: 'pending' | 'completed' | 'failed';
    paymentDate?: string;
    discountApplied?: number;
    couponCode?: string;
    applicationStatus?: string;
}

export interface SendOTPRequest {
    phone: string;
}

export interface VerifyOTPRequest {
    phone: string;
    otp: string;
}

export interface StepCacheRequest {
    session_id?: string;
    step_name: string;
    data: Record<string, any>;
}

export interface PaymentStepRequest {
    amount: number;
    payment_method: string;
    transaction_id: string;
    payment_date: string;
}

export interface PersonalInfoStepRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
}

export interface EducationStepRequest {
    schoolName: string;
    board: string;
    percentage: string;
    passingYear: string;
    rollNumber: string;
}

export interface AddressStepRequest {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface CategoryStepRequest {
    category: string;
    categoryCert?: File | null;
}

export interface ReviewStepRequest {
    declaration: boolean;
}
