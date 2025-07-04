import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockApi';
import { Student, Batch } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import BatchFormModal from './BatchFormModal';

const AdminBatchManagement: React.FC = () => {
    const { user, availableBatches, refreshBatches } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Fetch students for the currently selected batch
    useEffect(() => {
        if (!user?.currentBatch) return;
        
        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const studentData = await api.getStudentsByBatch(user.currentBatch!);
                setStudents(studentData);
            } catch (error) {
                console.error(`Failed to fetch students for batch ${user.currentBatch}:`, error);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, [user?.currentBatch]);

    const handleOpenAddModal = () => {
        setEditingBatch(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (batch: Batch) => {
        setEditingBatch(batch);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBatch(null);
    };

    const handleSaveBatch = async (batchData: Batch, originalName: string | null) => {
        setError('');
        setSuccess('');
        try {
            if (originalName) {
                await api.updateBatch(originalName, batchData);
                setSuccess(`Batch "${batchData.name}" updated successfully.`);
            } else {
                await api.addBatch(batchData);
                setSuccess(`Batch "${batchData.name}" added successfully.`);
            }
            await refreshBatches();
            handleCloseModal();
        } catch (err: any) {
            setError(err.message || 'Failed to save batch.');
        }
    };


    const handleDeleteBatch = async (batchName: string) => {
        if (!window.confirm(`Are you sure you want to delete the batch "${batchName}"? This action cannot be undone and is only possible if no students or teachers are assigned to it.`)) {
            return;
        }
        
        setError('');
        setSuccess('');
        try {
            await api.deleteBatch(batchName);
            setSuccess(`Batch "${batchName}" deleted successfully.`);
            await refreshBatches();
        } catch (err: any) {
            setError(err.message || 'Failed to delete batch.');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Batch Management</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    <span>Add Batch</span>
                </button>
            </div>
            
            {/* Manage Batch List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-semibold">Manage All Batches</h2>
                </div>
                <div className="p-4 space-y-4">
                    {error && <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}
                    {success && <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-sm">{success}</div>}
                    <ul className="space-y-2">
                        {availableBatches.map(batch => (
                            <li key={batch.name} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                                <div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{batch.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">Fee: ₹{batch.fee.toLocaleString()}</span>
                                </div>
                                <div className="space-x-3">
                                    <button onClick={() => handleOpenEditModal(batch)} className="text-blue-500 hover:text-blue-700 font-medium">Edit</button>
                                    <button
                                        onClick={() => handleDeleteBatch(batch.name)}
                                        className="text-red-500 hover:text-red-700 font-medium"
                                        aria-label={`Delete ${batch.name}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* View Students in Current Batch */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-semibold">Students in Current Batch: {user?.currentBatch || 'None Selected'}</h2>
                </div>
                <div className="relative overflow-x-auto">
                    {loadingStudents ? <p className="p-4">Loading students...</p> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Photo</th>
                                <th scope="col" className="px-6 py-3">Roll No</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Mobile</th>
                                <th scope="col" className="px-6 py-3">Gender</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? students.map(s => (
                                <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                                    </td>
                                    <td className="px-6 py-4">{s.rollNo}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{s.name}</th>
                                    <td className="px-6 py-4">{s.studentMobile}</td>
                                    <td className="px-6 py-4">{s.gender}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No students found in this batch.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
             {isModalOpen && (
                <BatchFormModal
                    batchToEdit={editingBatch}
                    onSave={handleSaveBatch}
                    onCancel={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AdminBatchManagement;