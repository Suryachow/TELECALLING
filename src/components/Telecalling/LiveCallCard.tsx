import { useState, useEffect } from "react";
import { Phone, PhoneOff, Pause, Volume2 } from "lucide-react";

export interface LiveCall {
  id: number;
  agent: string;
  customer: string;
  phoneNumber: string;
  status: "active" | "on-hold" | "ended" | string;
  duration: number;
  type: string;
}

const LiveCallCard = ({ call }: { call: LiveCall }) => {
  const [duration, setDuration] = useState(call.duration);

  useEffect(() => {
    if (call.status === "active") {
      const interval = setInterval(() => {
        setDuration((prev: number) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [call.status]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string): string => {
    const statusColorMap: { [key: string]: string } = {
      active: "bg-green-500 animate-pulse",
      "on-hold": "bg-yellow-500",
      ended: "bg-gray-500",
    };
    return statusColorMap[status] || "bg-blue-500";
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`}></div>
          <div>
            <h3 className="font-semibold text-gray-800">{call.agent}</h3>
            <p className="text-sm text-gray-500">{call.customer}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-800">{formatTime(duration)}</p>
          <p className="text-xs text-gray-500 capitalize">{call.status}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span className="flex items-center">
          <Phone className="w-4 h-4 mr-1" />
          {call.phoneNumber}
        </span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {call.type}
        </span>
      </div>
      {call.status === "active" && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <button className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
              <Volume2 className="w-4 h-4 text-blue-600" />
            </button>
            <button className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors">
              <Pause className="w-4 h-4 text-yellow-600" />
            </button>
            <button className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
              <PhoneOff className="w-4 h-4 text-red-600" />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Recording</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCallCard;
