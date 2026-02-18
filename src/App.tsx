import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import TelecallingDashboard from '@/Pages/LeadLoop/TelecallingDashboard';
import LeadsDashboard from '@/Pages/LeadLoop/LeadsDashboard';
import LeadGenerationPage from '@/Pages/LeadLoop/LeadGeneration';
import TCallPage from '@/Pages/LeadLoop/CallPage';
import TViewPage from '@/Pages/LeadLoop/ViewPage';
import TEmailPage from '@/Pages/LeadLoop/EmailPage';
import TMessagePage from '@/Pages/LeadLoop/MessagePage';
import FollowUps from '@/Pages/LeadLoop/FollowUps';
import BulkCommunications from '@/Pages/LeadLoop/BulkCommunications';
import CallLogs from '@/Pages/LeadLoop/CallLogs';
import LeadSource from '@/Pages/LeadLoop/LeadSource';
import LeadAuditor from '@/Pages/LeadLoop/LeadAuditor';
import {
    LayoutDashboard, Upload, Zap, Activity, FileText,
    LogOut, Bell, ChevronDown, ChevronRight, X
} from 'lucide-react';

interface NavChild { to: string; label: string; }
interface NavGroup {
    label: string;
    icon: React.ReactNode;
    children?: NavChild[];
    to?: string;
}

const navGroups: NavGroup[] = [
    {
        label: 'Payments',
        icon: <LayoutDashboard size={16} />,
        children: [
            { to: '/payments/dashboard', label: 'Dashboard' },
            { to: '/payments/completed', label: 'Completed' },
            { to: '/payments/pending', label: 'Pending' },
            { to: '/payments/failed', label: 'Failed' },
        ],
    },
    {
        label: 'Uploads',
        icon: <Upload size={16} />,
        children: [
            { to: '/uploads', label: 'Upload Files' },
        ],
    },
    {
        label: 'LeadLoop',
        icon: <Zap size={16} />,
        children: [
            { to: '/leads', label: 'Dashboard' },
            { to: '/admin/leads-all', label: 'Lead Generation' },
            { to: '/admin/bulk', label: 'Bulk Communications' },
            { to: '/admin/agents', label: 'Agents' },
            { to: '/admin/lead-source', label: 'Lead Source' },
            { to: '/admin/follow-ups', label: 'Follow-ups' },
            { to: '/admin/call-logs', label: 'Call Logs' },
            { to: '/admin/lead-auditor', label: 'Auditing' },
        ],
    },
    { label: 'System Health', icon: <Activity size={16} />, to: '/' },
    { label: 'User Logs', icon: <FileText size={16} />, to: '/user-logs' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Payments: true,
        LeadLoop: true,
    });

    const toggleGroup = (label: string) =>
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

    return (
        <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
            <div className="sidebar__logo">
                <div className="sidebar__logo-icon">
                    <Zap size={18} />
                </div>
                {!collapsed && <span className="sidebar__logo-text">Lead Sense</span>}
                <button className="sidebar__toggle" onClick={onToggle} title="Toggle sidebar">
                    {collapsed ? <ChevronRight size={15} /> : <X size={15} />}
                </button>
            </div>

            <nav className="sidebar__nav">
                {navGroups.map((group) => (
                    <div key={group.label} className="sidebar__group">
                        {group.children ? (
                            <>
                                <button
                                    className="sidebar__group-header"
                                    onClick={() => toggleGroup(group.label)}
                                >
                                    <span className="sidebar__group-icon">{group.icon}</span>
                                    {!collapsed && (
                                        <>
                                            <span className="sidebar__group-label">{group.label}</span>
                                            <span className="sidebar__group-chevron">
                                                {openGroups[group.label]
                                                    ? <ChevronDown size={13} />
                                                    : <ChevronRight size={13} />}
                                            </span>
                                        </>
                                    )}
                                </button>
                                {!collapsed && openGroups[group.label] && (
                                    <div className="sidebar__children">
                                        {group.children.map((child) => (
                                            <NavLink
                                                key={child.to}
                                                to={child.to}
                                                className={({ isActive }) =>
                                                    `sidebar__child-link${isActive ? ' sidebar__child-link--active' : ''}`
                                                }
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={group.to!}
                                className={({ isActive }) =>
                                    `sidebar__group-header sidebar__group-header--link${isActive ? ' sidebar__group-header--active' : ''}`
                                }
                            >
                                <span className="sidebar__group-icon">{group.icon}</span>
                                {!collapsed && <span className="sidebar__group-label">{group.label}</span>}
                            </NavLink>
                        )}
                    </div>
                ))}

                <div className="sidebar__group sidebar__group--logout">
                    <button className="sidebar__group-header">
                        <span className="sidebar__group-icon"><LogOut size={16} /></span>
                        {!collapsed && <span className="sidebar__group-label">Logout</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
}

function TopBar() {
    return (
        <header className="topbar">
            <div className="topbar__title">
                <span className="topbar__university">
                    Vignan's Foundation for Science, Technology &amp; Research
                </span>
                <span className="topbar__badge">(Deemed to be University)</span>
            </div>
            <div className="topbar__actions">
                <button className="topbar__icon-btn" title="Notifications">
                    <Bell size={18} />
                </button>
                <div className="topbar__user">
                    <div className="topbar__avatar">DU</div>
                    <div className="topbar__user-info">
                        <span className="topbar__user-name">Demo User</span>
                        <span className="topbar__user-role">true</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

function App() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Router>
            <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
                <div className="app-shell__main">
                    <TopBar />
                    <main className="app-shell__content">
                        <Routes>
                            <Route path="/" element={<TelecallingDashboard />} />
                            <Route path="/leads" element={<LeadsDashboard />} />
                            <Route path="/admin/leads-all" element={<LeadGenerationPage />} />
                            <Route path="/admin/tele/call/:phone" element={<TCallPage />} />
                            <Route path="/admin/tele/view/:phone" element={<TViewPage />} />
                            <Route path="/admin/tele/email/:phone" element={<TEmailPage />} />
                            <Route path="/admin/tele/message/:phone" element={<TMessagePage />} />
                            <Route path="/admin/follow-ups" element={<FollowUps />} />
                            <Route path="/admin/bulk" element={<BulkCommunications />} />
                            <Route path="/admin/call-logs" element={<CallLogs />} />
                            <Route path="/admin/lead-source" element={<LeadSource />} />
                            <Route path="/admin/lead-auditor" element={<LeadAuditor />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
