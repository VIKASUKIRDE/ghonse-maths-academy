import React, { useEffect, useState } from 'react';
import { Batch } from '../../types';

interface BatchFormModalProps {
    batchToEdit: Batch | null;
    onSave: (data: Batch, originalName: string | null) => void;
    onCancel: () => void;
}

const BatchFormModal: React.FC<BatchFormModalProps> = ({ batchToEdit, onSave, onCancel }) => {
    const isEditMode = !!batchToEdit;
    
    const [name, setName] = useState('');
    const [fee, setFee] = useState<number | ''>('');

    useEffect(() => {
        if (isEditMode && batchToEdit) {
            setName(batchToEdit.name);
            setFee(batchToEdit.fee);
        }
    }, [batchToEdit, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || fee === '' || fee < 0) {
            alert("Please enter a valid batch name and a non-negative fee.");
            return;
        }

        const batchData: Batch = {
            name,
            fee: Number(fee),
        };

        onSave(batchData, batchToEdit ? batchToEdit.name : null);
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                    {isEditMode ? 'Edit Batch' : 'Add New Batch'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Batch Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Fee (₹)</label>
                        <input type="number" value={fee} onChange={e => setFee(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} required min="0" placeholder="e.g., 50000"/>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isEditMode ? 'Save Changes' : 'Add Batch'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchFormModal;
