import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { Student, Gender } from '../../types';
import AISuvicharCard from '../../components/AISuvicharCard';
import BarChart from '../../components/BarChart';
import StatCard from '../../components/StatCard';
import { ICONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.currentBatch) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const studentData = await api.getStudentsByBatch(user.currentBatch!);
                setStudents(studentData);
            } catch (error) {
                console.error("Failed to fetch admin dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.currentBatch]);
    
    const genderDistribution = useMemo(() => {
        if (!students.length) return [];
        const counts = students.reduce((acc, student) => {
            acc[student.gender] = (acc[student.gender] || 0) + 1;
            return acc;
        }, {} as Record<Gender, number>);
        
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [students]);
    
    const feeSummary = useMemo(() => {
        if (!students.length) return { collected: 0, pending: 0, overdue: 0 };
        return students.reduce((acc, s) => {
            acc.collected += s.fees.collected;
            acc.pending += s.fees.pending;
            acc.overdue += s.fees.overdue;
            return acc;
        }, { collected: 0, pending: 0, overdue: 0 });
    }, [students]);
    
    const feeChartData = [
        { label: 'Collected', value: feeSummary.collected },
        { label: 'Pending', value: feeSummary.pending },
        { label: 'Overdue', value: feeSummary.overdue },
    ];

    if (loading) {
        return <div>Loading dashboard for {user?.currentBatch}...</div>
    }

    return (
        <div className="space-y-6">
            <AISuvicharCard prompt="Give me a short, inspiring one-sentence thought for a busy administrator at a maths academy, focusing on leadership and education." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard title="Total Students (Batch)" value={students.length} icon={ICONS.users} color="bg-blue-500 text-white" />
                 <StatCard title="Total Fees Collected (Batch)" value={`₹${feeSummary.collected.toLocaleString()}`} icon={ICONS.fees} color="bg-green-500 text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Gender Distribution" data={genderDistribution} />
                <BarChart title="Fee Status Summary (in ₹)" data={feeChartData} />
            </div>
        </div>
    );
};

export default AdminDashboard;