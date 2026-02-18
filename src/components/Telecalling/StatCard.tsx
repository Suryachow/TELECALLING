import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  change?: {
    type: "increase" | "decrease";
    value: number;
  };
}

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
        <div className={`flex items-center text-sm ${change.type === "increase" ? "text-green-500" : "text-red-500"}`}>
          <svg className={`w-4 h-4 mr-1 ${change.type === "decrease" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
          {change.value}%
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
    <p className="text-gray-600 font-medium">{title}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

export default StatCard;
