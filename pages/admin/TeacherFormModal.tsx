import React, { useEffect, useState } from 'react';
import { Teacher, Batch, BatchName } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface TeacherFormModalProps {
    teacherToEdit: Teacher | null;
    onSave: (data: Omit<Teacher, 'id'>, teacherId: string | null) => void;
    onCancel: () => void;
}

const TeacherFormModal: React.FC<TeacherFormModalProps> = ({ teacherToEdit, onSave, onCancel }) => {
    const isEditMode = !!teacherToEdit;
    const { availableBatches } = useAuth();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [qualification, setQualification] = useState('');
    const [experience, setExperience] = useState<number>(0);
    const [assignedBatches, setAssignedBatches] = useState<BatchName[]>([]);

    useEffect(() => {
        if (isEditMode && teacherToEdit) {
            setName(teacherToEdit.name);
            setMobile(teacherToEdit.mobile);
            setQualification(teacherToEdit.qualification);
            setExperience(teacherToEdit.experience);
            setAssignedBatches(teacherToEdit.assignedBatches);
        } else {
            // Reset for Add mode
            setName('');
            setMobile('');
            setQualification('');
            setExperience(0);
            setAssignedBatches([]);
        }
    }, [teacherToEdit, isEditMode]);

    const handleBatchChange = (batchName: BatchName) => {
        setAssignedBatches(prev =>
            prev.includes(batchName) ? prev.filter(b => b !== batchName) : [...prev, batchName]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (assignedBatches.length === 0) {
            alert("Please assign at least one batch.");
            return;
        }
        
        const teacherData: Omit<Teacher, 'id'> = {
            name,
            mobile,
            qualification,
            experience,
            assignedBatches
        };
        onSave(teacherData, teacherToEdit ? teacherToEdit.id : null);
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                    {isEditMode ? 'Edit Teacher Details' : 'Add New Teacher'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className={labelClass}>Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
                    <div><label className={labelClass}>Mobile Number</label><input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className={inputClass} required /></div>
                    <div><label className={labelClass}>Qualification</label><input type="text" value={qualification} onChange={e => setQualification(e.target.value)} className={inputClass} required placeholder="e.g., M.Sc. Maths, PhD" /></div>
                    <div><label className={labelClass}>Experience (in years)</label><input type="number" value={experience} onChange={e => setExperience(Number(e.target.value))} className={inputClass} required min="0"/></div>
                    <div>
                        <label className={labelClass}>Assign Batches</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {availableBatches.map(batch => (
                                <label key={batch.name} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                                    <input type="checkbox" checked={assignedBatches.includes(batch.name)} onChange={() => handleBatchChange(batch.name)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span>{batch.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isEditMode ? 'Save Changes' : 'Add Teacher'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherFormModal;