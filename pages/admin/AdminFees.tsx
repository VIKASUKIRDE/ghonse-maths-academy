import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { Student } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const AdminFees: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStudents = useCallback(async () => {
        if (!user?.currentBatch) return;

        setLoading(true);
        try {
            const studentData = await api.getStudentsByBatch(user.currentBatch!);
            setStudents(studentData);
        } catch (error) {
            console.error("Failed to fetch student fee data:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.currentBatch]);
    
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);
    
    const handlePrint = () => {
        window.print();
    };

    const filteredStudents = useMemo(() => {
        let tempStudents = students;

        // Status filter
        if (statusFilter === 'completed') {
            tempStudents = tempStudents.filter(s => s.fees.pending === 0);
        } else if (statusFilter === 'overdue') {
            tempStudents = tempStudents.filter(s => s.fees.overdue > 0);
        } else if (statusFilter === 'pending') {
            tempStudents = tempStudents.filter(s => s.fees.pending > 0 && s.fees.overdue === 0);
        }


        // Search query filter
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            tempStudents = tempStudents.filter(s =>
                s.name.toLowerCase().includes(lowercasedQuery) ||
                s.rollNo.toLowerCase().includes(lowercasedQuery)
            );
        }

        return tempStudents;
    }, [students, statusFilter, searchQuery]);

    const feeSummary = useMemo(() => {
        return students.reduce((acc, s) => {
            acc.total += s.fees.total;
            acc.collected += s.fees.collected;
            acc.pending += s.fees.pending;
            acc.overdue += s.fees.overdue;
            acc.concession += s.fees.concession;
            return acc;
        }, { total: 0, collected: 0, pending: 0, overdue: 0, concession: 0 });
    }, [students]);

    return (
        <div>
            <div className="no-print">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Fee Details for {user?.currentBatch} Batch</h1>
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Print Report
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Filter by name or roll no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                     <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>
            
            <div className="printable-area">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 print-header" style={{display: 'none'}}>
                    Fee Details Report: {user?.currentBatch} Batch
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">TOTAL FEES</h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">₹{feeSummary.total.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">CONCESSION</h3>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">₹{feeSummary.concession.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">COLLECTED</h3>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">₹{feeSummary.collected.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">PENDING</h3>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">₹{feeSummary.pending.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">OVERDUE</h3>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">₹{feeSummary.overdue.toLocaleString()}</p>
                    </div>
                </div>
            
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <div className="relative overflow-x-auto">
                        {loading ? <p className="p-4">Loading fee data...</p> : (
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Roll No</th>
                                        <th className="px-6 py-3">Student Name</th>
                                        <th className="px-6 py-3">Total Fees</th>
                                        <th className="px-6 py-3">Concession</th>
                                        <th className="px-6 py-3">Collected</th>
                                        <th className="px-6 py-3">Pending</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 no-print text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length > 0 ? filteredStudents.map(s => {
                                        const status = s.fees.pending === 0 ? 'Completed' : (s.fees.overdue > 0 ? 'Overdue' : 'Pending');
                                        const statusColor = status === 'Completed' ? 'bg-green-100 text-green-800' : (status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800');
                                        return (
                                            <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-6 py-4">{s.rollNo}</td>
                                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{s.name}</th>
                                                <td className="px-6 py-4">₹{s.fees.total.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-purple-600">₹{s.fees.concession.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-green-600">₹{s.fees.collected.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-yellow-600 font-bold">₹{s.fees.pending.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>{status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center no-print">
                                                    <Link 
                                                        to={`/fees/receipt/${s.id}`}
                                                        className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700"
                                                    >
                                                        View / Manage
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={9} className="text-center p-4">No students match the current filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFees;