import React, { useEffect, useState } from 'react';
import StudentReportCard from '../student/StudentReportCard';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { Student } from '../../types';

const ParentReportCard: React.FC = () => {
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

    const handlePrint = () => {
        window.print();
    };
    
    if (loading) return <div>Loading...</div>;

    return (
      <div>
        <div className="printable-area">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Child's Report Card</h1>
            {child ? (
                <>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Displaying academic performance for {child.name}.</p>
                    <StudentReportCard studentIdForParent={child.id} />
                </>
            ) : (
                 <p className="text-red-500">Could not find child information to display report card.</p>
            )}
        </div>

        <div className="flex justify-end mt-4 no-print">
            <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" disabled={!child}>
                Print Report
            </button>
        </div>
      </div>
    );
};

export default ParentReportCard;