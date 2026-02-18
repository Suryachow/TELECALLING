import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import FilterBar from './FilterBar';

const MessageMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [channelFilter, setChannelFilter] = useState('all');

  const messageData = [
    {
      id: '1',
      telecaller: 'John Smith',
      leadName: 'Alice Johnson',
      leadCompany: 'TechCorp Inc.',
      channel: 'WhatsApp',
      message: 'Hi Alice, following up on our call yesterday. I\'ve prepared the proposal as discussed.',
      timestamp: '2024-01-15 14:30',
      status: 'delivered',
      responseTime: '2 hours',
      response: 'Thanks John! Looking forward to reviewing it with my team.'
    },
    {
      id: '2',
      telecaller: 'Sarah Davis',
      leadName: 'Bob Wilson',
      leadCompany: 'StartupXYZ',
      channel: 'SMS',
      message: 'Hi Bob, quick reminder about our scheduled demo tomorrow at 2 PM. Shall we confirm?',
      timestamp: '2024-01-15 10:15',
      status: 'read',
      responseTime: '45 minutes',
      response: 'Yes, confirmed for 2 PM. Thanks for the reminder.'
    },
    {
      id: '3',
      telecaller: 'Mike Johnson',
      leadName: 'Carol Brown',
      leadCompany: 'Enterprise Solutions',
      channel: 'WhatsApp',
      message: 'Hello Carol, thank you for your interest in our enterprise solution. I\'d love to schedule a detailed discussion.',
      timestamp: '2024-01-15 09:00',
      status: 'sent',
      responseTime: '-',
      response: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'SMS': return <Smartphone className="w-4 h-4 text-blue-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResponseTimeColor = (responseTime: string) => {
    if (responseTime === '-') return 'text-gray-500';
    const time = responseTime.toLowerCase();
    if (time.includes('minute') || time.includes('hour')) {
      const value = parseInt(time);
      if (time.includes('minute') && value <= 30) return 'text-green-600';
      if (time.includes('hour') && value <= 2) return 'text-green-600';
      if (time.includes('hour') && value <= 6) return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Message Monitoring</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>All channels connected</span>
        </div>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Messages Sent</p>
              <p className="text-2xl font-bold text-gray-900">248</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">78.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">1.2h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Follow-ups Due</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        additionalFilters={
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
        }
      />

      {/* Message Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {messageData.map((message) => (
            <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {message.telecaller.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{message.telecaller}</h4>
                      <span className="text-sm text-gray-500">→</span>
                      <span className="text-sm text-gray-900">{message.leadName}</span>
                      <span className="text-sm text-gray-500">({message.leadCompany})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(message.channel)}
                      <span className="text-sm text-gray-600">{message.timestamp}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>

                  {message.response && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3 ml-4">
                      <p className="text-sm text-gray-700">{message.response}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs ${getResponseTimeColor(message.responseTime)}`}>
                          {message.responseTime === '-' ? 'No response yet' : `Response: ${message.responseTime}`}
                        </span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
                      View Conversation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageMonitoring;