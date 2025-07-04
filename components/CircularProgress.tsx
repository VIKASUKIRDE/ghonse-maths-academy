import React from 'react';

interface CircularProgressProps {
    percentage: number;
    title: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, title }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">{title}</h3>
            <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                    <circle
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="64"
                        cy="64"
                    />
                    <circle
                        className="text-indigo-500"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="64"
                        cy="64"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                </svg>
                <span className="absolute text-2xl font-bold text-slate-700 dark:text-slate-200">{`${percentage}%`}</span>
            </div>
        </div>
    );
};

export default CircularProgress;
