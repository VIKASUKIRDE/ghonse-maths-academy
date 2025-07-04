import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { Attendance } from '../../types';

interface StudentAttendanceProps {
    studentIdForParent?: string; // Optional prop for parent view
}

const StudentAttendance: React.FC<StudentAttendanceProps> = ({ studentIdForParent }) => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const idToFetch = studentIdForParent || user?.id;
        if(idToFetch) {
            const fetchAttendance = async () => {
                setLoading(true);
                try {
                    const data = await api.getStudentAttendance(idToFetch);
                    setAttendance(data);
                } catch (e) {
                    console.error("Failed to fetch attendance", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchAttendance();
        }
    }, [user, studentIdForParent]);
    
    if(loading) return <p>Loading attendance...</p>;

    return (
        <div>
            {!studentIdForParent && <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Attendance</h1>}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length > 0 ? attendance.map(att => (
                                <tr key={att.date} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{new Date(att.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${att.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {att.present ? 'Present' : 'Absent'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={2} className="text-center py-4">No attendance data found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;
