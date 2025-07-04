import React, { useState } from 'react';
import { Batch, Exam } from '../../types';

interface ExamFormModalProps {
    onSave: (data: Omit<Exam, 'id'>) => void;
    onCancel: () => void;
    currentBatch: Batch;
}

const ExamFormModal: React.FC<ExamFormModalProps> = ({ onSave, onCancel, currentBatch }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [totalMarks, setTotalMarks] = useState<number>(100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !date || totalMarks <= 0) {
            alert("Please fill all fields correctly.");
            return;
        }
        
        const examData: Omit<Exam, 'id'> = {
            name,
            date,
            totalMarks,
            batch: currentBatch.name
        };
        onSave(examData);
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                    Create New Exam for {currentBatch.name}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Exam Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="e.g., Mid-Term Test" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Exam Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Out of Marks</label>
                            <input type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className={inputClass} required min="1"/>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create Exam</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamFormModal;