import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import AISuvicharCard from '../../components/AISuvicharCard';
import BarChart from '../../components/BarChart';
import CircularProgress from '../../components/CircularProgress';
import { Link } from 'react-router-dom';
import { ICONS } from '../../constants';

interface StudentResult {
    examId: string;
    studentId: string;
    marks: number | null;
    examName?: string;
    totalMarks?: number;
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [results, setResults] = useState<StudentResult[]>([]);
    const [attendance, setAttendance] = useState<{present: boolean}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [resultsData, attendanceData] = await Promise.all([
                        api.getStudentResults(user.id),
                        api.getStudentAttendance(user.id)
                    ]);
                    setResults(resultsData.filter(r => r.marks !== null).slice(0, 5)); // Take latest 5 scored exams
                    setAttendance(attendanceData);
                } catch (error) {
                    console.error("Failed to fetch student dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const performanceData = useMemo(() => {
        return results.map(r => ({
            label: r.examName?.split(' - ')[0] || 'Exam', // Shorten name
            value: r.marks || 0
        })).reverse(); // show most recent first
    }, [results]);
    
    const attendancePercentage = useMemo(() => {
        if(attendance.length === 0) return 0;
        const presentDays = attendance.filter(a => a.present).length;
        return Math.round((presentDays / attendance.length) * 100);
    }, [attendance]);
    
    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <AISuvicharCard prompt="Give me a short, inspiring one-sentence quote about learning mathematics for a student." />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <BarChart title="My Recent Exam Scores" data={performanceData} />
                </div>
                <CircularProgress title="My Attendance" percentage={attendancePercentage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Link to="/student/report-card" className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto text-green-500">{ICONS.reports}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Full Report Card</h3>
                 </Link>
                 <Link to="/student/exam-dates" className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto text-yellow-500">{ICONS.exams}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Exam Schedule</h3>
                 </Link>
                 <Link to="/student/attendance" className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto text-blue-500">{ICONS.attendance}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">View Attendance</h3>
                 </Link>
            </div>
        </div>
    );
};

export default StudentDashboard;
