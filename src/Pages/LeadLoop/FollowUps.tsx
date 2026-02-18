import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, RefreshCw, Phone, Mail, MessageCircle, Eye } from 'lucide-react';

interface FollowUp {
  name: string;
  email: string;
  phone: string;
  program: string;
  campus: string;
  nextFollowUp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'due' | 'overdue' | 'scheduled';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_FOLLOWUPS: FollowUp[] = [
  {
    name: 'Perusomula Srinivasa Chari',
    email: '211fa04389@gmail.com',
    phone: '8978083533',
    program: 'BTECH',
    campus: 'Guntur',
    nextFollowUp: '2026-02-17',
    priority: 'high',
    status: 'due',
  },
  {
    name: 'Mokkapati Chaitanya',
    email: 'chaitanyamokkapati0@gmail.com',
    phone: '6281487836',
    program: 'PHD',
    campus: 'Guntur',
    nextFollowUp: '2026-02-18',
    priority: 'medium',
    status: 'overdue',
  },
  {
    name: 'Tripuraneni Gireesh',
    email: 'tripuranenigireesh642@gmail.com',
    phone: '7989943008',
    program: 'BTECH',
    campus: 'Guntur',
    nextFollowUp: '2026-02-19',
    priority: 'low',
    status: 'scheduled',
  },
  {
    name: 'Komma Harish',
    email: 'k.bhaskar0001@gmail.com',
    phone: '8096688016',
    program: 'BTECH',
    campus: 'Guntur',
    nextFollowUp: '2026-02-20',
    priority: 'high',
    status: 'due',
  },
  {
    name: 'Srinivasa Chari',
    email: '211FA04389@vignan.ac.in',
    phone: '9553147457',
    program: 'PHD',
    campus: 'Guntur',
    nextFollowUp: '2026-02-21',
    priority: 'medium',
    status: 'overdue',
  },
  {
    name: 'Koganti Susanth Sai',
    email: 'kogantimahitha@gmail.com',
    phone: '7989241130',
    program: 'BTECH',
    campus: 'Guntur',
    nextFollowUp: '2026-02-17',
    priority: 'low',
    status: 'scheduled',
  },
  {
    name: 'Kagithala Sangeetha',
    email: 'sangeethak0707@gmail.com',
    phone: '8639246457',
    program: 'PHD',
    campus: 'Guntur',
    nextFollowUp: '2026-02-18',
    priority: 'high',
    status: 'due',
  },
  {
    name: 'Chintakunta Sirivalli',
    email: 'srivalliraothanneeru@gmail.com',
    phone: '9392567055',
    program: 'BTECH',
    campus: 'Hyderabad',
    nextFollowUp: '2026-02-19',
    priority: 'medium',
    status: 'overdue',
  },
  {
    name: 'Rajesh Kumar Patel',
    email: 'rajeshkumar.patel@gmail.com',
    phone: '9876543210',
    program: 'MBA',
    campus: 'Hyderabad',
    nextFollowUp: '2026-02-22',
    priority: 'high',
    status: 'scheduled',
  },
  {
    name: 'Anitha Reddy',
    email: 'anitha.reddy@outlook.com',
    phone: '9123456780',
    program: 'MTECH',
    campus: 'Vijayawada',
    nextFollowUp: '2026-02-16',
    priority: 'medium',
    status: 'overdue',
  },
  {
    name: 'Venkata Suresh Babu',
    email: 'vsuresh.babu@gmail.com',
    phone: '8012345678',
    program: 'BTECH',
    campus: 'Vijayawada',
    nextFollowUp: '2026-02-23',
    priority: 'low',
    status: 'scheduled',
  },
  {
    name: 'Lakshmi Prasanna',
    email: 'lakshmi.prasanna@gmail.com',
    phone: '7654321098',
    program: 'PHD',
    campus: 'Guntur',
    nextFollowUp: '2026-02-18',
    priority: 'high',
    status: 'due',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const priorityClass = (p: string) => {
  if (p === 'high') return 'priority-pill priority-pill--high';
  if (p === 'medium') return 'priority-pill priority-pill--medium';
  if (p === 'low') return 'priority-pill priority-pill--low';
  return 'priority-pill priority-pill--default';
};

const statusClass = (s: string) => {
  if (s === 'overdue') return 'badge badge--overdue';
  if (s === 'due') return 'badge badge--due';
  if (s === 'scheduled') return 'badge badge--scheduled';
  return 'badge';
};

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FollowUpsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'overdue' | 'scheduled'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_FOLLOWUPS.filter((it) => {
      const matchSearch =
        it.name.toLowerCase().includes(q) ||
        it.email.toLowerCase().includes(q) ||
        it.phone.includes(q) ||
        it.program.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || it.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Follow-ups</h1>
          <p className="page-header__subtitle">Track and act on pending follow-up calls/messages</p>
        </div>
        <button className="refresh-btn">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="followups-filter-bar">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, program"
          className="followups-search"
        />
        <div className="followups-filter-group">
          <Filter size={14} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="followups-select"
          >
            <option value="all">All</option>
            <option value="due">Due</option>
            <option value="overdue">Overdue</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="followups-table-wrap">
        {/* Header */}
        <div className="followups-table-header">
          <span>Student</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Next Follow-up</span>
          <span>Priority</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '24px 16px', fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
            No follow-ups match your search.
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.phone} className="followups-table-row">
              {/* Student */}
              <div>
                <div className="followups-student-name">{u.name}</div>
                <div className="followups-student-program">{u.program}</div>
                <div className="followups-student-campus">{u.campus}</div>
              </div>

              {/* Email */}
              <span className="followups-email" title={u.email}>{u.email}</span>

              {/* Phone */}
              <span className="followups-phone">{u.phone}</span>

              {/* Next Follow-up */}
              <div className="followups-date-cell">
                <Calendar size={14} className="followups-date-icon" />
                <span className="followups-date-text">{fmtDate(u.nextFollowUp)}</span>
                <span className={statusClass(u.status)}>{u.status.toUpperCase()}</span>
              </div>

              {/* Priority */}
              <span className={priorityClass(u.priority)}>{u.priority.toUpperCase()}</span>

              {/* Actions */}
              <div className="followups-actions">
                <button className="action-btn" title="Call"
                  onClick={() => navigate(`/admin/tele/call/${u.phone}`)}>
                  <Phone size={14} />
                </button>
                <button className="action-btn" title="Email"
                  onClick={() => navigate(`/admin/tele/email/${u.phone}`)}>
                  <Mail size={14} />
                </button>
                <button className="action-btn" title="Message"
                  onClick={() => navigate(`/admin/tele/message/${u.phone}`)}>
                  <MessageCircle size={14} />
                </button>
                <button className="action-btn" title="View"
                  onClick={() => navigate(`/admin/tele/view/${u.phone}`)}>
                  <Eye size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}