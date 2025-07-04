import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockApi';
import { Exam } from '../../types';

const StudentExamDates: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            try {
                const examData = await api.getExams();
                setExams(examData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            } catch (error) {
                console.error("Failed to fetch exams:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Exam Schedule</h1>
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative overflow-x-auto">
                    {loading ? <p className="p-4">Loading schedule...</p> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Exam Name</th>
                                <th className="px-6 py-3">Batch</th>
                                <th className="px-6 py-3">Total Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(exam => (
                                <tr key={exam.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-semibold">{new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{exam.name}</th>
                                    <td className="px-6 py-4">{exam.batch}</td>
                                    <td className="px-6 py-4">{exam.totalMarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentExamDates;