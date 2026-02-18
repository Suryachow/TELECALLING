import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, TrendingUp, Users, Phone, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { usersApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AuditMetrics {
  totalLeads: number;
  callsAttempted: number;
  callsConnected: number;
  conversionRate: number;
  avgCallDuration: number;
  qualityScore: number;
}

interface AuditLog {
  id: string;
  studentName: string;
  phone: string;
  callDate: string;
  callDuration: number;
  outcome: string;
  auditorNotes: string;
  qualityRating: number;
  agent: string;
  issues: string[];
}

export default function LeadAuditorPage() {
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalLeads: 0,
    callsAttempted: 0,
    callsConnected: 0,
    conversionRate: 0,
    avgCallDuration: 0,
    qualityScore: 0,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sample data for charts
  const dailyPerformanceData = [
    { date: 'Mon', calls: 45, conversions: 12, rating: 4.2 },
    { date: 'Tue', calls: 52, conversions: 15, rating: 4.3 },
    { date: 'Wed', calls: 48, conversions: 14, rating: 4.1 },
    { date: 'Thu', calls: 61, conversions: 18, rating: 4.5 },
    { date: 'Fri', calls: 55, conversions: 16, rating: 4.4 },
    { date: 'Sat', calls: 38, conversions: 10, rating: 4.0 },
    { date: 'Sun', calls: 28, conversions: 7, rating: 3.9 },
  ];

  const outcomeDistribution = [
    { name: 'Interested', value: 35, color: '#10b981' },
    { name: 'Not Interested', value: 25, color: '#ef4444' },
    { name: 'Follow Up', value: 20, color: '#f59e0b' },
    { name: 'No Answer', value: 12, color: '#6b7280' },
    { name: 'Wrong Number', value: 8, color: '#8b5cf6' },
  ];

  const agentPerformanceData = [
    { agent: 'Agent A', calls: 156, conversions: 42, rating: 4.5 },
    { agent: 'Agent B', calls: 142, conversions: 38, rating: 4.3 },
    { agent: 'Agent C', calls: 128, conversions: 31, rating: 4.1 },
    { agent: 'Agent D', calls: 165, conversions: 44, rating: 4.6 },
    { agent: 'Agent E', calls: 119, conversions: 28, rating: 3.9 },
  ];

  // Sample audit logs
  const sampleAuditLogs: AuditLog[] = [
    {
      id: '1',
      studentName: 'John Doe',
      phone: '+1234567890',
      callDate: '2025-12-08',
      callDuration: 240,
      outcome: 'interested',
      auditorNotes: 'Good engagement, clear communication',
      qualityRating: 5,
      agent: 'Agent A',
      issues: [],
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      phone: '+1234567891',
      callDate: '2025-12-08',
      callDuration: 180,
      outcome: 'follow_up',
      auditorNotes: 'Student had concerns about fees',
      qualityRating: 4,
      agent: 'Agent B',
      issues: ['speed_of_speech'],
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      phone: '+1234567892',
      callDate: '2025-12-07',
      callDuration: 95,
      outcome: 'not_interested',
      auditorNotes: 'Quick rejection, did not explore options',
      qualityRating: 2,
      agent: 'Agent C',
      issues: ['lack_of_engagement', 'poor_listening'],
    },
    {
      id: '4',
      studentName: 'Sarah Williams',
      phone: '+1234567893',
      callDate: '2025-12-07',
      callDuration: 320,
      outcome: 'interested',
      auditorNotes: 'Excellent call handling, addressed all concerns',
      qualityRating: 5,
      agent: 'Agent D',
      issues: [],
    },
    {
      id: '5',
      studentName: 'Tom Brown',
      phone: '+1234567894',
      callDate: '2025-12-07',
      callDuration: 120,
      outcome: 'no_answer',
      auditorNotes: 'No answer on first attempt',
      qualityRating: 3,
      agent: 'Agent E',
      issues: ['no_follow_up'],
    },
  ];

  useEffect(() => {
    fetchAuditData();
  }, [selectedFilter, dateRange]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      setAuditLogs(sampleAuditLogs);
      setMetrics({
        totalLeads: 500,
        callsAttempted: 445,
        callsConnected: 389,
        conversionRate: 23.4,
        avgCallDuration: 187,
        qualityScore: 4.2,
      });
    } catch (error) {
      console.error('Error fetching audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Student Name',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
    },
    {
      key: 'agent',
      label: 'Agent',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'callDate',
      label: 'Call Date',
      sortable: true,
      render: (log: AuditLog) => new Date(log.callDate).toLocaleDateString(),
    },
    {
      key: 'callDuration',
      label: 'Duration',
      sortable: true,
      render: (log: AuditLog) => formatDuration(log.callDuration),
    },
    {
      key: 'outcome',
      label: 'Outcome',
      render: (log: AuditLog) => {
        const outcomeColors: { [key: string]: string } = {
          'interested': 'bg-green-100 text-green-800',
          'not_interested': 'bg-red-100 text-red-800',
          'follow_up': 'bg-yellow-100 text-yellow-800',
          'no_answer': 'bg-gray-100 text-gray-800',
          'wrong_number': 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${outcomeColors[log.outcome] || 'bg-gray-100'}`}>
            {log.outcome.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'qualityRating',
      label: 'Quality',
      sortable: true,
      render: (log: AuditLog) => (
        <div className="flex items-center gap-1">
          <span className={`font-bold ${getRatingColor(log.qualityRating)}`}>
            {log.qualityRating}.0
          </span>
          <span className="text-muted-foreground">/5</span>
        </div>
      ),
    },
    {
      key: 'issues',
      label: 'Issues',
      render: (log: AuditLog) => (
        <div className="flex gap-1 flex-wrap">
          {log.issues.length > 0 ? (
            log.issues.map((issue) => (
              <span key={issue} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                {issue.replace('_', ' ')}
              </span>
            ))
          ) : (
            <span className="text-green-600 text-sm font-medium">✓ No issues</span>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      exportable: false,
      render: (log: AuditLog) => (
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Auditor"
        subtitle="Monitor call quality, performance metrics, and agent compliance"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Mock Data Alert */}
      <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Mock Data Notice</AlertTitle>
          <AlertDescription className="text-amber-700">
            You are currently viewing mock data. This data is for demonstration purposes only.
            Connect to the actual API to view real lead source information.
          </AlertDescription>
        </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
              <p className="text-3xl font-bold">{metrics.totalLeads}</p>
            </div>
            <Users className="w-10 h-10 text-blue opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{metrics.callsConnected} of {metrics.callsAttempted} calls</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
              <p className="text-3xl font-bold">{metrics.qualityScore.toFixed(1)}/5</p>
              <p className="text-xs text-muted-foreground mt-1">Average rating</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Calls Attempted</p>
              <p className="text-3xl font-bold">{metrics.callsAttempted}</p>
              <p className="text-xs text-muted-foreground mt-1">{metrics.callsConnected} connected</p>
            </div>
            <Phone className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Call Duration</p>
              <p className="text-3xl font-bold">{formatDuration(metrics.avgCallDuration)}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-600 opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Connection Rate</p>
              <p className="text-3xl font-bold">
                {((metrics.callsConnected / metrics.callsAttempted) * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-indigo-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#3b82f6" />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Call Outcome Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outcomeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Agent Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agent" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="calls" fill="#3b82f6" />
              <Bar yAxisId="left" dataKey="conversions" fill="#10b981" />
              <Bar yAxisId="right" dataKey="rating" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-background"
          >
            <option value="all">All Calls</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="follow_up">Follow Up</option>
            <option value="issues">With Issues</option>
          </select>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm bg-background"
              placeholder="Start Date"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm bg-background"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Audit Logs</h3>
        <DataTable
          data={auditLogs}
          columns={columns}
          loading={loading}
          searchable
          searchKeys={['studentName', 'phone', 'agent', 'outcome']}
          pageSize={10}
        />
      </div>

      {/* Quality Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Call Quality Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">✓ Best Practices:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Clear and professional introduction</li>
              <li>Active listening and engagement</li>
              <li>Addressing student concerns</li>
              <li>Call duration 3-5 minutes optimal</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">✗ Issues to Avoid:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Speaking too fast or unclear</li>
              <li>Lack of student engagement</li>
              <li>Missing follow-up opportunities</li>
              <li>Failing to address objections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}