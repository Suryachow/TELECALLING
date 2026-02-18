import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Filter, RefreshCw, Phone, Mail, MessageCircle, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usersApi } from '@/lib/api';
import type { User } from './LeadGeneration';
import { cn } from '@/lib/utils';

interface FollowUp extends User {
  nextFollowUp?: string;   // ISO date
  priority?: 'high' | 'medium' | 'low';
  status?: 'due' | 'overdue' | 'scheduled';
}

export default function FollowUpsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'due' | 'overdue' | 'scheduled'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      const users: User[] = res.data.users || [];
      // naive mock enrichment
      const enriched = users.map((u, i) => ({
        ...u,
        nextFollowUp: new Date(Date.now() + (i % 5 - 1) * 24 * 3600 * 1000).toISOString(),
        priority: (['high', 'medium', 'low'][i % 3] as FollowUp['priority']),
        status: (['due', 'overdue', 'scheduled'][i % 3] as FollowUp['status']),
      }));
      setItems(enriched);
    } catch (e) {
      console.error('Follow-ups fetch failed', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((it) => {
      const matchesSearch =
        it.name.toLowerCase().includes(q) ||
        it.email.toLowerCase().includes(q) ||
        it.phone.includes(q) ||
        (it.program || '').toLowerCase().includes(q);
      const matchesStatus = status === 'all' || it.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, status]);

  const pill = (p?: string, fallback = 'N/A') => (
    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
      {p ? p.toUpperCase() : fallback}
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        subtitle="Track and act on pending follow-up calls/messages"
        actions={
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, program"
          className="w-72"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border rounded-lg px-3 py-2 bg-background text-sm"
          >
            <option value="all">All</option>
            <option value="due">Due</option>
            <option value="overdue">Overdue</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="grid grid-cols-12 px-4 py-3 text-sm font-medium text-muted-foreground">
          <span className="col-span-3">Student</span>
          <span className="col-span-2">Email</span>
          <span className="col-span-2">Phone</span>
          <span className="col-span-2">Next Follow-up</span>
          <span className="col-span-1">Priority</span>
          <span className="col-span-2">Actions</span>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">No follow-ups found.</div>
          ) : (
            filtered.map((u) => (
              <div key={u.phone} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                <div className="col-span-3">
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-muted-foreground text-xs">{u.program?.toUpperCase() || 'N/A'}</div>
                  <div className="text-muted-foreground text-xs">{u.campus}</div>
                </div>
                <span className="col-span-2">{u.email}</span>
                <span className="col-span-2">{u.phone}</span>
                <div className="col-span-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {u.nextFollowUp
                    ? new Date(u.nextFollowUp).toLocaleDateString()
                    : 'N/A'}
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      u.status === 'overdue' && 'bg-red-100 text-red-800',
                      u.status === 'due' && 'bg-yellow-100 text-yellow-800',
                      u.status === 'scheduled' && 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {u.status ? u.status.toUpperCase() : 'N/A'}
                  </span>
                </div>
                <span className="col-span-1">{pill(u.priority)}</span>
                <div className="col-span-2 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/tele/call/${u.phone}`)}>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/tele/email/${u.phone}`)}>
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/tele/message/${u.phone}`)}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/tele/view/${u.phone}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}