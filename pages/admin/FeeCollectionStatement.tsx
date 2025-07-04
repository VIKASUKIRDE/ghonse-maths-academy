import React, { useState, useMemo } from 'react';
import { Student, Payment } from '../../types';
import { APP_NAME } from '../../constants';

interface FeeCollectionStatementProps {
    students: Student[];
    onBack: () => void;
}

type ReportRow = {
    student: Student;
    payment: Payment;
}

export const FeeCollectionStatement: React.FC<FeeCollectionStatementProps> = ({ students, onBack }) => {
    const [filterType, setFilterType] = useState<'period' | 'single'>('period');
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const reportData = useMemo<ReportRow[]>(() => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const collectedPayments: ReportRow[] = [];

        students.forEach(student => {
            student.fees.payments?.forEach(payment => {
                const paymentDate = new Date(payment.date);
                if (paymentDate >= start && paymentDate <= end) {
                    collectedPayments.push({ student, payment });
                }
            });
        });

        return collectedPayments.sort((a, b) => new Date(a.payment.date).getTime() - new Date(b.payment.date).getTime());
    }, [students, startDate, endDate]);

    const totalCollection = useMemo(() => {
        return reportData.reduce((sum, row) => sum + row.payment.amount, 0);
    }, [reportData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="no-print flex justify-between items-center mb-6 flex-wrap gap-4">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <div className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="filterType" value="period" checked={filterType === 'period'} onChange={() => setFilterType('period')} className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900" />
                            <span className="text-sm font-medium">Period</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="filterType" value="single" checked={filterType === 'single'} onChange={() => setFilterType('single')} className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900" />
                            <span className="text-sm font-medium">Single Day</span>
                        </label>
                    </div>

                    {filterType === 'period' ? (
                        <div className="flex items-center gap-4">
                            <div>
                                <label htmlFor="start-date" className="text-sm font-medium mr-2">From:</label>
                                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-1 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="text-sm font-medium mr-2">To:</label>
                                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-1 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="single-date" className="text-sm font-medium mr-2">Date:</label>
                            <input
                                type="date"
                                id="single-date"
                                value={startDate} // Use startDate for the single date value
                                onChange={e => {
                                    setStartDate(e.target.value);
                                    setEndDate(e.target.value); // Set both start and end to the same value
                                }}
                                className="p-1 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                    )}
                </div>

                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Statement</button>
            </div>

            <div className="printable-area bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print-header">{APP_NAME}</h1>
                    <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                    <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2">Fee Collection Statement</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {filterType === 'period'
                            ? `Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                            : `Date: ${new Date(startDate).toLocaleDateString()}`
                        }
                    </p>
                </div>

                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Sr. No</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Roll No</th>
                                <th className="px-6 py-3">Student Name</th>
                                <th className="px-6 py-3">Batch</th>
                                <th className="px-6 py-3 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row, index) => (
                                <tr key={`${row.student.id}-${row.payment.date}-${index}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{new Date(row.payment.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{row.student.rollNo}</td>
                                    <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.student.name}</th>
                                    <td className="px-6 py-4">{row.student.batch}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{row.payment.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold text-base bg-gray-100 dark:bg-slate-700">
                                <td colSpan={5} className="text-right px-6 py-3">Total Collection:</td>
                                <td className="text-right px-6 py-3">₹{totalCollection.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                     {reportData.length === 0 && (
                        <p className="text-center p-4">No fee collections found for the selected period.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
