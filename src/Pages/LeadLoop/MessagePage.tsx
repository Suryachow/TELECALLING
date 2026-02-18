import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { usersApi, whatsappMessageApi } from '@/lib/api';
import { User } from './LeadGeneration';

interface MessageTemplate {
  id: number;
  templateName: string;
  mediaType: string;
  msgText: string;
  mediaFileName: string;
  templateStatus: string;
  isActive: boolean;
}

export default function TMessagePage() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  useEffect(() => {
    fetchUserByPhone();
    fetchTemplates();
  }, [phone]);

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

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const fetchUserByPhone = async () => {
    try {
      const response = await usersApi.getAll();
      const foundUser = response.data.users.find((u: User) => u.phone === phone);
      setUser(foundUser || null);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId && user) {
      const selectedTemplate = templates.find(t => t.id.toString() === templateId);
      if (selectedTemplate) {
        setMessage(
          selectedTemplate.msgText
            .replace(/\[Name\]/g, user.name)
            .replace(/\[Program\]/g, user.program || '')
            .replace(/\[Campus\]/g, user.campus || '')
        );
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTemplateId || !user) return;
    setSending(true);
    const phoneNumber = user.phone.replace(/\D/g, '');
    const phoneWithCountryCode = phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber;
    try {
      await whatsappMessageApi.SendSingleTemplateMessage(Number(selectedTemplateId), {
        contactNo: phoneWithCountryCode,
        contactName: user.name,
        attributes: {
          Attribute1: message,
        },
      });
      navigate('/admin/leads-all');
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Message"
        subtitle={`Send SMS to ${user.name}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/admin/leads-all')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Program</p>
              <p className="font-medium">{user.program?.toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Campus</p>
              <p className="font-medium">{user.campus}</p>
            </div>
          </div>
        </div>

        {/* Message Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Message Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  disabled={templatesLoading}
                  className="w-full border rounded-lg px-3 py-2 bg-background disabled:bg-muted disabled:cursor-not-allowed"
                >
                  <option value="">{templatesLoading ? 'Loading templates...' : 'Custom Message'}</option>
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id.toString()}>
                      {tmpl.templateName} {tmpl.isActive ? '(Active)' : '(Inactive)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <input
                  type="text"
                  value={user.phone}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-muted"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Message</label>
                  <span className={`text-sm ${charCount > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {charCount}/160
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={8}
                  maxLength={160}
                  className="w-full border rounded-lg px-3 py-2 bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  SMS messages are limited to 160 characters
                </p>
              </div>

              <Button onClick={handleSendMessage} className="w-full" disabled={!message.trim() || !selectedTemplateId || sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}