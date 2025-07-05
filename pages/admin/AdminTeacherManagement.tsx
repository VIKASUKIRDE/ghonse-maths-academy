import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { Teacher } from '../../types';
import TeacherFormModal from './TeacherFormModal';

const AdminTeacherManagement: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const teacherData = await api.getTeachers();
            setTeachers(teacherData);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);
    
    const handleOpenAddModal = () => {
        setEditingTeacher(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
    };

    const handleSaveTeacher = async (formData: Omit<Teacher, 'id'>, teacherId: string | null) => {
        try {
            if (teacherId) { // Edit Mode
                 const updatedTeacher: Teacher = {
                    ...formData,
                    id: teacherId,
                };
                await api.updateTeacher(updatedTeacher);
            } else { // Add Mode
                await api.addTeacher(formData);
            }
            handleCloseModal();
            fetchTeachers(); // Refresh list
        } catch (error) {
            console.error("Failed to save teacher:", error);
            alert("Error: Could not save teacher details.");
        }
    };
    
    const handleDeleteTeacher = async (teacherId: string) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await api.deleteTeacher(teacherId);
                fetchTeachers(); // Refresh list
            } catch (error) {
                console.error("Failed to delete teacher:", error);
                alert("Error: Could not delete teacher.");
            }
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Teacher Management</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    <span>Add Teacher</span>
                </button>
            </div>
            
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative overflow-x-auto">
                    {loading ? <p className="p-4">Loading teachers...</p> : (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Mobile</th>
                                    <th scope="col" className="px-6 py-3">Credentials</th>
                                    <th scope="col" className="px-6 py-3">Qualification</th>
                                    <th scope="col" className="px-6 py-3">Experience (yrs)</th>
                                    <th scope="col" className="px-6 py-3">Assigned Batches</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(t => (
                                    <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 align-middle">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{t.name}</th>
                                        <td className="px-6 py-4">{t.mobile}</td>
                                        <td className="px-6 py-4 text-xs">
                                            <div>ID: <span className="font-semibold">{t.mobile}</span></div>
                                            <div className="mt-1">Pass: <span className="font-semibold">{t.password || 'Ghonse@123'}</span></div>
                                        </td>
                                        <td className="px-6 py-4">{t.qualification}</td>
                                        <td className="px-6 py-4 text-center">{t.experience}</td>
                                        <td className="px-6 py-4">{t.assignedBatches.join(', ')}</td>
                                        <td className="px-6 py-4 text-right space-x-4">
                                            <button onClick={() => handleOpenEditModal(t)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Edit</button>
                                            <button onClick={() => handleDeleteTeacher(t.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            {isModalOpen && (
                <TeacherFormModal 
                    teacherToEdit={editingTeacher}
                    onSave={handleSaveTeacher} 
                    onCancel={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default AdminTeacherManagement;