import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const colors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">{title}</h3>
      <div className="flex space-x-4 h-64 items-end">
        {data.map((item, index) => (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.value}</div>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: colors[index % colors.length]
              }}
              title={`${item.label}: ${item.value}`}
            ></div>
            <div className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
