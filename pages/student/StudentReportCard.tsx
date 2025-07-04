import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';

interface StudentResult {
    examId: string;
    studentId: string;
    marks: number | null;
    examName?: string;
    totalMarks?: number;
}

interface StudentReportCardProps {
    studentIdForParent?: string; // Optional prop for parent view
}


const StudentReportCard: React.FC<StudentReportCardProps> = ({ studentIdForParent }) => {
    const { user } = useAuth();
    const [results, setResults] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);

    const studentIdToFetch = studentIdForParent || user?.id;

    useEffect(() => {
        if (studentIdToFetch) {
            const fetchResults = async () => {
                setLoading(true);
                try {
                    const data = await api.getStudentResults(studentIdToFetch);
                    setResults(data);
                } catch (error) {
                    console.error("Failed to fetch student results:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [studentIdToFetch]);
    
    const handlePrint = () => {
        window.print();
    };

    const ReportContent = (
         <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative overflow-x-auto">
                {loading ? <p className="p-4">Loading results...</p> : (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Exam Name</th>
                            <th className="px-6 py-3">Marks Obtained</th>
                            <th className="px-6 py-3">Total Marks</th>
                            <th className="px-6 py-3">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length > 0 ? results.map(r => {
                            const percentage = r.marks !== null && r.totalMarks ? ((r.marks / r.totalMarks) * 100).toFixed(2) : 'N/A';
                            return (
                            <tr key={r.examId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{r.examName || 'N/A'}</th>
                                <td className="px-6 py-4">{r.marks ?? 'Not Graded'}</td>
                                <td className="px-6 py-4">{r.totalMarks || 'N/A'}</td>
                                <td className="px-6 py-4 font-semibold">{percentage}%</td>
                            </tr>
                        )}) : (
                            <tr>
                                <td colSpan={4} className="text-center py-4">No results found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    );

    // If this component is rendered inside the parent's view, it should only return the content.
    // The parent component (`ParentReportCard`) is responsible for the print button and wrapper.
    if (studentIdForParent) {
        return ReportContent;
    }

    // This is the student's direct view, so it includes the full page layout with print functionality.
    return (
        <div>
            <div className="printable-area">
                {!studentIdForParent && <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Report Card</h1>}
                {ReportContent}
            </div>
            <div className="flex justify-end mt-4 no-print">
                 <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Print Report
                </button>
            </div>
        </div>
    );
};

export default StudentReportCard;