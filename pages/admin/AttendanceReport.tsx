import React, { useState } from 'react';
import { Student, Attendance } from '../../types';
import { api } from '../../services/mockApi';
import { APP_NAME } from '../../constants';

type EnrichedStudent = Student & { parentName: string };

interface AttendanceReportProps {
    students: EnrichedStudent[];
    onBack: () => void;
}

interface ReportRow {
    rollNo: string;
    name: string;
    totalDays: number;
    presentDays: number;
    percentage: number;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ students, onBack }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [reportData, setReportData] = useState<ReportRow[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            alert("Please select a valid date range.");
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const studentIds = students.map(s => s.id);
            
            const allAttendance: Record<string, Attendance[]> = {};
            for (const id of studentIds) {
                // This is not the most optimal way, but it works with the current mock API
                allAttendance[id] = await api.getStudentAttendance(id);
            }

            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            // Determine working days from the union of all attendance dates in the period
            const workingDaysSet = new Set<string>();
            Object.values(allAttendance).flat().forEach(att => {
                const attDate = new Date(att.date);
                if (attDate >= start && attDate <= end) {
                    // Store date as YYYY-MM-DD string to ensure uniqueness
                    workingDaysSet.add(att.date.split('T')[0]);
                }
            });
            const totalWorkingDays = workingDaysSet.size;

            if (totalWorkingDays === 0) {
                alert("No attendance data found for any student in the selected period.");
                setLoading(false);
                return;
            }

            const generatedData = students.map(student => {
                const studentAttendance = allAttendance[student.id] || [];
                const presentDays = studentAttendance.filter(att => {
                    const attDate = new Date(att.date);
                    return att.present && attDate >= start && attDate <= end;
                }).length;

                const percentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

                return {
                    rollNo: student.rollNo,
                    name: student.name,
                    totalDays: totalWorkingDays,
                    presentDays,
                    percentage: parseFloat(percentage.toFixed(2)),
                };
            }).sort((a,b) => a.rollNo.localeCompare(b.rollNo));

            setReportData(generatedData);
        } catch (error) {
            console.error("Failed to generate attendance report", error);
            alert("An error occurred while generating the report.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="no-print">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Attendance Report Generator</h1>
                    <div></div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6 flex flex-col md:flex-row justify-center items-center gap-6">
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium mr-2">From:</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="text-sm font-medium mr-2">To:</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <button onClick={handleGenerateReport} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>
            
            {reportData && (
                 <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
                    <div className="flex justify-end mb-4 no-print">
                        <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Report</button>
                    </div>
                    <div className="printable-area">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{APP_NAME}</h1>
                            <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                            <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2">Attendance Report</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Period: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Roll No</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Total Working Days</th>
                                        <th className="px-6 py-3">Days Present</th>
                                        <th className="px-6 py-3">Attendance (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((row) => (
                                        <tr key={row.rollNo} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-6 py-4">{row.rollNo}</td>
                                            <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.name}</th>
                                            <td className="px-6 py-4">{row.totalDays}</td>
                                            <td className="px-6 py-4">{row.presentDays}</td>
                                            <td className="px-6 py-4 font-bold">{row.percentage}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reportData.length === 0 && (
                                <p className="text-center p-4">No data to display for the selected filters and date range.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AttendanceReport;