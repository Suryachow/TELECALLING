import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { leadsApi } from '@/lib/api';
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
  Legend,
} from 'recharts';

interface LeadSource {
  id: string;
  name: string;
  type: 'organic' | 'paid' | 'referral' | 'social' | 'direct' | 'other';
  description?: string;
  status: 'active' | 'inactive';
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  cost?: number;
  costPerLead?: number;
  createdAt: string;
  lastUpdated: string;
}

interface LeadSourceForm {
  name: string;
  type: LeadSource['type'];
  description: string;
  status: 'active' | 'inactive';
  cost: string;
}

const initialFormState: LeadSourceForm = {
  name: '',
  type: 'organic',
  description: '',
  status: 'active',
  cost: '',
};

const SOURCE_COLORS: Record<string, string> = {
  organic: '#10b981',
  paid: '#3b82f6',
  referral: '#8b5cf6',
  social: '#ec4899',
  direct: '#f59e0b',
  other: '#6b7280',
};

export default function LeadSourcePage() {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [formData, setFormData] = useState<LeadSourceForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const fetchLeadSources = async () => {
    setLoading(true);
    setError(null);
    setIsMockData(false);
    
    try {
      // Mock data - replace with actual API call
      // const response = await leadsApi.getSources();
      // setSources(response.data.sources || []);

      // Temporary mock data
      const mockData: LeadSource[] = [
        {
          id: '1',
          name: 'Google Ads',
          type: 'paid',
          description: 'Google AdWords campaigns',
          status: 'active',
          totalLeads: 245,
          convertedLeads: 89,
          conversionRate: 36.3,
          cost: 15000,
          costPerLead: 61.22,
          createdAt: '2024-01-15',
          lastUpdated: '2024-12-10',
        },
        {
          id: '2',
          name: 'Facebook Organic',
          type: 'social',
          description: 'Organic posts and engagement',
          status: 'active',
          totalLeads: 189,
          convertedLeads: 67,
          conversionRate: 35.4,
          cost: 0,
          costPerLead: 0,
          createdAt: '2024-01-10',
          lastUpdated: '2024-12-09',
        },
        {
          id: '3',
          name: 'Student Referrals',
          type: 'referral',
          description: 'Current student referrals program',
          status: 'active',
          totalLeads: 156,
          convertedLeads: 78,
          conversionRate: 50.0,
          cost: 7800,
          costPerLead: 50.0,
          createdAt: '2024-02-01',
          lastUpdated: '2024-12-10',
        },
        {
          id: '4',
          name: 'Website SEO',
          type: 'organic',
          description: 'Organic search traffic',
          status: 'active',
          totalLeads: 312,
          convertedLeads: 98,
          conversionRate: 31.4,
          cost: 0,
          costPerLead: 0,
          createdAt: '2023-12-01',
          lastUpdated: '2024-12-10',
        },
        {
          id: '5',
          name: 'Instagram Ads',
          type: 'paid',
          description: 'Instagram sponsored posts',
          status: 'active',
          totalLeads: 178,
          convertedLeads: 54,
          conversionRate: 30.3,
          cost: 8500,
          costPerLead: 47.75,
          createdAt: '2024-03-01',
          lastUpdated: '2024-12-08',
        },
        {
          id: '6',
          name: 'LinkedIn',
          type: 'social',
          description: 'LinkedIn posts and outreach',
          status: 'inactive',
          totalLeads: 45,
          convertedLeads: 12,
          conversionRate: 26.7,
          cost: 0,
          costPerLead: 0,
          createdAt: '2024-01-20',
          lastUpdated: '2024-11-15',
        },
      ];

      setSources(mockData);
      setIsMockData(true); // Set flag to show mock data alert
    } catch (err) {
      console.error('Error fetching lead sources:', err);
      setError('Failed to load lead sources');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (source?: LeadSource) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        type: source.type,
        description: source.description || '',
        status: source.status,
        cost: source.cost?.toString() || '',
      });
    } else {
      setEditingSource(null);
      setFormData(initialFormState);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSource(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingSource) {
        // await leadsApi.updateSource(editingSource.id, formData);
        console.log('Updating source:', editingSource.id, formData);
      } else {
        // await leadsApi.createSource(formData);
        console.log('Creating source:', formData);
      }
      await fetchLeadSources();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving lead source:', err);
      setError('Failed to save lead source');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead source?')) return;

    try {
      // await leadsApi.deleteSource(id);
      console.log('Deleting source:', id);
      await fetchLeadSources();
    } catch (err) {
      console.error('Error deleting lead source:', err);
      setError('Failed to delete lead source');
    }
  };

  const columns = [
    {
      key: 'index',
      label: 'S.NO',
      sortable: false,
      render: (_: LeadSource) => sources.indexOf(_) + 1,
    },
    {
      key: 'name',
      label: 'Source Name',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
      render: (item: LeadSource) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: SOURCE_COLORS[item.type] }}
          />
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
      render: (item: LeadSource) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
          {item.type}
        </span>
      ),
    },
    {
      key: 'totalLeads',
      label: 'Total Leads',
      sortable: true,
      render: (item: LeadSource) => (
        <span className="font-semibold text-blue-600">{item.totalLeads}</span>
      ),
    },
    {
      key: 'convertedLeads',
      label: 'Converted',
      sortable: true,
      render: (item: LeadSource) => (
        <span className="font-semibold text-green-600">{item.convertedLeads}</span>
      ),
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      sortable: true,
      render: (item: LeadSource) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${Math.min(item.conversionRate, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium">{item.conversionRate.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: 'cost',
      label: 'Total Cost',
      sortable: true,
      render: (item: LeadSource) => (
        <span className="font-medium">
          {item.cost ? `₹${item.cost.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      key: 'costPerLead',
      label: 'Cost/Lead',
      sortable: true,
      render: (item: LeadSource) => (
        <span className="font-medium">
          {item.costPerLead ? `₹${item.costPerLead.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: LeadSource) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[item.status]
            }`}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      exportable: false,
      render: (item: LeadSource) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(item)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate summary stats
  const totalLeads = sources.reduce((acc, s) => acc + s.totalLeads, 0);
  const totalConverted = sources.reduce((acc, s) => acc + s.convertedLeads, 0);
  const totalCost = sources.reduce((acc, s) => acc + (s.cost || 0), 0);
  const avgConversionRate = sources.length > 0
    ? sources.reduce((acc, s) => acc + s.conversionRate, 0) / sources.length
    : 0;

  // Prepare chart data
  const sourceTypeData = Object.entries(
    sources.reduce((acc, source) => {
      acc[source.type] = (acc[source.type] || 0) + source.totalLeads;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color: SOURCE_COLORS[type],
  }));

  const performanceData = sources
    .sort((a, b) => b.totalLeads - a.totalLeads)
    .slice(0, 5)
    .map((source) => ({
      name: source.name,
      leads: source.totalLeads,
      converted: source.convertedLeads,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Sources"
        subtitle="Manage and analyze your lead generation sources"
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={fetchLeadSources} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleOpenDialog()} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </div>
        }
      />

      {/* Mock Data Alert */}
      {isMockData && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Mock Data Notice</AlertTitle>
          <AlertDescription className="text-amber-700">
            You are currently viewing mock data. This data is for demonstration purposes only.
            Connect to the actual API to view real lead source information.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-blue-600">{totalLeads}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Converted</p>
              <p className="text-3xl font-bold text-green-600">{totalConverted}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Conversion</p>
              <p className="text-3xl font-bold text-purple-600">
                {avgConversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-amber-600">
                ₹{totalCost.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Leads by Source Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Sources Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#3b82f6" name="Total Leads" />
              <Bar dataKey="converted" fill="#10b981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={sources}
        columns={columns}
        loading={loading}
        searchable
        searchKeys={['name', 'type', 'description']}
        pageSize={10}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSource ? 'Edit Lead Source' : 'Add New Lead Source'}
              </DialogTitle>
              <DialogDescription>
                {editingSource
                  ? 'Update the lead source details below.'
                  : 'Enter the details for the new lead source.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Source Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Google Ads, Facebook"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: LeadSource['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this lead source"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cost">Cost (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingSource ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}