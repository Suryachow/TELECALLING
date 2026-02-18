export interface SalesMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
}

export interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  leads?: number;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted';
  score: number;
  region: string;
  source: string;
  assignedTo: string;
  lastContact: string;
  value: number;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedClose: string;
  leadId: string;
  salesRep: string;
}

export interface TelecallData {
  id: string;
  callerName: string;
  leadName: string;
  duration: string;
  outcome: 'connected' | 'no-answer' | 'voicemail' | 'interested' | 'not-interested';
  followUp: string;
  notes: string;
  timestamp: string;
}

export const salesMetrics: SalesMetric[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$2,345,678',
    change: '+12.5%',
    changeType: 'increase',
    icon: 'dollar-sign'
  },
  {
    id: '2',
    title: 'Deals Closed',
    value: '156',
    change: '+8.2%',
    changeType: 'increase',
    icon: 'target'
  },
  {
    id: '3',
    title: 'Conversion Rate',
    value: '23.4%',
    change: '-2.1%',
    changeType: 'decrease',
    icon: 'trending-up'
  },
  {
    id: '4',
    title: 'Average Deal Size',
    value: '$15,037',
    change: '+5.8%',
    changeType: 'increase',
    icon: 'bar-chart'
  }
];

export const marketingMetrics: SalesMetric[] = [
  {
    id: '1',
    title: 'Campaign ROI',
    value: '425%',
    change: '+18.3%',
    changeType: 'increase',
    icon: 'trending-up'
  },
  {
    id: '2',
    title: 'Lead Generation',
    value: '1,234',
    change: '+15.7%',
    changeType: 'increase',
    icon: 'users'
  },
  {
    id: '3',
    title: 'Email Open Rate',
    value: '24.8%',
    change: '+3.2%',
    changeType: 'increase',
    icon: 'mail'
  },
  {
    id: '4',
    title: 'Cost per Lead',
    value: '$45',
    change: '-12.4%',
    changeType: 'increase',
    icon: 'dollar-sign'
  }
];

export const monthlyData: ChartData[] = [
  { name: 'Jan', value: 180000, revenue: 180000, leads: 245 },
  { name: 'Feb', value: 220000, revenue: 220000, leads: 289 },
  { name: 'Mar', value: 190000, revenue: 190000, leads: 267 },
  { name: 'Apr', value: 280000, revenue: 280000, leads: 334 },
  { name: 'May', value: 320000, revenue: 320000, leads: 398 },
  { name: 'Jun', value: 295000, revenue: 295000, leads: 356 },
];

export const channelData: ChartData[] = [
  { name: 'Email', value: 35 },
  { name: 'Social Media', value: 28 },
  { name: 'Website', value: 22 },
  { name: 'Referrals', value: 15 },
];

export const leads: Lead[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    company: 'TechCorp Inc.',
    email: 'alice@techcorp.com',
    phone: '+1 (555) 123-4567',
    status: 'qualified',
    score: 85,
    region: 'North America',
    source: 'Website',
    assignedTo: 'John Smith',
    lastContact: '2024-01-15',
    value: 50000
  },
  {
    id: '2',
    name: 'Bob Wilson',
    company: 'StartupXYZ',
    email: 'bob@startupxyz.com',
    phone: '+1 (555) 234-5678',
    status: 'new',
    score: 92,
    region: 'Europe',
    source: 'Email Campaign',
    assignedTo: 'Sarah Davis',
    lastContact: '2024-01-14',
    value: 75000
  },
  {
    id: '3',
    name: 'Carol Brown',
    company: 'Enterprise Solutions',
    email: 'carol@enterprise.com',
    phone: '+1 (555) 345-6789',
    status: 'proposal',
    score: 78,
    region: 'Asia',
    source: 'Referral',
    assignedTo: 'Mike Johnson',
    lastContact: '2024-01-13',
    value: 120000
  }
];

export const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    company: 'TechCorp Inc.',
    value: 150000,
    stage: 'negotiation',
    probability: 75,
    expectedClose: '2024-02-15',
    leadId: '1',
    salesRep: 'John Smith'
  },
  {
    id: '2',
    title: 'Cloud Migration Project',
    company: 'StartupXYZ',
    value: 85000,
    stage: 'proposal',
    probability: 60,
    expectedClose: '2024-03-01',
    leadId: '2',
    salesRep: 'Sarah Davis'
  }
];

export const telecallData: TelecallData[] = [
  {
    id: '1',
    callerName: 'John Smith',
    leadName: 'Alice Johnson',
    duration: '12:45',
    outcome: 'interested',
    followUp: '2024-01-18',
    notes: 'Interested in enterprise package, will discuss with team',
    timestamp: '2024-01-15 14:30'
  },
  {
    id: '2',
    callerName: 'Sarah Davis',
    leadName: 'Bob Wilson',
    duration: '8:22',
    outcome: 'no-answer',
    followUp: '2024-01-16',
    notes: 'No answer, will try again tomorrow',
    timestamp: '2024-01-15 11:15'
  }
];