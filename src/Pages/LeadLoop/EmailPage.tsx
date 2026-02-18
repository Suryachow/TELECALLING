import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/lib/api';
import { User } from './LeadGeneration';

export default function TEmailPage() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [template, setTemplate] = useState('');

  const emailTemplates = {
    welcome: {
      subject: 'Welcome to Our Institution',
      body: `Dear [Student Name],\n\nThank you for your interest in our programs. We are excited to assist you in your educational journey.\n\nBest regards,\nAdmissions Team`
    },
    followup: {
      subject: 'Follow-up on Your Application',
      body: `Dear [Student Name],\n\nWe wanted to follow up on your recent inquiry about our [Program] program.\n\nPlease let us know if you have any questions.\n\nBest regards,\nAdmissions Team`
    },
    information: {
      subject: 'Program Information - [Program]',
      body: `Dear [Student Name],\n\nThank you for your interest in our [Program] program at [Campus] campus.\n\nPlease find attached detailed information about the program.\n\nBest regards,\nAdmissions Team`
    }
  };

  useEffect(() => {
    fetchUserByPhone();
  }, [phone]);

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

  const handleTemplateChange = (templateKey: string) => {
    setTemplate(templateKey);
    if (templateKey && user) {
      const selectedTemplate = emailTemplates[templateKey as keyof typeof emailTemplates];
      setEmailSubject(
        selectedTemplate.subject
          .replace('[Program]', user.program || '')
      );
      setEmailBody(
        selectedTemplate.body
          .replace(/\[Student Name\]/g, user.name)
          .replace(/\[Program\]/g, user.program || '')
          .replace(/\[Campus\]/g, user.campus || '')
      );
    }
  };

  const handleSendEmail = () => {
    // TODO: Implement API call to send email
    console.log({
      to: user?.email,
      subject: emailSubject,
      body: emailBody,
      timestamp: new Date().toISOString()
    });
    navigate('/admin/leads-all');
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
        title="Send Email"
        subtitle={`Compose email to ${user.name}`}
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
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
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

        {/* Email Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Template</label>
                <select
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                >
                  <option value="">Custom Email</option>
                  <option value="welcome">Welcome Email</option>
                  <option value="followup">Follow-up Email</option>
                  <option value="information">Program Information</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter your email message..."
                  rows={12}
                  className="w-full border rounded-lg px-3 py-2 bg-background resize-none"
                />
              </div>

              <Button onClick={handleSendEmail} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}