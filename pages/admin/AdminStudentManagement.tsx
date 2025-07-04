import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { Student, Parent } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import StudentFormModal from './StudentFormModal';


const AdminStudentManagement: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<(Student & { parentName?: string }) | null>(null);

    const fetchStudentsAndParents = useCallback(async () => {
        if (!user?.currentBatch) return;
        setLoading(true);
        try {
            const [studentData, parentData] = await Promise.all([
                api.getStudentsByBatch(user.currentBatch),
                api.getParents(),
            ]);
            setStudents(studentData);
            setParents(parentData);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.currentBatch]);

    useEffect(() => {
        fetchStudentsAndParents();
    }, [fetchStudentsAndParents]);

    const handleOpenAddModal = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (student: Student) => {
        const parent = parents.find(p => p.id === student.parentId);
        setEditingStudent({ ...student, parentName: parent?.name || '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSaveStudent = async (formDataWithParent: Omit<Student, 'id' | 'rollNo' | 'parentId'> & { parentName: string }, studentId: string | null) => {
        const { parentName, ...formData } = formDataWithParent;
        try {
            if (studentId) { // Edit Mode
                const originalStudent = students.find(s => s.id === studentId);
                if (originalStudent) {
                    const updatedStudent: Student = {
                        ...originalStudent, // keep id, rollno, parentId, etc.
                        ...formData,       // update the rest from form
                    };
                    await api.updateStudent(updatedStudent, parentName);
                }
            } else { // Add Mode
                await api.addStudent({ ...formData, parentName });
            }
            handleCloseModal();
            fetchStudentsAndParents(); // Refresh list
        } catch (error) {
            console.error("Failed to save student:", error);
            alert("Error: Could not save student details.");
        }
    };
    
    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? This action is permanent and will also remove the associated parent record.')) {
            try {
                await api.deleteStudent(studentId);
                fetchStudentsAndParents(); // Refresh list
            } catch (error) {
                console.error("Failed to delete student:", error);
                alert("Error: Could not delete student.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Student Management</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2" disabled={!user?.currentBatch}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    <span>Add Student</span>
                </button>
            </div>
            
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative overflow-x-auto">
                    {loading ? <p className="p-4">Loading students for {user?.currentBatch}...</p> : (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Photo</th>
                                    <th scope="col" className="px-6 py-3">Roll No</th>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Mobile</th>
                                    <th scope="col" className="px-6 py-3">Division</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">
                                            <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                                        </td>
                                        <td className="px-6 py-4">{s.rollNo}</td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{s.name}</th>
                                        <td className="px-6 py-4">{s.studentMobile}</td>
                                        <td className="px-6 py-4 font-medium">{s.division}</td>
                                        <td className="px-6 py-4">{s.category}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleOpenEditModal(s)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Edit</button>
                                            <button onClick={() => handleDeleteStudent(s.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && user?.currentBatch && (
                <StudentFormModal 
                    currentBatch={user.currentBatch} 
                    studentToEdit={editingStudent}
                    onSave={handleSaveStudent} 
                    onCancel={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default AdminStudentManagement;