import { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { usersApi, studentApplicationStatusApi, stepCacheApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Eye } from "lucide-react";

export interface User {
  name: string;
  email: string;
  phone: string;
  campus: string;
  program: string;
  specialization: string;
  role: string;
  applicationStatus?: string;
  applicationID?: string;
}

export interface student_details{
    student_id: string;
    generated_student_id: string;
    name: string;
    email: string;
    phone: string;
    isApproved: boolean;
    approval_status: string;
    remarks: string;
    submission_date: string;
}

export default function LeadGenerationPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<{ [key: string]: string }>({});
  const [stepDetails, setStepDetails] = useState<{ [key: string]: { step_name: string; session_id: string } }>({});

  // Returns both status and applicationID
  const fetchApplicationStatus = async (email: string): Promise<{ status: string; applicationID?: string }> => {
    try {
      const response = await studentApplicationStatusApi.getStatus(email);
      const details = response.data?.student_details;
      return {
        status: details?.approval_status || 'Unknown',
        applicationID: details?.student_id || details?.generated_student_id || undefined,
      };
    } catch (error) {
      console.error(`Error fetching status for ${email}:`, error);
      return { status: 'Unknown' };
    }
  };

  const getUrl = (row: User) => {

    let url = '';
    if (row.applicationStatus?.toLowerCase() === 'unknown') {
      // alert('Application status is unknown. Cannot navigate to application view.');
      // return '/test';
    } else {
      url = `/admin/application/view/${row.applicationID}`;
    }
    return url;
  };


  const fetchStepDetails = async (phone: string): Promise<void> => {
    try {
      const response = await stepCacheApi.getLastStep(phone);
      if (response.data?.success) {
        setStepDetails(prev => ({
          ...prev,
          [phone]: {
            step_name: response.data.step_name,
            session_id: response.data.session_id,
          },
        }));
      }
    } catch (error) {
      console.error(`Error fetching step details for ${phone}:`, error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll();
      const allUsers = response.data.users || [];

      // Fetch application status and applicationID for each user
      const usersWithStatus = await Promise.all(
        allUsers.map(async (user: User) => {
          const statusResult = await fetchApplicationStatus(user.email);
          return {
            ...user,
            applicationStatus: statusResult.status,
            applicationID: statusResult.applicationID,
          };
        })
      );

      setUsers(usersWithStatus);

      // Fetch step details for users with unknown status
      usersWithStatus.forEach(user => {
        if (user.applicationStatus?.toLowerCase() === 'unknown') {
          fetchStepDetails(user.phone);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCallStatusUpdate = (phone: string, status: string) => {
    setCallStatus(prev => ({
      ...prev,
      [phone]: status
    }));
  };

  function capitalizeSentence(sentence: string): string {
    sentence = sentence.toLowerCase();
    if (!sentence) {
      return sentence;
    }
    const firstLetter = sentence.charAt(0).toUpperCase();
    const restOfString = sentence.slice(1);
    return firstLetter + restOfString;
  }


  const columns = [
    {
      key: 'index',
      label: 'S.NO',
      sortable: true,
      render: (_: User) => users.indexOf(_) + 1,
    },
    {
      key: 'name',
      label: 'Student Name',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
      render: (user: User) => capitalizeSentence(user.name),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'program',
      label: 'Program',
      render: (user: User) => user.program?.toUpperCase() || 'N/A',
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (user: User) => user.specialization?.toUpperCase() || 'N/A',
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'campus',
      label: 'Campus',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'applicationStatus',
      label: 'Application Status',
      exportable: false,
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
      render: (user: User) => {
        const status = user.applicationStatus?.toLowerCase();
        if (status === 'unknown' && stepDetails[user.phone]) {
          const step = stepDetails[user.phone];
          return (
            <div className="text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {step.step_name.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          );
        }
        const displayStatus = user.applicationStatus || 'Unknown';
        const statusColors: { [key: string]: string } = {
          'approved': 'bg-green-100 text-green-800',
          'pending': 'bg-yellow-100 text-yellow-800',
          'rejected': 'bg-red-100 text-red-800',
          'submitted': 'bg-blue-100 text-blue-800',
          'unknown': 'bg-gray-100 text-gray-800',
        };
        const colorClass = statusColors[displayStatus.toLowerCase()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      exportable: false,
      render: (user: User) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            title="Call"
            onClick={() => navigate(`/admin/tele/call/${user.phone}`)}
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            title="Email"
            onClick={() => navigate(`/admin/tele/email/${user.phone}`)}
          >
            <Mail className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            title="Message"
            onClick={() => navigate(`/admin/tele/message/${user.phone}`)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            title="View"
            onClick={() => navigate(`/admin/tele/view/${user.phone}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
    {
      key: 'callStatus',
      label: 'Call Status',
      sortable: false,
      filterable: false,
      exportable: false,
      render: (user: User) => (
        <select
          value={callStatus[user.phone] || 'pending'}
          onChange={(e) => handleCallStatusUpdate(user.phone, e.target.value)}
          className="text-sm border rounded px-2 py-1 bg-white"
        >
          <option value="pending">Pending</option>
          <option value="called">Called</option>
          <option value="interested">Interested</option>
          <option value="not_interested">Not Interested</option>
          <option value="follow_up">Follow Up</option>
        </select>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Generation"
        subtitle="All registered users ready for telecalling"
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="bg-blue/10 border border-blue/20 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Called</p>
          <p className="text-2xl font-bold text-blue mt-1">
            {Object.values(callStatus).filter(s => s === 'called').length}
          </p>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Interested</p>
          <p className="text-2xl font-bold text-success mt-1">
            {Object.values(callStatus).filter(s => s === 'interested').length}
          </p>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable
        searchKeys={['name', 'phone', 'email', 'campus', 'program', 'applicationStatus']}
        pageSize={10}
        getRowUrl={(row) => getUrl(row)}
      />
    </div>
  );
}