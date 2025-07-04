import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { APP_NAME } from '../../constants';

interface BalanceStatementProps {
    students: Student[];
    onBack: () => void;
}

const BalanceStatement: React.FC<BalanceStatementProps> = ({ students, onBack }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const filteredStudents = useMemo(() => {
        let tempStudents = students;

        // Status filter
        if (statusFilter === 'completed') {
            tempStudents = tempStudents.filter(s => s.fees.pending === 0);
        } else if (statusFilter === 'overdue') {
            tempStudents = tempStudents.filter(s => s.fees.overdue > 0);
        } else if (statusFilter === 'pending') {
            tempStudents = tempStudents.filter(s => s.fees.pending > 0 && s.fees.overdue === 0);
        } else if (statusFilter === 'has_balance') {
            tempStudents = tempStudents.filter(s => s.fees.pending > 0);
        }

        // Amount range filter
        const min = parseFloat(minAmount);
        const max = parseFloat(maxAmount);

        if (!isNaN(min)) {
            tempStudents = tempStudents.filter(s => s.fees.pending >= min);
        }
        if (!isNaN(max)) {
            tempStudents = tempStudents.filter(s => s.fees.pending <= max);
        }

        return tempStudents;
    }, [students, statusFilter, minAmount, maxAmount]);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="no-print flex justify-between items-center mb-6 flex-wrap gap-4">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                <div className="flex items-center gap-4">
                    <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="p-2 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600">
                        <option value="all">All Students</option>
                        <option value="has_balance">Any Pending Balance</option>
                        <option value="pending">Pending (Not Overdue)</option>
                        <option value="overdue">Overdue</option>
                        <option value="completed">Completed</option>
                    </select>
                    <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="Min Pending Amt" className="p-2 w-36 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600" />
                    <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="Max Pending Amt" className="p-2 w-36 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600" />
                </div>
                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Statement</button>
            </div>

            <div className="printable-area bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print-header">{APP_NAME}</h1>
                    <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                    <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2">Balance Statement</h2>
                </div>
                 <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Roll No</th>
                                <th className="px-6 py-3">Student Name</th>
                                <th className="px-6 py-3">Batch</th>
                                <th className="px-6 py-3">Total Fees</th>
                                <th className="px-6 py-3">Collected</th>
                                <th className="px-6 py-3">Pending</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(s => {
                                const status = s.fees.pending === 0 ? 'Completed' : (s.fees.overdue > 0 ? 'Overdue' : 'Pending');
                                const statusColor = status === 'Completed' ? 'bg-green-100 text-green-800' : (status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800');
                                return (
                                    <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4">{s.rollNo}</td>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{s.name}</th>
                                        <td className="px-6 py-4">{s.batch}</td>
                                        <td className="px-6 py-4">₹{s.fees.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">₹{s.fees.collected.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold">₹{s.fees.pending.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>{status}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                        <p className="text-center p-4">No students match the current filters.</p>
                    )}
                 </div>
                 <div className="mt-8 text-right text-sm text-gray-500 dark:text-gray-400">
                    Date: {new Date().toLocaleDateString()}
                 </div>
            </div>
        </div>
    );
};

export default BalanceStatement;