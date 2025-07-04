import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { Student } from '../../types';
import StudentAttendance from '../student/StudentAttendance';

const ParentAttendance: React.FC = () => {
    const { user } = useAuth();
    const [child, setChild] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchChild = async () => {
                setLoading(true);
                try {
                    const childData = await api.getChildOfParent(user.id);
                    setChild(childData);
                } catch(e) {
                    console.error("Failed to fetch child data", e);
                } finally {
                    setLoading(false);
                }
            }
            fetchChild();
        }
    }, [user]);

    if(loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Child's Attendance</h1>
             {child ? (
                <>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Displaying attendance for {child.name}.</p>
                    <StudentAttendance studentIdForParent={child.id} />
                </>
             ) : (
                <p className="text-red-500">Could not find child information to display attendance.</p>
             )}
        </div>
    );
};

export default ParentAttendance;
