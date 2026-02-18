import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, Save, Clock, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/lib/api';
import { User } from './LeadGeneration';

export default function TCallPage() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [expandedScript, setExpandedScript] = useState<number | null>(null);

  const callScripts = [
    {
      id: 1,
      title: 'Introduction',
      script: `"Hello ${user?.name || '[Student Name]'}, this is [Your Name] from [Institution Name]. I hope you are doing well. I'm calling regarding your interest in our ${user?.program?.toUpperCase() || '[Program]'} program. Do you have a few minutes to talk?"`
    },
    {
      id: 2,
      title: 'Program Overview',
      script: `"Our ${user?.program?.toUpperCase() || '[Program]'} program at ${user?.campus || '[Campus]'} is designed to provide you with industry-relevant skills and knowledge. It includes both theoretical and practical training. Are you interested in learning more about the program structure and career opportunities?"`
    },
    {
      id: 3,
      title: 'Key Benefits',
      script: `"Some key benefits of our program include: industry-experienced faculty, flexible learning options, placement assistance, and alumni network support. We also offer scholarships for deserving students. Would you like to know more about any specific aspect?"`
    },
    {
      id: 4,
      title: 'Address Concerns',
      script: `"I understand you might have questions or concerns. Please feel free to share them. Common concerns students have are about duration, fees, or job prospects after graduation. What would you like to know more about?"`
    },
    {
      id: 5,
      title: 'Call to Action',
      script: `"Based on our conversation, I believe you would be a great fit for this program. Would you like to proceed with the application? We can also schedule a campus visit or connect you with our academic advisor for more detailed information."`
    },
    {
      id: 6,
      title: 'Closing',
      script: `"Thank you for taking the time to speak with me today. We will send you the application link and further details to your email ${user?.email || '[email]'}. Feel free to reach out if you have any questions. Looking forward to having you as part of our institution!"`
    }
  ];

  useEffect(() => {
    fetchUserByPhone();
  }, [phone]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    setExpandedScript(0); // Auto-expand first script
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  const handleSaveCall = () => {
    // TODO: Implement API call to save call details
    console.log({
      phone,
      duration: callDuration,
      notes: callNotes,
      outcome: callOutcome,
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
        title="Call Student"
        subtitle={`Contact ${user.name}`}
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
          <h3 className="text-lg font-semibold mb-4">Student Information</h3>
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
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Program</p>
              <p className="font-medium">{user.program?.toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-medium">{user.specialization?.toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Campus</p>
              <p className="font-medium">{user.campus}</p>
            </div>
          </div>
        </div>

        {/* Call Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Controls */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue/10">
                <Phone className={`w-10 h-10 ${isCallActive ? 'text-green-600' : 'text-blue'}`} />
              </div>
              
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Clock className="w-6 h-6" />
                {formatDuration(callDuration)}
              </div>

              <div className="flex gap-3 justify-center">
                {!isCallActive ? (
                  <Button onClick={handleStartCall} className="bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Start Call
                  </Button>
                ) : (
                  <Button onClick={handleEndCall} variant="destructive">
                    <Phone className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Call Script */}
          {isCallActive && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue" />
                <h3 className="text-lg font-semibold">Call Script Guide</h3>
              </div>
              <div className="space-y-3">
                {callScripts.map((scriptItem, index) => (
                  <div key={scriptItem.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedScript(expandedScript === index ? null : index)}
                      className="w-full px-4 py-3 bg-muted/50 hover:bg-muted flex items-center justify-between"
                    >
                      <span className="font-medium text-left">
                        {index + 1}. {scriptItem.title}
                      </span>
                      {expandedScript === index ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedScript === index && (
                      <div className="px-4 py-3 bg-background border-t">
                        <p className="text-sm leading-relaxed italic text-muted-foreground">
                          {scriptItem.script}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Tip: Personalize the script based on the conversation. Listen actively and adapt your approach to the student's responses.
              </p>
            </div>
          )}

          {/* Call Outcome */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Call Outcome</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Outcome</label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                >
                  <option value="">Select outcome</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="follow_up">Follow Up Required</option>
                  <option value="callback">Callback Requested</option>
                  <option value="no_answer">No Answer</option>
                  <option value="wrong_number">Wrong Number</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Call Notes</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Enter your notes about the call..."
                  rows={6}
                  className="w-full border rounded-lg px-3 py-2 bg-background resize-none"
                />
              </div>

              <Button onClick={handleSaveCall} className="w-full" disabled={!callOutcome}>
                <Save className="w-4 h-4 mr-2" />
                Save Call Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}