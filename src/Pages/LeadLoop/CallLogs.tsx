import { useEffect, useState } from 'react';
import { Phone, Clock, Filter, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/DataTable';

type CallOutcome = 'interested' | 'not_interested' | 'follow_up' | 'callback' | 'no_answer' | 'wrong_number';

interface CallLog {
  id: string;
  studentName: string;
  phone: string;
  agent: string;
  startTime: string;   // ISO
  durationSec: number;
  outcome: CallOutcome;
  notes?: string;
}

const outcomeColors: Record<CallOutcome, string> = {
  interested: 'bg-green-100 text-green-800',
  not_interested: 'bg-red-100 text-red-800',
  follow_up: 'bg-yellow-100 text-yellow-800',
  callback: 'bg-blue-100 text-blue-800',
  no_answer: 'bg-gray-100 text-gray-800',
  wrong_number: 'bg-purple-100 text-purple-800',
};

export default function CallLogsPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | CallOutcome>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // TODO: replace with real API call
      const mock: CallLog[] = [
        {
          id: '1',
          studentName: 'John Doe',
          phone: '+91 98765 12345',
          agent: 'Agent A',
          startTime: new Date().toISOString(),
          durationSec: 215,
          outcome: 'interested',
          notes: 'Asked for brochure',
        },
        {
          id: '2',
          studentName: 'Jane Smith',
          phone: '+91 91234 56789',
          agent: 'Agent B',
          startTime: new Date(Date.now() - 3600_000).toISOString(),
          durationSec: 95,
          outcome: 'follow_up',
          notes: 'Call back tomorrow 11 AM',
        },
        {
          id: '3',
          studentName: 'Raj Kumar',
          phone: '+91 99887 66554',
          agent: 'Agent C',
          startTime: new Date(Date.now() - 7200_000).toISOString(),
          durationSec: 0,
          outcome: 'no_answer',
          notes: 'No answer',
        },
      ];
      setLogs(mock);
    } catch (e) {
      console.error('Failed to load call logs', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.studentName.toLowerCase().includes(q) ||
      log.phone.toLowerCase().includes(q) ||
      log.agent.toLowerCase().includes(q);
    const matchesOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const columns = [
    { key: 'studentName', label: 'Student', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'agent', label: 'Agent', sortable: true },
    {
      key: 'startTime',
      label: 'Start Time',
      sortable: true,
      render: (log: CallLog) => new Date(log.startTime).toLocaleString(),
    },
    {
      key: 'durationSec',
      label: 'Duration',
      sortable: true,
      render: (log: CallLog) => formatDuration(log.durationSec),
    },
    {
      key: 'outcome',
      label: 'Outcome',
      sortable: true,
      render: (log: CallLog) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${outcomeColors[log.outcome]}`}>
          {log.outcome.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (log: CallLog) => log.notes || '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Logs"
        subtitle="Review call history and outcomes"
        actions={
          <Button variant="outline" size="sm" onClick={loadLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search by student, phone, agent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2 bg-background text-sm"
          >
            <option value="all">All outcomes</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="follow_up">Follow Up</option>
            <option value="callback">Callback</option>
            <option value="no_answer">No Answer</option>
            <option value="wrong_number">Wrong Number</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        searchable
        searchKeys={['studentName', 'phone', 'agent', 'outcome']}
        pageSize={10}
      />
    </div>
  );
}