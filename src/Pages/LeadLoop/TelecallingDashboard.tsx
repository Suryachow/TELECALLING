import { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  MessageSquare,
  Calendar,
  RefreshCw,
  Filter,
  Clock,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { TelecallingApi } from '@/lib/api';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { Agent, StudentLead, CallLog, LogCallPayload } from '@/types/tele';

interface DashboardStats {
  totalLeads: number;
  interestedLeads: number;
  notInterestedLeads: number;
  callbackLeads: number;
  voicemailLeads: number;
  noAnswerLeads: number;
  wrongNumberLeads: number;
  totalCalls: number;
  averageCallDuration: number;
}

interface CategorizedLeadsData {
  interested: StudentLead[];
  notInterested: StudentLead[];
  callback: StudentLead[];
  voicemail: StudentLead[];
  noAnswer: StudentLead[];
  wrongNumber: StudentLead[];
}

const CATEGORY_COLORS: Record<string, string> = {
  interested: '#10b981',
  notInterested: '#ef4444',
  callback: '#f59e0b',
  voicemail: '#8b5cf6',
  noAnswer: '#3b82f6',
  wrongNumber: '#6366f1',
};

export default function TelecallingDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentStats, setAgentStats] = useState<Agent | null>(null);
  const [allLeads, setAllLeads] = useState<StudentLead[]>([]);
  const [categorizedLeads, setCategorizedLeads] = useState<CategorizedLeadsData>({
    interested: [],
    notInterested: [],
    callback: [],
    voicemail: [],
    noAnswer: [],
    wrongNumber: [],
  });
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<StudentLead[]>([]);
  const [callStatusCounts, setCallStatusCounts] = useState<Array<{ status: string; count: number }>>([]);

  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    interestedLeads: 0,
    notInterestedLeads: 0,
    callbackLeads: 0,
    voicemailLeads: 0,
    noAnswerLeads: 0,
    wrongNumberLeads: 0,
    totalCalls: 0,
    averageCallDuration: 0,
  });

  const [filters, setFilters] = useState({
    category: 'all',
    program: 'all',
    campus: 'all',
  });

  const [isLogCallDialogOpen, setIsLogCallDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<StudentLead | null>(null);
  const [logCallForm, setLogCallForm] = useState({
    call_status: 'completed' as 'completed' | 'failed' | 'no_answer',
    call_duration: 0,
    notes: '',
    category: 'interested',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allLeads]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://tele.screenova.tech/api/admin/stats/');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: {
        status: string;
        timestamp: string;
        calls: {
          total: number;
          completed: number;
          failed: number;
          pending: number;
          total_duration: number;
          average_duration: number;
        };
        leads: {
          total: number;
          student_leads: number;
          interested: number;
          not_interested: number;
          callback: number;
          voicemail: number;
          wrong_number: number;
          no_answer: number;
        };
        agents: {
          total: number;
          active: number;
          agents_detailed: Array<{
            agent_id: string;
            agent_name: string;
            total_calls: number;
            completed_calls: number;
            assigned_leads: number;
            status: string;
          }>;
        };
        records: { total_student_records: number };
        system: { total_users: number; active_users: number };
      } = await res.json();

      // Choose active agent for greeting if available
      const activeAgent = data.agents?.agents_detailed?.find(a => a.status === 'active') || data.agents?.agents_detailed?.[0];
      if (activeAgent) {
        setAgent({ name: activeAgent.agent_name } as unknown as Agent);
      } else {
        setAgent(null);
      }

      // Map counts to existing stats structure
      setStats({
        totalLeads: data.leads?.total ?? 0,
        interestedLeads: data.leads?.interested ?? 0,
        notInterestedLeads: data.leads?.not_interested ?? 0,
        callbackLeads: data.leads?.callback ?? 0,
        voicemailLeads: data.leads?.voicemail ?? 0,
        noAnswerLeads: data.leads?.no_answer ?? 0,
        wrongNumberLeads: data.leads?.wrong_number ?? 0,
        totalCalls: data.calls?.total ?? 0,
        averageCallDuration: Math.round(data.calls?.average_duration ?? 0),
      });

      setCallStatusCounts([
        { status: 'completed', count: data.calls?.completed ?? 0 },
        { status: 'failed', count: data.calls?.failed ?? 0 },
        { status: 'pending', count: data.calls?.pending ?? 0 },
      ]);

      // Clear lists that are no longer sourced from this endpoint
      setAllLeads([]);
      setCategorizedLeads({
        interested: [],
        notInterested: [],
        callback: [],
        voicemail: [],
        noAnswer: [],
        wrongNumber: [],
      });
      setCallLogs([]);
      setAgentStats(null);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    leads: StudentLead[],
    categorized: CategorizedLeadsData,
    logs: CallLog[]
  ) => {
    const avgDuration =
      logs.length > 0
        ? Math.round(
            logs.reduce((sum, log) => sum + log.call_duration, 0) / logs.length
          )
        : 0;

    setStats({
      totalLeads: leads.length,
      interestedLeads: categorized.interested.length,
      notInterestedLeads: categorized.notInterested.length,
      callbackLeads: categorized.callback.length,
      voicemailLeads: categorized.voicemail.length,
      noAnswerLeads: categorized.noAnswer.length,
      wrongNumberLeads: categorized.wrongNumber.length,
      totalCalls: logs.length,
      averageCallDuration: avgDuration,
    });
  };

  const applyFilters = () => {
    let filtered = [...allLeads];

    if (filters.category !== 'all') {
      const categoryLeads = categorizedLeads[filters.category as keyof CategorizedLeadsData];
      filtered = filtered.filter((lead) =>
        categoryLeads.some((cl) => cl._id === lead._id)
      );
    }

    if (filters.program !== 'all') {
      filtered = filtered.filter((lead) => lead.program === filters.program);
    }

    if (filters.campus !== 'all') {
      filtered = filtered.filter((lead) => lead.campus === filters.campus);
    }

    setFilteredLeads(filtered);
  };

  const handleLogCall = (lead: StudentLead) => {
    setSelectedLead(lead);
    setLogCallForm({
      call_status: 'completed',
      call_duration: 0,
      notes: '',
      category: 'interested',
    });
    setIsLogCallDialogOpen(true);
  };

  const handleSubmitCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !agent) return;

    try {
      const payload: LogCallPayload = {
        agent_id: agent._id || agent.id || '',
        student_lead_id: selectedLead._id,
        call_status: logCallForm.call_status,
        call_duration: logCallForm.call_duration,
        notes: logCallForm.notes,
        call_datetime: new Date().toISOString(),
        category: logCallForm.category,
      };

      await TelecallingApi.logCall(selectedLead._id, payload);
      await fetchDashboardData();
      setIsLogCallDialogOpen(false);
    } catch (err) {
      console.error('Error logging call:', err);
      setError('Failed to log call. Please try again.');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      program: 'all',
      campus: 'all',
    });
  };

  const programs = Array.from(new Set(allLeads.map((l) => l.program)));
  const campuses = Array.from(new Set(allLeads.map((l) => l.campus)));

  // Chart data
  const categoryData = [
    { name: 'Interested', value: stats.interestedLeads, color: CATEGORY_COLORS.interested },
    { name: 'Not Interested', value: stats.notInterestedLeads, color: CATEGORY_COLORS.notInterested },
    { name: 'Callback', value: stats.callbackLeads, color: CATEGORY_COLORS.callback },
    { name: 'Voicemail', value: stats.voicemailLeads, color: CATEGORY_COLORS.voicemail },
    { name: 'No Answer', value: stats.noAnswerLeads, color: CATEGORY_COLORS.noAnswer },
    { name: 'Wrong Number', value: stats.wrongNumberLeads, color: CATEGORY_COLORS.wrongNumber },
  ];

  const callStatusData = callStatusCounts;

  const callDurationByHour: Array<{ hour: string; calls: number }> = [];

  const columns = [
    {
      key: 'index',
      label: 'S.NO',
      render: (_: StudentLead) => filteredLeads.indexOf(_) + 1,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'phone_number',
      label: 'Phone',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'program',
      label: 'Program',
      sortable: true,
    },
    {
      key: 'campus',
      label: 'Campus',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      render: (lead: StudentLead) =>
        lead.category ? (
          <span
            className="px-3 py-1 rounded-full text-xs font-medium capitalize"
            style={{
              backgroundColor: CATEGORY_COLORS[lead.category] + '20',
              color: CATEGORY_COLORS[lead.category],
            }}
          >
            {lead.category.replace('_', ' ')}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (lead: StudentLead) => new Date(lead.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      exportable: false,
      render: (lead: StudentLead) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLogCall(lead)}
            title="Log Call"
            className="text-green-600 hover:text-green-700"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Send Message"
            className="text-blue-600 hover:text-blue-700"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Schedule Follow-up"
            className="text-purple-600 hover:text-purple-700"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telecalling Dashboard"
        subtitle={`Welcome, ${agent?.first_name || agent?.name || 'Agent'}`}
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={fetchDashboardData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Agent Stats */}
      {agentStats && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Today's Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Calls Today</p>
              <p className="text-2xl font-bold text-blue-900">
                {agentStats.stats?.callsToday || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Talk Time</p>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round((agentStats.stats?.talkTimeToday || 0) / 60)} min
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Conversions</p>
              <p className="text-2xl font-bold text-blue-900">
                {agentStats.stats?.conversionsToday || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {agentStats.stats?.conversionRate || 0}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalLeads}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Interested</p>
              <p className="text-3xl font-bold text-green-600">{stats.interestedLeads}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Calls</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCalls}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Call Duration</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.averageCallDuration}s
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lead Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'interested', label: 'Interested', count: stats.interestedLeads },
          { key: 'notInterested', label: 'Not Interested', count: stats.notInterestedLeads },
          { key: 'callback', label: 'Callback', count: stats.callbackLeads },
          { key: 'voicemail', label: 'Voicemail', count: stats.voicemailLeads },
          { key: 'noAnswer', label: 'No Answer', count: stats.noAnswerLeads },
          { key: 'wrongNumber', label: 'Wrong Number', count: stats.wrongNumberLeads },
        ].map((category) => (
          <Card
            key={category.key}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() =>
              setFilters({
                ...filters,
                category: category.key,
              })
            }
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{category.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{category.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="notInterested">Not Interested</SelectItem>
                <SelectItem value="callback">Callback</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="noAnswer">No Answer</SelectItem>
                <SelectItem value="wrongNumber">Wrong Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Program</Label>
            <Select value={filters.program} onValueChange={(value) => setFilters({ ...filters, program: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Campus</Label>
            <Select value={filters.campus} onValueChange={(value) => setFilters({ ...filters, campus: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                {campuses.map((campus) => (
                  <SelectItem key={campus} value={campus}>
                    {campus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Leads by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Call Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={callStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Calls by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={callDurationByHour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="calls"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Leads Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Leads ({filteredLeads.length} of {allLeads.length})
        </h3>
        <DataTable
          data={filteredLeads}
          columns={columns}
          loading={loading}
          searchable
          searchKeys={['name', 'email', 'phone_number', 'program', 'campus']}
          pageSize={10}
        />
      </Card>

      {/* Log Call Dialog */}
      <Dialog open={isLogCallDialogOpen} onOpenChange={setIsLogCallDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitCallLog}>
            <DialogHeader>
              <DialogTitle>Log Call</DialogTitle>
              <DialogDescription>
                {selectedLead?.name} - {selectedLead?.phone_number}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="call_status">Call Status</Label>
                <Select
                  value={logCallForm.call_status}
                  onValueChange={(value: any) =>
                    setLogCallForm({ ...logCallForm, call_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="call_duration">Call Duration (seconds)</Label>
                <Input
                  id="call_duration"
                  type="number"
                  min="0"
                  value={logCallForm.call_duration}
                  onChange={(e) =>
                    setLogCallForm({
                      ...logCallForm,
                      call_duration: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={logCallForm.category}
                  onValueChange={(value) =>
                    setLogCallForm({ ...logCallForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="callback">Callback</SelectItem>
                    <SelectItem value="voicemail">Voicemail</SelectItem>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                    <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={logCallForm.notes}
                  onChange={(e) =>
                    setLogCallForm({ ...logCallForm, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Add any notes about the call..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogCallDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Log Call</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
