import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Phone,
  Mail,
  MessageCircle,
  RefreshCw,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  campus?: string;
  program?: string;
  interest_level: 'hot' | 'warm' | 'cold';
  notes?: string;
  created_at: string;
  last_contacted?: string;
  next_follow_up?: string;
  conversion_probability?: number;
}

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  avgResponseTime: number;
}

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  converted: '#10b981',
  lost: '#ef4444',
};

const INTEREST_COLORS: Record<Lead['interest_level'], string> = {
  hot: '#ef4444',
  warm: '#f59e0b',
  cold: '#3b82f6',
};

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    conversionRate: 0,
    avgResponseTime: 0,
  });

  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    interestLevel: 'all',
    fromDate: '',
    toDate: '',
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    campus: '',
    program: '',
    status: 'new' as Lead['status'],
    interest_level: 'warm' as Lead['interest_level'],
    notes: '',
  });

  const [isMockData, setIsMockData] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, leads]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use mock data only
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh.k@example.com',
          phone: '9876543210',
          source: 'Website',
          status: 'new',
          campus: 'Guntur',
          program: 'B.Tech',
          interest_level: 'hot',
          notes: 'Interested in CSE program',
          created_at: '2024-12-08T10:30:00Z',
          conversion_probability: 85,
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya.s@example.com',
          phone: '9876543211',
          source: 'Google Ads',
          status: 'contacted',
          campus: 'Visakhapatnam',
          program: 'MBA',
          interest_level: 'warm',
          notes: 'Contacted via phone, interested in MBA',
          created_at: '2024-12-07T14:20:00Z',
          last_contacted: '2024-12-09T09:15:00Z',
          next_follow_up: '2024-12-12T10:00:00Z',
          conversion_probability: 65,
        },
        {
          id: '3',
          name: 'Amit Patel',
          email: 'amit.p@example.com',
          phone: '9876543212',
          source: 'Referral',
          status: 'qualified',
          campus: 'Hyderabad',
          program: 'B.Tech',
          interest_level: 'hot',
          notes: 'Referred by existing student, very interested',
          created_at: '2024-12-06T11:00:00Z',
          last_contacted: '2024-12-08T16:30:00Z',
          next_follow_up: '2024-12-11T14:00:00Z',
          conversion_probability: 90,
        },
        {
          id: '4',
          name: 'Sneha Reddy',
          email: 'sneha.r@example.com',
          phone: '9876543213',
          source: 'Facebook',
          status: 'converted',
          campus: 'Guntur',
          program: 'B.Tech',
          interest_level: 'hot',
          notes: 'Application submitted and approved',
          created_at: '2024-11-25T09:00:00Z',
          last_contacted: '2024-12-05T12:00:00Z',
          conversion_probability: 100,
        },
        {
          id: '5',
          name: 'Vikram Singh',
          email: 'vikram.s@example.com',
          phone: '9876543214',
          source: 'Instagram',
          status: 'lost',
          campus: 'Visakhapatnam',
          program: 'MBA',
          interest_level: 'cold',
          notes: 'Not interested, joined another institution',
          created_at: '2024-11-20T15:30:00Z',
          last_contacted: '2024-11-28T10:00:00Z',
          conversion_probability: 0,
        },
        {
          id: '6',
          name: 'Ananya Iyer',
          email: 'ananya.i@example.com',
          phone: '9876543215',
          source: 'Website',
          status: 'new',
          campus: 'Guntur',
          program: 'B.Tech',
          interest_level: 'warm',
          notes: 'Inquiry received through contact form',
          created_at: '2024-12-09T08:45:00Z',
          conversion_probability: 55,
        },
      ];

      setLeads(mockLeads);
      calculateStats(mockLeads);
      setIsMockData(true);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadsData: Lead[]) => {
    const newLeads = leadsData.filter((l) => l.status === 'new').length;
    const contacted = leadsData.filter((l) => l.status === 'contacted').length;
    const qualified = leadsData.filter((l) => l.status === 'qualified').length;
    const converted = leadsData.filter((l) => l.status === 'converted').length;
    const lost = leadsData.filter((l) => l.status === 'lost').length;

    const conversionRate =
      leadsData.length > 0 ? Math.round((converted / leadsData.length) * 100) : 0;

    setStats({
      totalLeads: leadsData.length,
      newLeads,
      contactedLeads: contacted,
      qualifiedLeads: qualified,
      convertedLeads: converted,
      lostLeads: lost,
      conversionRate,
      avgResponseTime: 2.5, // Mock value
    });
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (filters.status !== 'all') {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    if (filters.source !== 'all') {
      filtered = filtered.filter((lead) => lead.source === filters.source);
    }

    if (filters.interestLevel !== 'all') {
      filtered = filtered.filter((lead) => lead.interest_level === filters.interestLevel);
    }

    if (filters.fromDate) {
      filtered = filtered.filter(
        (lead) => new Date(lead.created_at) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(
        (lead) => new Date(lead.created_at) <= new Date(filters.toDate)
      );
    }

    setFilteredLeads(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      source: 'all',
      interestLevel: 'all',
      fromDate: '',
      toDate: '',
    });
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: '',
      campus: '',
      program: '',
      status: 'new',
      interest_level: 'warm',
      notes: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      campus: lead.campus || '',
      program: lead.program || '',
      status: lead.status,
      interest_level: lead.interest_level,
      notes: lead.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        // TODO: Implement update via API
        // await leadsApi.update(editingLead.id, formData);
      } else {
        // TODO: Implement create via API
        // await leadsApi.create(formData);
      }
      await fetchLeads();
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error saving lead:', err);
    }
  };

  const handleDeleteLead = async (_leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      // TODO: Implement delete via API
      // await leadsApi.delete(_leadId);
      await fetchLeads();
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const columns = [
    {
      key: 'index',
      label: 'S.NO',
      sortable: false,
      render: (_: Lead) => filteredLeads.indexOf(_) + 1,
    },
    {
      key: 'name',
      label: 'Name',
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
      key: 'phone',
      label: 'Phone',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      key: 'campus',
      label: 'Campus',
      sortable: true,
      render: (lead: Lead) => lead.campus || '-',
    },
    {
      key: 'program',
      label: 'Program',
      sortable: true,
      render: (lead: Lead) => lead.program || '-',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (lead: Lead) => (
        <span
          className="px-3 py-1 rounded-full text-xs font-medium capitalize"
          style={{
            backgroundColor: STATUS_COLORS[lead.status] + '20',
            color: STATUS_COLORS[lead.status],
          }}
        >
          {lead.status}
        </span>
      ),
    },
    {
      key: 'interest_level',
      label: 'Interest',
      sortable: true,
      render: (lead: Lead) => (
        <span
          className="px-3 py-1 rounded-full text-xs font-medium capitalize"
          style={{
            backgroundColor: INTEREST_COLORS[lead.interest_level] + '20',
            color: INTEREST_COLORS[lead.interest_level],
          }}
        >
          {lead.interest_level}
        </span>
      ),
    },
    {
      key: 'conversion_probability',
      label: 'Probability',
      sortable: true,
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${lead.conversion_probability || 0}%` }}
            />
          </div>
          <span className="text-xs font-medium">{lead.conversion_probability || 0}%</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (lead: Lead) => new Date(lead.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      exportable: false,
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/lead/${lead.id}`)}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditLead(lead)}
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteLead(lead.id)}
            title="Delete"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Call">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Email">
            <Mail className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Message">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Chart data
  const statusDistribution = Object.entries(STATUS_COLORS).map(([status, color]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: leads.filter((l) => l.status === status).length,
    color,
  }));

  const interestDistribution = Object.entries(INTEREST_COLORS).map(([level, color]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: leads.filter((l) => l.interest_level === level).length,
    color,
  }));

  const sourceData = Array.from(new Set(leads.map((l) => l.source))).map((source) => ({
    source,
    count: leads.filter((l) => l.source === source).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management Dashboard"
        subtitle="Track and manage your leads effectively"
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={fetchLeads} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddLead} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        }
      />

      {isMockData && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">Mock Data</AlertTitle>
          <AlertDescription className="text-amber-700">
            This dashboard is currently showing mock/demo data only.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
          {error}
        </div>
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
              <p className="text-sm text-muted-foreground mb-1">New Leads</p>
              <p className="text-3xl font-bold text-amber-600">{stats.newLeads}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Converted</p>
              <p className="text-3xl font-bold text-green-600">{stats.convertedLeads}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-purple-600">{stats.conversionRate}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Interest Level</Label>
            <Select
              value={filters.interestLevel}
              onValueChange={(value) => setFilters({ ...filters, interestLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            />
          </div>

          <div>
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interest Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={interestDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {interestDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredLeads}
        columns={columns}
        loading={loading}
        searchable
        searchKeys={['name', 'email', 'phone', 'source', 'campus', 'program']}
        pageSize={10}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmitLead}>
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
              <DialogDescription>
                {editingLead ? 'Update lead information' : 'Enter new lead details'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source *</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campus">Campus</Label>
                  <Input
                    id="campus"
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Lead['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interest_level">Interest Level</Label>
                  <Select
                    value={formData.interest_level}
                    onValueChange={(value: Lead['interest_level']) =>
                      setFormData({ ...formData, interest_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingLead ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}