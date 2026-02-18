import { Star, PhoneCall, Phone, PhoneOff, Play, MoreVertical } from "lucide-react";


export interface CallHistory {
  id: number;
  customer: string;
  agent: string;
  phoneNumber: string;
  startTime: string;
  date: string;
  duration: string;
  outcome: string;
  quality: number;
  type: string;
}

export interface CallHistoryRowProps {
  call: CallHistory;
  index: number;
}

const CallHistoryRow = ({ call, index }: CallHistoryRowProps) => {
  const getCallTypeIcon = (type: string): JSX.Element => {
    switch (type) {
      case "inbound":
        return <PhoneCall className="w-4 h-4 text-green-600" />;
      case "outbound":
        return <Phone className="w-4 h-4 text-blue-600" />;
      case "missed":
        return <PhoneOff className="w-4 h-4 text-red-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getQualityColor = (score: number): string => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <tr className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {getCallTypeIcon(call.type)}
          <div>
            <p className="font-medium text-gray-800">{call.customer}</p>
            <p className="text-sm text-gray-500">{call.phoneNumber}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-gray-800">{call.agent}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-800">{call.startTime}</p>
        <p className="text-sm text-gray-500">{call.date}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-gray-800">{call.duration}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${call.outcome === "successful" ? "bg-green-100 text-green-800" : call.outcome === "no-answer" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{call.outcome}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < call.quality ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
            ))}
          </div>
          <span className={`text-sm font-medium ${getQualityColor(call.quality)}`}>{call.quality}/5</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors" title="Play Recording">
            <Play className="w-4 h-4 text-blue-600" />
          </button>
          <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="View Details">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CallHistoryRow;
