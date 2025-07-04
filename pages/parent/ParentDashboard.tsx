import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { Student } from '../../types';
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


const ParentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [child, setChild] = useState<Student | null>(null);
    const [results, setResults] = useState<StudentResult[]>([]);
    const [attendance, setAttendance] = useState<{present: boolean}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user) {
            const fetchChildData = async () => {
                setLoading(true);
                try {
                    const childData = await api.getChildOfParent(user.id);
                    setChild(childData);
                    if (childData) {
                        const [resultsData, attendanceData] = await Promise.all([
                            api.getStudentResults(childData.id),
                            api.getStudentAttendance(childData.id)
                        ]);
                        setResults(resultsData.filter(r => r.marks !== null).slice(0, 5));
                        setAttendance(attendanceData);
                    }
                } catch(e) {
                    console.error("Failed to fetch child data for parent", e);
                } finally {
                    setLoading(false);
                }
            }
            fetchChildData();
        }
    }, [user]);

    const performanceData = useMemo(() => {
        if (!child) return [];
        return results.map(r => ({
            label: r.examName?.split(' - ')[0] || 'Exam',
            value: r.marks || 0
        })).reverse();
    }, [results, child]);
    
    const attendancePercentage = useMemo(() => {
        if (!child || attendance.length === 0) return 0;
        const presentDays = attendance.filter(a => a.present).length;
        return Math.round((presentDays / attendance.length) * 100);
    }, [attendance, child]);

    if (loading) {
        return <div>Loading your child's dashboard...</div>;
    }
    
    if (!child) {
        return <p>Could not find information for your child. Please contact the administrator.</p>
    }

    return (
         <div className="space-y-6">
            <AISuvicharCard prompt="Give me a short, supportive one-sentence quote for a parent about encouraging their child's education in mathematics." />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <BarChart title={`${child.name}'s Recent Exam Scores`} data={performanceData} />
                </div>
                <CircularProgress title={`${child.name}'s Attendance`} percentage={attendancePercentage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Link to="/parent/report-card" className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto text-green-500">{ICONS.reports}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Child's Report Card</h3>
                 </Link>
                 <Link to="/parent/child-info" className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto text-purple-500">{ICONS.child}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Child's Info</h3>
                 </Link>
                 <Link to="/parent/attendance" className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                    <div className="w-12 h-12 mx-auto text-blue-500">{ICONS.attendance}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Child's Attendance</h3>
                 </Link>
            </div>
        </div>
    );
};

export default ParentDashboard;
