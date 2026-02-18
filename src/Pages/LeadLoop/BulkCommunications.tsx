import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageCircle, Send, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { usersApi, whatsappMessageApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { User } from './LeadGeneration';

interface MessageTemplate {
  id: number;
  templateName: string;
  mediaType: string;
  msgText: string;
  mediaFileName: string;
  templateStatus: string;
  isActive: boolean;
}

export default function BulkCommunicationsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsProgress, setSmsProgress] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await usersApi.getAll();
        setUsers(res.data.users || []);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await whatsappMessageApi.GetTemplates();
        if (response.data && response.data.dataObj) {
          setTemplates(response.data.dataObj);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.program || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const selectedUsers = useMemo(
    () => users.filter(u => selected.has(u.phone)),
    [users, selected]
  );

  const personalizeTemplate = (text: string, user: User) =>
    text
      .replace(/\[Name\]/g, user.name)
      .replace(/\[Program\]/g, user.program || '')
      .replace(/\[Campus\]/g, user.campus || '');

  const toggleOne = (phone: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(phone) ? next.delete(phone) : next.add(phone);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map(u => u.phone));
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);

    if (!templateId) {
      setSmsBody('');
      return;
    }

    const template = templates.find(t => t.id.toString() === templateId);
    if (!template) return;

    const previewUser = selectedUsers[0] || filtered[0];
    const previewText = previewUser
      ? personalizeTemplate(template.msgText, previewUser)
      : template.msgText;

    setSmsBody(previewText);
  };

  const handleSendEmail = () => {
    // TODO: call API to send bulk email
    console.log('Send bulk email to', Array.from(selected), { emailSubject, emailBody });
  };

  const handleSendSms = async () => {
    if (selected.size === 0 || !selectedTemplateId) return;

    const template = templates.find(t => t.id.toString() === selectedTemplateId);
    if (!template) return;

    setSmsSending(true);
    setSmsProgress('Starting bulk send...');

    let success = 0;
    let failed = 0;

    for (const phone of selected) {
      const user = users.find(u => u.phone === phone);
      if (!user) {
        failed += 1;
        continue;
      }

      const personalized = personalizeTemplate(smsBody.trim() || template.msgText, user);
      const phoneNumber = user.phone.replace(/\D/g, '');
      const phoneWithCountryCode = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;

      try {
        setSmsProgress(`Sending to ${user.name} (${phoneWithCountryCode})...`);
        await whatsappMessageApi.SendSingleTemplateMessage(Number(selectedTemplateId), {
          contactNo: phoneWithCountryCode,
          contactName: user.name,
          attributes: {
            Attribute1: personalized,
          },
        });
        success += 1;
      } catch (error) {
        console.error('Error sending message:', error);
        failed += 1;
      }
    }

    setSmsProgress(`Completed: ${success} sent, ${failed} failed`);
    setSmsSending(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Communications"
        subtitle="Send emails and SMS to multiple leads"
        actions={
          <Button variant="outline" onClick={() => navigate('/admin/leads-all')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search by name, email, phone, program"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72"
        />
        <Button variant="outline" size="sm" onClick={toggleAll} disabled={loading || filtered.length === 0}>
          {selected.size === filtered.length && selected.size > 0 ? (
            <CheckSquare className="w-4 h-4 mr-2" />
          ) : (
            <Square className="w-4 h-4 mr-2" />
          )}
          {selected.size === filtered.length && filtered.length > 0 ? 'Unselect all' : 'Select all'}
        </Button>
        <span className="text-sm text-muted-foreground">
          Selected: {selected.size} / {filtered.length}
        </span>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y">
        <div className="grid grid-cols-12 px-4 py-3 text-sm font-medium text-muted-foreground">
          <span className="col-span-1">Pick</span>
          <span className="col-span-3">Name</span>
          <span className="col-span-3">Email</span>
          <span className="col-span-2">Phone</span>
          <span className="col-span-3">Program</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">No leads found.</div>
          ) : (
            filtered.map(u => (
              <div key={u.phone} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                <button
                  className="col-span-1 text-left"
                  onClick={() => toggleOne(u.phone)}
                  aria-label="select lead"
                >
                  {selected.has(u.phone) ? (
                    <CheckSquare className="w-4 h-4 text-blue" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <span className="col-span-3 font-medium">{u.name}</span>
                <span className="col-span-3">{u.email}</span>
                <span className="col-span-2">{u.phone}</span>
                <span className="col-span-3">{u.program?.toUpperCase() || 'N/A'}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <h3 className="font-semibold">Bulk Email</h3>
          </div>
          <Input
            placeholder="Subject"
            value={emailSubject}
            onChange={e => setEmailSubject(e.target.value)}
          />
          <Textarea
            rows={8}
            placeholder="Email body..."
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleSendEmail}
            disabled={selected.size === 0 || !emailSubject.trim() || !emailBody.trim()}
          >
            <Send className="w-4 h-4 mr-2" /> Send Email
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <h3 className="font-semibold">Bulk Whatsapp Message</h3>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message Template</label>
            <select
              value={selectedTemplateId}
              onChange={e => handleTemplateChange(e.target.value)}
              disabled={templatesLoading}
              className="w-full border rounded-lg px-3 py-2 bg-background disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="">{templatesLoading ? 'Loading templates...' : 'Select template'}</option>
              {templates.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id.toString()}>
                  {tmpl.templateName} {tmpl.isActive ? '(Active)' : '(Inactive)'}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            rows={8}
            placeholder="SMS body (160 chars recommended)"
            maxLength={320}
            value={smsBody}
            onChange={e => setSmsBody(e.target.value)}
          />
          <div className="text-xs text-muted-foreground text-right">{smsBody.length}/320</div>
          {smsProgress && (
            <div className="text-xs text-muted-foreground text-right">{smsProgress}</div>
          )}
          <Button
            className="w-full"
            onClick={handleSendSms}
            disabled={selected.size === 0 || !selectedTemplateId || !smsBody.trim() || smsSending}
          >
            <Send className="w-4 h-4 mr-2" /> {smsSending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </div>
  );
}