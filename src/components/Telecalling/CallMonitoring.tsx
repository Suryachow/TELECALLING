import { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
  Phone,
  PhoneCall,
  Clock,
  Activity,
  Volume2,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Search,
  Headphones,
  Star,
  Monitor,
  Mic,
  User,
} from "lucide-react";
import LiveCallCard, { LiveCall } from "./LiveCallCard";
import CallHistoryRow, { CallHistory } from "./CallHistoryRow";
import StatCard from "./StatCard";

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

export function CallMonitoring() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  interface Analytics {
    totalCalls: number;
    activeCalls: number;
    avgCallDuration: number;
    callQuality: number;
    successRate: number;
    totalAgents: number;
  }

  const [analytics, setAnalytics] = useState<Analytics>({
    totalCalls: 0,
    activeCalls: 0,
    avgCallDuration: 0,
    callQuality: 0,
    successRate: 0,
    totalAgents: 0,
  });
  const [callVolumeData, setCallVolumeData] = useState<any>(null);
  const [callOutcomeData, setCallOutcomeData] = useState<any>(null);
  const [agentPerformanceData, setAgentPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<string | null>("1");
  const [callsTab, setCallsTab] = useState<'live' | 'active'>('live');

  // Demo data for Active Calls
  const activeCalls = [
    {
      id: "1",
      callerName: "John Smith",
      leadName: "Alice Johnson",
      leadCompany: "TechCorp Inc.",
      duration: "05:23",
      status: "in-progress",
      quality: 8.5,
      script: "Enterprise Sales Script",
    },
    {
      id: "2",
      callerName: "Sarah Davis",
      leadName: "Bob Wilson",
      leadCompany: "StartupXYZ",
      duration: "12:45",
      status: "in-progress",
      quality: 9.2,
      script: "SMB Sales Script",
    },
    {
      id: "3",
      callerName: "Mike Johnson",
      leadName: "Carol Brown",
      leadCompany: "Enterprise Solutions",
      duration: "08:12",
      status: "on-hold",
      quality: 7.8,
      script: "Enterprise Sales Script",
    },
  ];

  useEffect(() => {
    fetch("/callMonitoring.json")
      .then((res) => res.json())
      .then((data) => {
        setLiveCalls(data.liveCalls);
        setCallHistory(data.callHistory);
        setAnalytics(data.analytics);
        setCallVolumeData(data.callVolumeData);
        setCallOutcomeData(data.callOutcomeData);
        setAgentPerformanceData(data.agentPerformanceData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Chart data
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Loading Call Monitoring...
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 9) return "text-green-600";
    if (quality >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  // Find selected call in the correct list based on tab
  const selectedCallData = callsTab === 'active'
    ? activeCalls.find((call) => call.id === selectedCall)
    : liveCalls.find((call) => String(call.id) === selectedCall);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Call Monitoring
              </h1>
              <p className="text-gray-600">
                Real-time call tracking and performance analytics
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {analytics &&
          typeof analytics.totalCalls !== "undefined" &&
          typeof analytics.activeCalls !== "undefined" &&
          typeof analytics.avgCallDuration !== "undefined" &&
          typeof analytics.successRate !== "undefined" &&
          typeof analytics.totalAgents !== "undefined" ? (
            <>
              <StatCard
                title="Total Calls Today"
                value={analytics.totalCalls}
                icon={PhoneCall}
                color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                change={{ type: "increase", value: 12.5 }}
              />
              <StatCard
                title="Active Calls"
                value={analytics.activeCalls}
                icon={Activity}
                color="bg-gradient-to-br from-green-500 to-green-600"
                subtitle="Live now"
              />
              <StatCard
                title="Avg Call Duration"
                value={`${analytics.avgCallDuration}min`}
                icon={Clock}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                change={{ type: "decrease", value: 5.2 }}
              />
              {/* <StatCard
                title="Call Quality"
                value={`${analytics.callQuality}/5`}
                icon={Star}
                color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                change={{ type: 'increase', value: 8.1 }}
              /> */}
              <StatCard
                title="Success Rate"
                value={`${analytics.successRate}%`}
                icon={CheckCircle}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                change={{ type: "increase", value: 3.4 }}
              />
              <StatCard
                title="Active Agents"
                value={analytics.totalAgents}
                icon={Headphones}
                color="bg-gradient-to-br from-teal-500 to-teal-600"
                subtitle="8 online"
              />
            </>
          ) : (
            <div className="col-span-full text-center text-gray-400">
              Loading analytics...
            </div>
          )}
        </div>

        {/* Combined Live/Active Calls Section with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${callsTab === 'live' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setCallsTab('live')}
              >
                Live Calls
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${callsTab === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setCallsTab('active')}
              >
                Active Calls
              </button>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {callsTab === 'live'
                  ? `${liveCalls.filter(call => call.status === 'active').length} Active`
                  : `${activeCalls.length} Active`}
              </span>
            </div>
          </div>
          {callsTab === 'live' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveCalls.map(call => (
                <LiveCallCard key={call.id} call={call} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Calls List and Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Active Calls ({activeCalls.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {activeCalls.map((call) => (
                      <div
                        key={call.id}
                        onClick={() => setSelectedCall(call.id)}
                        className={`p-4 cursor-pointer transition-colors duration-200 ${
                          selectedCall === call.id
                            ? 'bg-blue-50 border-r-2 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{call.callerName}</h4>
                            <p className="text-sm text-gray-600">{call.leadName}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>{call.status}</span>
                          <span className="text-sm text-gray-600">{call.duration}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className={`w-3 h-3 ${getQualityColor(call.quality)}`} />
                            <span className={`text-xs ${getQualityColor(call.quality)}`}>{call.quality}/10</span>
                          </div>
                          <span className="text-xs text-gray-500">{call.script}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Call Details & Monitoring */}
              <div className="lg:col-span-2 space-y-6">
                {selectedCallData ? (
                  <>
                    {/* Call Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {callsTab === 'active'
                              ? `${(selectedCallData as typeof activeCalls[number]).callerName} → ${(selectedCallData as typeof activeCalls[number]).leadName}`
                              : `${(selectedCallData as LiveCall).agent} → ${(selectedCallData as LiveCall).customer}`}
                          </h3>
                          <p className="text-gray-600">
                            {"leadCompany" in selectedCallData
                              ? selectedCallData.leadCompany
                              : "phoneNumber" in selectedCallData
                              ? selectedCallData.phoneNumber
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCallData.status)}`}>{selectedCallData.status}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">{selectedCallData.duration}</p>
                          </div>
                        </div>
                        {callsTab === 'active' ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <Star className={`w-5 h-5 ${getQualityColor('quality' in selectedCallData ? selectedCallData.quality : 0)}`} />
                              <div>
                                <p className="text-sm text-gray-600">Quality Score</p>
                                <p className={`font-semibold ${"quality" in selectedCallData ? getQualityColor(selectedCallData.quality) : ""}`}>
                                  {"quality" in selectedCallData ? `${selectedCallData.quality}/10` : "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Script</p>
                                <p className="font-semibold text-gray-900">
                                  {"script" in selectedCallData ? selectedCallData.script : ""}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Type</p>
                              <p className="font-semibold text-gray-900">
                                {"type" in selectedCallData ? selectedCallData.type : ""}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Live Monitoring Controls */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Live Monitoring Controls</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Audio Controls</h5>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <button className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-200">
                                <Volume2 className="w-5 h-5 text-green-600" />
                              </button>
                              <span className="text-sm text-gray-700">Listen to call</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200">
                                <Mic className="w-5 h-5 text-blue-600" />
                              </button>
                              <span className="text-sm text-gray-700">Whisper to agent</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Call Quality Metrics</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Talk Time</span>
                              <span className="text-sm font-medium text-gray-900">65%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Script Adherence</span>
                              <span className="text-sm font-medium text-gray-900">85%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Customer Engagement</span>
                              <span className="text-sm font-medium text-gray-900">High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Real-time Notes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Supervisor Notes</h4>
                      <textarea
                        rows={4}
                        placeholder="Add real-time observations about the call..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="mt-3 flex justify-end">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Select a call to start monitoring</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {callVolumeData && (
            <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Call Volume Today
              </h3>
              <div className="h-80">
                <Line data={callVolumeData} options={chartOptions} />
              </div>
            </div>
          )}
          {callOutcomeData && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Call Outcomes
              </h3>
              <div className="h-80">
                <Doughnut
                  data={callOutcomeData}
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
          )}
          {agentPerformanceData && (
            <div className="xl:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Agent Performance Today
              </h3>
              <div className="h-80">
                <Bar data={agentPerformanceData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Call History */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Call History</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search calls..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              {["all", "successful", "no-answer", "dropped"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() +
                    filter.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {callHistory.map((call, index) => (
                  <CallHistoryRow key={call.id} call={call} index={index} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 5 of 156 calls</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}