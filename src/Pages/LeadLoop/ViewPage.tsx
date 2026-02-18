import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, Calendar, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { usersApi, studentApplicationStatusApi, stepCacheApi, stepApi } from '@/lib/api';
import { User, student_details } from './LeadGeneration';

export default function TViewPage() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<student_details | null>(null);
  const [stepCacheData, setStepCacheData] = useState<any[]>([]);
  const [stepCacheLoading, setStepCacheLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stepInfo, setStepInfo] = useState<{ step_name: string; session_id: string } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [phone]);

  const fetchStepInfo = async (userPhone: string) => {
    try {
      const response = await stepCacheApi.getLastStep(userPhone);
      if (response.data?.success) {
        setStepInfo({
          step_name: response.data.step_name,
          session_id: response.data.session_id,
        });
      }
    } catch (error) {
      console.error('Error fetching step info:', error);
    }
  };

  useEffect(() => {
    if (user?.phone) {
      fetchStepInfo(user.phone);
    }
  }, [user]);

  const fetchStepCacheData = async () => {
    setStepCacheLoading(true);
    try {
      const response = await stepApi.getCache();
      let found = false;
      response.data.cached_applications.forEach((cache: any) => {
        const needToCheckUser = "pending-"+user?.phone;
        if (cache.session_id === needToCheckUser) {
          setStepCacheData([cache]);
          found = true;
        }
      });
      if (!found) setStepCacheData([]);
    } catch (error) {
      console.error('Error fetching step cache data:', error);
      setStepCacheData([]);
    } finally {
      setStepCacheLoading(false);
    }
  };


  // Fetch step cache data only when user is available
  useEffect(() => {
    if (user?.phone) {
      fetchStepCacheData();
    }
  }, [user]);


  const fetchUserData = async () => {
    try {
      const response = await usersApi.getAll();
      const foundUser = response.data.users.find((u: User) => u.phone === phone);
      setUser(foundUser || null);

      if (foundUser?.email) {
        const statusResponse = await studentApplicationStatusApi.getStatus(foundUser.email);
        setStudentDetails(statusResponse.data?.student_details || null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">User not found</div>;
  }

  // Render
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Details"
        subtitle={`Viewing profile for ${user.name}`}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/tele/call/${phone}`)}>
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/tele/email/${phone}`)}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/tele/message/${phone}`)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/leads-all')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user.role || 'Student'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue" />
            <h3 className="text-lg font-semibold">Academic Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Program</p>
                <p className="font-medium">{user.program?.toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="font-medium">{user.campus || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-medium">{user.specialization?.toUpperCase() || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Application Status or Last Step */}
        {studentDetails && studentDetails.approval_status?.toLowerCase() === 'approved' ? (
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue" />
              <h3 className="text-lg font-semibold">Application Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{studentDetails.generated_student_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Status</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Approved
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submission Date</p>
                <p className="font-medium">
                  {studentDetails.submission_date ? new Date(studentDetails.submission_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            {studentDetails.remarks && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="font-medium">{studentDetails.remarks}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue" />
              <h3 className="text-lg font-semibold">Last Completed Step</h3>
            </div>
            {stepInfo ? (
              <div className="text-center py-8">
                <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-lg font-semibold">
                  {stepInfo.step_name.replace(/_/g, ' ').toUpperCase()}
                </span>
                <div className="mt-2 text-sm text-muted-foreground">Session ID: {stepInfo.session_id}</div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No application progress found for this lead.</p>
              </div>
            )}
          </div>
        )}

        {/* Step Cache Data Section - Formatted like ViewApplicationPage */}
        {stepCacheLoading ? (
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 lg:col-span-2 flex flex-col items-center justify-center min-h-[200px]">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-blue-700 font-medium">Loading application progress...</div>
          </div>
        ) : stepCacheData && stepCacheData.length > 0 && stepCacheData[0].steps && (
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 lg:col-span-2">
            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 mb-4 border-b border-gray-200 pb-2">
              <FileText className="w-5 h-5" />
              Application Progress (Step Cache)
            </h3>
            <div className="space-y-8">
              {Object.entries(stepCacheData[0].steps)
                .filter(([stepKey]) => stepKey !== 'review' && stepKey !== 'documents')
                .map(([stepKey, stepValue]) => {
                // Special handling for personal_info: only show personal_info.personal
                if (stepKey === 'personal_info' && typeof stepValue === 'object' && stepValue !== null && 'personal' in stepValue) {
                  const personal = stepValue.personal;
                  return (
                    <section key={stepKey} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-md text-primary border-b pb-2">PERSONAL INFORMATION</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(personal as Record<string, any>)
                          .filter(([_, value]) => !(Array.isArray(value) && value.length > 1))
                          .map(([field, value]) => (
                            <div key={field}>
                              <p className="text-sm text-muted-foreground">{field.replace(/_/g, ' ')}</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {value === null || value === '' ? 'N/A' : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>
                  );
                }
                // Special handling for btech_education: only show btech_education.btechEducation
                if (stepKey === 'btech_education' && typeof stepValue === 'object' && stepValue !== null && 'btechEducation' in stepValue) {
                  const btech = stepValue.btechEducation;
                  return (
                    <section key={stepKey} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-md text-primary border-b pb-2">B.TECH EDUCATION</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(btech as Record<string, any>)
                          .filter(([_, value]) => !(Array.isArray(value) && value.length > 1))
                          .map(([field, value]) => (
                            <div key={field}>
                              <p className="text-sm text-muted-foreground">{field.replace(/_/g, ' ')}</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {value === null || value === '' ? 'N/A' : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>
                  );
                }
                // Special handling for mtech_education: only show mtech_education.mtechEducation
                if (stepKey === 'mtech_education' && typeof stepValue === 'object' && stepValue !== null && 'mtechEducation' in stepValue) {
                  const mtech = stepValue.mtechEducation;
                  return (
                    <section key={stepKey} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-md text-primary border-b pb-2">M.TECH EDUCATION</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(mtech as Record<string, any>)
                          .filter(([_, value]) => !(Array.isArray(value) && value.length > 1))
                          .map(([field, value]) => (
                            <div key={field}>
                              <p className="text-sm text-muted-foreground">{field.replace(/_/g, ' ')}</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {value === null || value === '' ? 'N/A' : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>
                  );
                }
                if (stepKey === 'exam_schedule' && typeof stepValue === 'object' && stepValue !== null && 'examSchedule' in stepValue) {
                  const examSchedule = stepValue.examSchedule;
                  return (
                    <section key={stepKey} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-md text-primary border-b pb-2">EXAM SCHEDULE</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(examSchedule as Record<string, any>)
                          .filter(([_, value]) => !(Array.isArray(value) && value.length > 1))
                          .map(([field, value]) => (
                            <div key={field}>
                              <p className="text-sm text-muted-foreground">{field.replace(/_/g, ' ')}</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {value === null || value === '' ? 'N/A' : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>
                  );
                }
                // Default rendering for other steps
                return (
                  <section key={stepKey} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold mb-3 text-md text-primary border-b pb-2">{stepKey.replace(/_/g, ' ').toUpperCase()}</h4>
                    {typeof stepValue === 'object' && stepValue !== null ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(stepValue)
                          .filter(([_, value]) => !(Array.isArray(value) && value.length > 1))
                          .map(([field, value]) => (
                            <div key={field}>
                              <p className="text-sm text-muted-foreground">{field.replace(/_/g, ' ')}</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {typeof value === 'object' && value !== null
                                  ? Array.isArray(value)
                                    ? value.length === 1
                                      ? String(value[0])
                                      : 'N/A'
                                    : Object.keys(value).length > 0
                                      ? Object.entries(value).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', ')
                                      : 'N/A'
                                  : value === null || value === '' ? 'N/A' : String(value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-900">{String(stepValue)}</p>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {/* Communication History */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-blue" />
            <h3 className="text-lg font-semibold">Communication History</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <p>No communication history available</p>
            <p className="text-sm mt-2">Start by making a call, sending an email, or messaging the student</p>
          </div>
        </div>
      </div>
    </div>
  );
}