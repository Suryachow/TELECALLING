# authapp/urls.py
from django.urls import path
from .views import (
    AdminLoginView, AdminRegistrationView, AllPaymentsDetailsView, ApplicationEditView, RegisterView, LoginView, StudentView, StudentApprovalView, StudentStatusView,
    AllApplicationsView, SendOTPView, VerifyOTPView, StepCacheView, StepSubmitView,
    OTPBaseLoginView, FileView, UGStudentView, PendingApplicationsPayments, PaymentUploadView,
    ApplicationDetailByStudentIdView, UsersPaymentsView, PaymentsCollectionView, SinglePaymentRecordView
)
from .views import DBHealthView

urlpatterns = [
    # Admin Registration
    path('admin/register/', AdminRegistrationView.as_view(), name='admin_register'),
    path('admin/details/', AdminRegistrationView.as_view(), name='admin_details'),
    path('admin/password-reset/', AdminRegistrationView.as_view(), name='admin_password_reset'),
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),

    # Registration & Login
    path('register/', RegisterView.as_view(), name='register'),
    path('register/details/', RegisterView.as_view(), name='register_details'),
    path('login/', LoginView.as_view(), name='login'),
    path('otpbase-login/', OTPBaseLoginView.as_view(), name='otpbase_login'),

    # Student Management
    path('student/', StudentView.as_view(), name='student'),
    path('student/approval/', StudentApprovalView.as_view(), name='student_approval'),
    path('student/approval/<str:student_id>/', StudentApprovalView.as_view(), name='student_approval_detail'),
    path('student/status/', StudentStatusView.as_view(), name='student_status'),
    path('ug/student/', UGStudentView.as_view(), name='ug_student'),

    # Application Edit
    path('application/edit/<str:application_id>/', ApplicationEditView.as_view(), name='application_edit'),

    # Applications
    path('applications/', AllApplicationsView.as_view(), name='all_applications'),
    path('applications/student-id/<str:student_id>/', ApplicationDetailByStudentIdView.as_view(), name='application_detail_by_student_id'),
    # Exam schedule applications from main collection
    path('applications/exam-schedule/', AllApplicationsView.as_view(), name='applications_exam_schedule'),


    # Payments endpoint
    path('applications/payments/', AllPaymentsDetailsView.as_view(), name='applications_payments'),
    path('applications/payments/pending/',PendingApplicationsPayments.as_view(),name="pending_payments"),
    
    # Users Payments Collection
    path('users-payments/', UsersPaymentsView.as_view(), name='users_payments'),
    path('users-payments/verify/', UsersPaymentsView.as_view(), name='users_payments_verify'),
    
    # Payments Collection (Step-wise Payment Data)
    path('payments/', PaymentsCollectionView.as_view(), name='payments_collection'),
    path('payments/verify/', PaymentsCollectionView.as_view(), name='payments_verify'),
    path('payments/record/', SinglePaymentRecordView.as_view(), name='payments_record'),
    
    # Payment Gateway Data Upload
    path('payment-gateway/upload/', PaymentUploadView.as_view(), name='payment_gateway_upload'),
    path('payment-gateway/data/', PaymentUploadView.as_view(), name='payment_gateway_data'),

    # OTP Endpoints
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),

    # Step-wise Cache Endpoints
    path('step/<str:step_name>/', StepCacheView.as_view(), name='step_cache_by_name'),
    path('step/submit/', StepSubmitView.as_view(), name='step_submit'),
    path('step/cache/', StepCacheView.as_view(), name='step_cache'),
    path('step/last-completed/', StepCacheView.as_view(), name='last_completed_step'),
    path('step/clear/', StepCacheView.as_view(), name='step_clear'),
    # Exam schedule applications endpoint
    path('step/exam-schedule/', StepCacheView.as_view(), name='step_exam_schedule'),

    # File Endpoints
    path('file/<str:phone>/<str:file_name>/', FileView.as_view(), name='file_view'),
    # Health endpoints
    path('health/db/', DBHealthView.as_view(), name='db_health'),
]
