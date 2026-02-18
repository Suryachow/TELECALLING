import { useState, useEffect } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";
import { Users, TrendingUp, Activity, Clock, Target, Award, AlertCircle } from "lucide-react";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Stat Card Component
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  trend?: number;
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: StatCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
    <p className="text-gray-600 font-medium">{title}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// Chart Card Component
type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

const ChartCard = ({ title, children, className = "" }: ChartCardProps) => (
  <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${className}`}>
    <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
    <div className="h-80">
      {children}
    </div>
  </div>
);

// Employee Card Component
type Employee = {
  id: number;
  name: string;
  attempted: number;
  answered: number;
  notResponded: number;
};

const EmployeeCard = ({ employee, rank }: { employee: Employee; rank: number }) => {
  const successRate = ((employee.answered / employee.attempted) * 100).toFixed(1);
  const numericSuccessRate = Number(successRate);
  const isTopPerformer = rank === 1;
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${isTopPerformer ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white' : 'border-gray-100'} relative`}>
      {isTopPerformer && (
        <div className="absolute -top-2 -right-2">
          <Award className="w-8 h-8 text-yellow-500" />
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-bold text-gray-800">{employee.name}</h3>
          <p className="text-sm text-gray-500">Rank #{rank}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Success Rate</span>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${numericSuccessRate >= 80 ? 'bg-green-500' : numericSuccessRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className="font-bold text-gray-800">{successRate}%</span>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${numericSuccessRate >= 80 ? 'bg-green-500' : numericSuccessRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${successRate}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{employee.attempted}</p>
            <p className="text-xs text-gray-500">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{employee.answered}</p>
            <p className="text-xs text-gray-500">Contacted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{employee.notResponded}</p>
            <p className="text-xs text-gray-500">Missed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export function TeleCallingManagement() {
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    contactableClients: 0,
    nonContactableClients: 0,
    conversionRate: 0,
    avgCallDuration: 0,
    totalCallTime: 0,
  });

  type Employee = {
    id: number;
    name: string;
    attempted: number;
    answered: number;
    notResponded: number;
  };

  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<{ day: string; calls: number; contacts: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // import dashData from "../data/dash.json";
  useEffect(() => {
    fetch('/teleCallingManagement.json')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data.analytics);
        setEmployeeData(data.employeeData);
        setTimeSeriesData(data.timeSeriesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const barChartData = {
    labels: ["Total Leads", "Contacted", "Not Contacted"],
    datasets: [
      {
        label: "Number of Leads",
        data: [analytics.totalClients, analytics.contactableClients, analytics.nonContactableClients],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // const pieChartData = {
  //   labels: ["Contacted", "Not Contacted"],
  //   datasets: [
  //     {
  //       data: [analytics.contactableClients, analytics.nonContactableClients],
  //       backgroundColor: [
  //         "rgba(16, 185, 129, 0.8)",
  //         "rgba(239, 68, 68, 0.8)"
  //       ],
  //       borderColor: [
  //         "rgba(16, 185, 129, 1)",
  //         "rgba(239, 68, 68, 1)"
  //       ],
  //       borderWidth: 3,
  //     },
  //   ],
  // };

  const lineChartData = {
    labels: timeSeriesData.map(d => d.day),
    datasets: [
      {
        label: "Total Calls",
        data: timeSeriesData.map(d => d.calls),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: "Successful Contacts",
        data: timeSeriesData.map(d => d.contacts),
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: employeeData.slice(0, 3).map(emp => emp.name.split(' ')[0]),
    datasets: [
      {
        data: employeeData.slice(0, 3).map(emp => emp.answered),
        backgroundColor: [
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(245, 158, 11, 0.8)"
        ],
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  const overallSuccessRate = ((analytics.contactableClients / analytics.totalClients) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Telecalling Analytics</h1>
          <p className="text-gray-600">Real-time insights into your calling campaign performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={analytics.totalClients.toLocaleString()}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={12.3}
            subtitle="All assigned leads"
          />
          <StatCard
            title="Success Rate"
            value={`${overallSuccessRate}%`}
            icon={Target}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend={5.7}
            subtitle="Contacted vs total"
          />
          <StatCard
            title="Avg Call Duration"
            value={`${analytics.avgCallDuration}min`}
            icon={Clock}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={-2.1}
            subtitle="Per successful call"
          />
          <StatCard
            title="Conversion Rate"
            value={`${analytics.conversionRate}%`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            trend={8.9}
            subtitle="Leads converted"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Lead Distribution Overview">
            <Bar data={barChartData} options={chartOptions} />
          </ChartCard>
          
          {/* <ChartCard title="Contact Success Rate">
            <Pie data={pieChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: { padding: 20, font: { size: 12 } }
                }
              }
            }} />
          </ChartCard> */}
          
          <ChartCard title="Weekly Performance Trend">
            <Line data={lineChartData} options={chartOptions} />
          </ChartCard>
        </div>

        {/* Team Performance Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Team Performance</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Ranked by success rate</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employeeData.map((employee, index) => (
              <EmployeeCard key={employee.id} employee={employee} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Top Performers Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Top 3 Performers" className="lg:col-span-1">
            <Doughnut data={doughnutData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: { padding: 15, font: { size: 11 } }
                }
              }
            }} />
          </ChartCard>
          
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Strong Performance</p>
                  <p className="text-sm text-gray-600">Team achieved {overallSuccessRate}% contact rate, exceeding the 65% target</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Top Performer</p>
                  <p className="text-sm text-gray-600">{employeeData[0]?.name} leads with {((employeeData[0]?.answered / employeeData[0]?.attempted) * 100).toFixed(1)}% success rate</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Improvement Area</p>
                  <p className="text-sm text-gray-600">Focus on reducing non-contactable leads through better timing and follow-up strategies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}