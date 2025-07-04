import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { Student } from '../../types';

const ParentChildInfo: React.FC = () => {
    const { user } = useAuth();
    const [child, setChild] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchChildData = async () => {
                setLoading(true);
                try {
                    const data = await api.getChildOfParent(user.id);
                    setChild(data);
                } catch (error) {
                    console.error("Failed to fetch child's data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchChildData();
        }
    }, [user]);

    if (loading) {
        return <div>Loading child's information...</div>;
    }

    if (!child) {
        return <div>Could not find information for your child.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Child Information</h1>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-6">
                    <img src={child.photoUrl} alt={child.name} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-300"/>
                    <div>
                        <h2 className="text-2xl font-bold">{child.name}</h2>
                        <p className="text-gray-500">Roll No: {child.rollNo}</p>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700">
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">Batch</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{child.batch}</dd>
                        </div>
                         <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{child.address}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">Remarks from Teacher</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{child.remarks || 'No remarks yet.'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default ParentChildInfo;
