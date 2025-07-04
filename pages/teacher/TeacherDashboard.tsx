import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { Student } from '../../types';
import AISuvicharCard from '../../components/AISuvicharCard';
import StatCard from '../../components/StatCard';
import { ICONS } from '../../constants';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [myStudents, setMyStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.currentBatch) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const studentsInBatch = await api.getStudentsByBatch(user.currentBatch!);
                setMyStudents(studentsInBatch);
            } catch (error) {
                console.error("Failed to fetch teacher dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div>Loading dashboard for {user?.currentBatch}...</div>;

    return (
        <div className="space-y-6">
            <AISuvicharCard prompt="Provide a short, motivating thought for a math teacher about inspiring students." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Students in Batch" value={myStudents.length} icon={ICONS.users} color="bg-teal-500 text-white" />
                <StatCard title="Current Batch" value={user?.currentBatch || 'N/A'} icon={ICONS.batches} color="bg-sky-500 text-white" />
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Students in {user?.currentBatch}</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Roll No</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myStudents.length > 0 ? myStudents.map(s => (
                                <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{s.rollNo}</td>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{s.name}</th>
                                    <td className="px-6 py-4">{s.studentMobile}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-4">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;