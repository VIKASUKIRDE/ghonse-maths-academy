import React, { useState, useEffect } from 'react';
import { Student, Payment } from '../../types';

interface PaymentFormModalProps {
    student: Student;
    paymentToEdit: Payment | null;
    onSave: (studentId: string, paymentData: Omit<Payment, 'id'>, paymentIdToUpdate: string | null) => Promise<void>;
    onCancel: () => void;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ student, paymentToEdit, onSave, onCancel }) => {
    const isEditMode = !!paymentToEdit;

    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState<Payment['mode']>('Cash');
    const [particulars, setParticulars] = useState('');
    
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isEditMode && paymentToEdit) {
            setAmount(String(paymentToEdit.amount));
            setDate(new Date(paymentToEdit.date).toISOString().split('T')[0]);
            setMode(paymentToEdit.mode);
            setParticulars(paymentToEdit.particulars);
        } else {
            setParticulars('Fee Installment');
        }
    }, [paymentToEdit, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const paymentValue = parseFloat(amount);
        if (isNaN(paymentValue) || paymentValue <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        if (!isEditMode) {
            const pendingAmount = student.fees.pending;
            if (paymentValue > pendingAmount) {
                setError(`Amount cannot be more than the pending ₹${pendingAmount.toLocaleString()}.`);
                return;
            }
        }
        
        setIsSaving(true);
        const paymentData: Omit<Payment, 'id'> = {
            amount: paymentValue,
            date: new Date(date).toISOString(),
            mode,
            particulars
        };

        try {
            await onSave(student.id, paymentData, paymentToEdit ? paymentToEdit.id : null);
        } catch (apiError: any) {
            setError(apiError.message || 'Failed to save payment. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                    {isEditMode ? 'Edit Fee Payment' : 'Add Fee Payment'}
                </h2>
                <div className="mb-4 p-3 bg-indigo-50 dark:bg-slate-700 rounded-md text-sm">
                    <p><strong>Student:</strong> {student.name}</p>
                    <p><strong>Pending Amount:</strong> <span className="font-bold text-red-600 dark:text-red-400">₹{student.fees.pending.toLocaleString()}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="paymentAmount" className={labelClass}>Payment Amount (₹)</label>
                            <input
                                id="paymentAmount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={inputClass}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="paymentDate" className={labelClass}>Payment Date</label>
                            <input
                                id="paymentDate"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>

                     <div>
                        <label htmlFor="paymentMode" className={labelClass}>Payment Mode</label>
                        <select id="paymentMode" value={mode} onChange={e => setMode(e.target.value as Payment['mode'])} className={inputClass}>
                            <option>Cash</option>
                            <option>Online</option>
                            <option>Cheque</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="paymentParticulars" className={labelClass}>Particulars</label>
                        <input
                            id="paymentParticulars"
                            type="text"
                            value={particulars}
                            onChange={(e) => setParticulars(e.target.value)}
                            className={inputClass}
                            placeholder="e.g., First Installment"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400">
                            {isSaving ? 'Saving...' : 'Save Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentFormModal;
