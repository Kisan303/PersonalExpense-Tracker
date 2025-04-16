import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/format';

interface PieChartProps {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

// Color palette for categories
const COLORS = [
  '#6366f1', // Indigo (Primary)
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#64748b', // Slate
];

export default function PieChart({ categories }: PieChartProps) {
  // Skip rendering if no data
  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-slate-50">
        <p className="text-slate-500">No expense data to display</p>
      </div>
    );
  }

  // Format data for the pie chart
  const data = categories.map((category) => ({
    name: category.name,
    value: category.amount,
    percentage: category.percentage,
  }));

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-600">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Render the pie chart with beautiful colors and animations
  return (
    <div className="w-full h-72 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            labelLine={false}
            animationDuration={800}
            animationBegin={200}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="white"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}