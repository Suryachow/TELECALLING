import { useState, useEffect, useRef } from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import {
  MessageSquare,
  Mail,
  MessageCircle,
  Send,
  Clock,
  Activity,
  Eye,
  Check,
  CheckCheck,
  X,
  Search,
  Download,
  Calendar,
  MoreVertical,
  Smartphone,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
} from "lucide-react";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Live Message Card Component
type LiveMessage = {
  id: number;
  recipient: string;
  channel: string;
  content: string;
  status: string;
  timestamp: Date;
  campaign: string;
  agent: string;
  opens?: number;
  clicks?: number;
};

const LiveMessageCard = ({ message }: { message: LiveMessage }) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "sms":
        return <Smartphone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      case "webchat":
        return <Globe className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  interface ChannelColorMap {
    [key: string]: string;
  }

  const getChannelColor = (channel: string): string => {
    const colorMap: ChannelColorMap = {
      sms: "bg-blue-500",
      email: "bg-red-500",
      whatsapp: "bg-green-500",
      webchat: "bg-purple-500",
    };
    return colorMap[channel] || "bg-gray-500";
  };

  // interface StatusIconProps {
  //   status: string;
  // }

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-green-600" />;
      case "sent":
        return <Check className="w-4 h-4 text-blue-600" />;
      case "failed":
        return <X className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  interface TimeAgo {
    (timestamp: Date | string | number): string;
  }

  const timeAgo: TimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${getChannelColor(
              message.channel
            )} bg-opacity-10`}
          >
            <div
              className={getChannelColor(message.channel).replace(
                "bg-",
                "text-"
              )}
            >
              {getChannelIcon(message.channel)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{message.recipient}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {message.channel} • {message.campaign}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(message.status)}
          <span className="text-xs text-gray-500">
            {timeAgo(message.timestamp)}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {message.opens || 0}
          </span>
          <span className="flex items-center">
            <Target className="w-3 h-3 mr-1" />
            {message.clicks || 0}
          </span>
        </div>
        <span className="font-medium">{message.agent}</span>
      </div>
    </div>
  );
};

// Message History Row Component
type MessageHistory = {
  id: number;
  recipient: string;
  contact: string;
  channel: string;
  subject: string;
  campaign: string;
  timestamp: string;
  status: string;
  opens: number;
  clicks: number;
  agent: string;
};

const MessageHistoryRow = ({
  message,
  index,
  onView,
}: {
  message: MessageHistory;
  index: number;
  onView: () => void;
}) => {
  const getChannelBadge = (channel: string) => {
    const colors = {
      sms: "bg-blue-100 text-blue-800",
      email: "bg-red-100 text-red-800",
      whatsapp: "bg-green-100 text-green-800",
      webchat: "bg-purple-100 text-purple-800",
    };
    return (
      colors[channel as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  interface StatusColorMap {
    [key: string]: string;
  }

  interface GetStatusBadge {
    (status: string): string;
  }

  const getStatusBadge: GetStatusBadge = (status) => {
    const colors: StatusColorMap = {
      delivered: "bg-green-100 text-green-800",
      sent: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // interface EngagementRateParams {
  //   opens: number;
  //   clicks: number;
  //   total?: number;
  // }

  const getEngagementRate = (
    opens: number,
    clicks: number,
    total: number = 1
  ): string => {
    return (((opens + clicks) / total) * 100).toFixed(1);
  };

  return (
    <tr
      className={`${
        index % 2 === 0 ? "bg-gray-50" : "bg-white"
      } hover:bg-blue-50 transition-colors`}
    >
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-800">{message.recipient}</p>
          <p className="text-sm text-gray-500">{message.contact}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChannelBadge(
            message.channel
          )}`}
        >
          {message.channel.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-800 max-w-xs truncate">
          {message.subject}
        </p>
        <p className="text-xs text-gray-500 mt-1">{message.campaign}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-800">{message.timestamp}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
            message.status
          )}`}
        >
          {message.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center text-blue-600">
            <Eye className="w-3 h-3 mr-1" />
            {message.opens}
          </span>
          <span className="flex items-center text-green-600">
            <Target className="w-3 h-3 mr-1" />
            {message.clicks}
          </span>
          <span className="text-gray-500">
            {getEngagementRate(message.opens, message.clicks)}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-800 font-medium">{message.agent}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            title="View Message"
            onClick={onView}
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Stat Card Component
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  change?: {
    type: "increase" | "decrease";
    value: number;
  };
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  change,
}: StatCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div
          className={`flex items-center text-sm ${
            change.type === "increase" ? "text-green-500" : "text-red-500"
          }`}
        >
          {change.type === "increase" ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          {change.value}%
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
    <p className="text-gray-600 font-medium">{title}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// Campaign Performance Card
type Campaign = {
  id: number;
  name: string;
  type: string;
  status: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const deliveryRate = ((campaign.delivered / campaign.sent) * 100).toFixed(1);
  const engagementRate = (
    ((campaign.opens + campaign.clicks) / campaign.delivered) *
    100
  ).toFixed(1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{campaign.name}</h3>
          <p className="text-sm text-gray-500">
            {campaign.type} • {campaign.status}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            campaign.status === "active"
              ? "bg-green-100 text-green-800"
              : campaign.status === "completed"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {campaign.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {campaign.sent.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Messages Sent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{deliveryRate}%</p>
          <p className="text-xs text-gray-500">Delivery Rate</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Opens</span>
          <span className="font-medium">{campaign.opens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Clicks</span>
          <span className="font-medium">
            {campaign.clicks.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-gray-600 font-medium">Engagement</span>
          <span className="font-bold text-purple-600">{engagementRate}%</span>
        </div>
      </div>
    </div>
  );
};

export function Message() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentMessages, setRecentMessages] = useState<LiveMessage[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  type Analytics = {
    totalMessages: number;
    delivered: number;
    opens: number;
    clicks: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    engagementRate: number;
    activeCampaigns: number;
    totalAgents: number;
  };

  const [analytics, setAnalytics] = useState<Analytics>({
    totalMessages: 0,
    delivered: 0,
    opens: 0,
    clicks: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    engagementRate: 0,
    activeCampaigns: 0,
    totalAgents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "",
    status: "active",
    sent: 0,
    delivered: 0,
    opens: 0,
    clicks: 0,
  });
  const campaignNameRef = useRef<HTMLInputElement>(null);
  const [viewMessage, setViewMessage] = useState<MessageHistory | null>(null);

  useEffect(() => {
    fetch('/messageMonitoring.json')
      .then(res => res.json())
      .then(data => {
        setRecentMessages(
          data.recentMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        );
        setMessageHistory(data.messageHistory);
        setCampaigns(data.campaigns);
        setAnalytics(data.analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Export message history to Excel
  const exportMessagesToExcel = () => {
    const worksheetData = messageHistory.map(msg => ({
      Recipient: msg.recipient,
      Contact: msg.contact,
      Channel: msg.channel,
      Subject: msg.subject,
      Campaign: msg.campaign,
      Time: msg.timestamp,
      Status: msg.status,
      Opens: msg.opens,
      Clicks: msg.clicks,
      Agent: msg.agent,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MessageHistory");
    XLSX.writeFile(workbook, "message-history.xlsx");
  };

  // Handle campaign modal open
  const openCampaignModal = () => {
    setShowCampaignModal(true);
    setTimeout(() => campaignNameRef.current?.focus(), 100);
  };

  // Handle campaign modal close
  const closeCampaignModal = () => {
    setShowCampaignModal(false);
    setNewCampaign({
      name: "",
      type: "",
      status: "active",
      sent: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
    });
  };

  // Handle campaign creation
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setCampaigns(prev => [
      {
        id: Date.now(),
        ...newCampaign,
        sent: Number(newCampaign.sent),
        delivered: Number(newCampaign.delivered),
        opens: Number(newCampaign.opens),
        clicks: Number(newCampaign.clicks),
      },
      ...prev,
    ]);
    closeCampaignModal();
  };

  // Chart data
  const messageVolumeData = {
    labels: ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"],
    datasets: [
      {
        label: "SMS",
        data: [120, 180, 150, 200, 190, 220, 180, 160],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Email",
        data: [200, 250, 220, 300, 280, 320, 290, 260],
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "WhatsApp",
        data: [80, 110, 95, 130, 120, 140, 125, 115],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const channelDistributionData = {
    labels: ["SMS", "Email", "WhatsApp", "Web Chat"],
    datasets: [
      {
        data: [35, 40, 20, 5],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const deliveryStatusData = {
    labels: ["Delivered", "Pending", "Failed"],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  };

  const engagementTrendsData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Open Rate %",
        data: [38.5, 42.1, 39.8, 45.2, 41.7, 35.9, 33.2],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 6,
        maxBarThickness: 40,
      },
      {
        label: "Click Rate %",
        data: [7.2, 8.9, 7.8, 9.5, 8.1, 6.4, 5.8],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 20, font: { size: 12 } },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(0,0,0,0.05)" } },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Loading Message Analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Message Monitoring
              </h1>
              <p className="text-gray-600">
                Track SMS, email, and chat communications across all channels
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                onClick={exportMessagesToExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "campaigns", label: "Campaigns", icon: Zap },
                {
                  id: "history",
                  label: "Message History",
                  icon: MessageSquare,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Messages"
                value={analytics.totalMessages.toLocaleString()}
                icon={Send}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                change={{ type: "increase", value: 15.3 }}
              />
              <StatCard
                title="Delivery Rate"
                value={`${analytics.deliveryRate}%`}
                icon={CheckCheck}
                color="bg-gradient-to-br from-green-500 to-green-600"
                change={{ type: "increase", value: 2.1 }}
              />
              <StatCard
                title="Open Rate"
                value={`${analytics.openRate}%`}
                icon={Eye}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                change={{ type: "increase", value: 5.7 }}
              />
              <StatCard
                title="Click Rate"
                value={`${analytics.clickRate}%`}
                icon={Target}
                color="bg-gradient-to-br from-orange-500 to-orange-600"
                change={{ type: "decrease", value: 1.2 }}
              />
              <StatCard
                title="Active Campaigns"
                value={analytics.activeCampaigns}
                icon={Zap}
                color="bg-gradient-to-br from-pink-500 to-pink-600"
                subtitle="6 running"
              />
            </div>

            {/* Recent Messages */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Recent Messages
                </h2>
                <div className="flex items-center space-x-2 text-purple-600">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Live Updates</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentMessages.map((message) => (
                  <LiveMessageCard key={message.id} message={message} />
                ))}
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Message Volume by Channel
                </h3>
                <div className="h-80">
                  <Line data={messageVolumeData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Channel Distribution
                </h3>
                <div className="h-80">
                  <Pie
                    data={channelDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { padding: 15, font: { size: 11 } },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Delivery Status
                </h3>
                <div className="h-80">
                  <Doughnut
                    data={deliveryStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { padding: 15, font: { size: 11 } },
                        },
                      },
                      cutout: "60%",
                    }}
                  />
                </div>
              </div>

              <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Engagement Trends (Weekly)
                </h3>
                <div className="h-80">
                  <Bar data={engagementTrendsData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Active Campaigns
              </h2>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                onClick={openCampaignModal}
              >
                Create Campaign
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        )}

        {/* Message History Tab */}
        {activeTab === "history" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-gray-800">
                Message History
              </h2>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <div>
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Channels</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="webchat">Web Chat</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-lg border border-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Recipient",
                      "Channel",
                      "Subject",
                      "Time",
                      "Status",
                      "Engagement",
                      "Agent",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messageHistory
                    .filter(
                      (msg) =>
                        activeFilter === "all" || msg.channel === activeFilter
                    )
                    .filter(
                      (msg) =>
                        msg.recipient
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        msg.subject
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        msg.campaign
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((message, index) => (
                      <MessageHistoryRow
                        key={message.id}
                        message={message}
                        index={index}
                        onView={() => setViewMessage(message)}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaign Creation Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <h2 className="text-lg font-bold mb-4">Create Campaign</h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    ref={campaignNameRef}
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={newCampaign.name}
                    onChange={(e) =>
                      setNewCampaign((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={newCampaign.type}
                    onChange={(e) =>
                      setNewCampaign((f) => ({ ...f, type: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={newCampaign.status}
                    onChange={(e) =>
                      setNewCampaign((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sent
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={newCampaign.sent}
                      onChange={(e) =>
                        setNewCampaign((f) => ({ ...f, sent: Number(e.target.value) }))
                      }
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivered
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={newCampaign.delivered}
                      onChange={(e) =>
                        setNewCampaign((f) => ({ ...f, delivered: Number(e.target.value) }))
                      }
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Opens
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={newCampaign.opens}
                      onChange={(e) =>
                        setNewCampaign((f) => ({ ...f, opens: Number(e.target.value) }))
                      }
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Clicks
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={newCampaign.clicks}
                      onChange={(e) =>
                        setNewCampaign((f) => ({ ...f, clicks: Number(e.target.value) }))
                      }
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={closeCampaignModal}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Create
                  </button>
                </div>
              </form>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={closeCampaignModal}
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* View Message Modal */}
        {viewMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Message Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Recipient: </span>
                  <span>{viewMessage.recipient}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Contact: </span>
                  <span>{viewMessage.contact}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Channel: </span>
                  <span>{viewMessage.channel}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Subject: </span>
                  <span>{viewMessage.subject}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Campaign: </span>
                  <span>{viewMessage.campaign}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Time: </span>
                  <span>{viewMessage.timestamp}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status: </span>
                  <span>{viewMessage.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Opens: </span>
                  <span>{viewMessage.opens}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Clicks: </span>
                  <span>{viewMessage.clicks}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Agent: </span>
                  <span>{viewMessage.agent}</span>
                </div>
              </div>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setViewMessage(null)}
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;