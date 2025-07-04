import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { Exam, ExamResult, Student } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import ExamFormModal from '../admin/ExamFormModal';
import AdminExamMarksEntry from '../admin/AdminExamMarksEntry';
import MeritListPage from '../admin/MeritListPage';
import { ExamAttendanceReport } from '../admin/ExamAttendanceReport';

const TeacherExamManagement: React.FC = () => {
    const { user, availableBatches } = useAuth();
    
    const [view, setView] = useState<'list' | 'marks' | 'merit' | 'attendance'>('list');
    
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentBatchObject = availableBatches.find(b => b.name === user?.currentBatch);

    const fetchPrerequisites = useCallback(async () => {
        if (!user?.currentBatch) return;

        setLoading(true);
        try {
            const [examData, studentData] = await Promise.all([
                api.getExams(user.currentBatch),
                api.getStudentsByBatch(user.currentBatch)
            ]);
            setExams(examData);
            setStudents(studentData);
        } catch (error) {
            console.error("Failed to fetch exams or students:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.currentBatch]);

    useEffect(() => {
        fetchPrerequisites();
    }, [fetchPrerequisites]);

    const handleEnterMarks = async (exam: Exam) => {
        setSelectedExam(exam);
        setLoading(true);
        try {
            const resultData = await api.getExamResults(exam.id);
            const initialResults = students.map(student => {
                const existingResult = resultData.find(r => r.studentId === student.id);
                return existingResult || { examId: exam.id, studentId: student.id, marks: null };
            });
            setResults(initialResults);
            setView('marks');
        } catch (error) {
            console.error("Failed to fetch exam details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMeritList = (exam: Exam) => {
        setSelectedExam(exam);
        setView('merit');
    };
    
    const handleViewAttendance = (exam: Exam) => {
        setSelectedExam(exam);
        setView('attendance');
    };

    const handleMarksSaveSuccess = async () => {
        if (!selectedExam) return;
        // Re-fetch the results for the current exam to keep the initialResults prop updated
        const resultData = await api.getExamResults(selectedExam.id);
        const initialResults = students.map(student => {
            const existingResult = resultData.find(r => r.studentId === student.id);
            return existingResult || { examId: selectedExam.id, studentId: student.id, marks: null };
        });
        setResults(initialResults);
    };

    const handleSaveExam = async (examData: Omit<Exam, 'id'>) => {
        try {
            await api.addExam(examData);
            setIsModalOpen(false);
            fetchPrerequisites(); // Re-fetch exams
        } catch (error) {
            console.error("Failed to save exam:", error);
            alert('Failed to save exam.');
        }
    };
    
    const resetView = () => {
        setSelectedExam(null);
        setView('list');
    };

    if (loading) {
      return <div className="p-4">Loading exam data for {user?.currentBatch}...</div>
    }

    if (view === 'marks' && selectedExam) {
        return (
            <AdminExamMarksEntry
                exam={selectedExam}
                students={students}
                initialResults={results}
                onBack={resetView}
                onSaveSuccess={handleMarksSaveSuccess}
            />
        );
    }
    
    if (view === 'merit' && selectedExam) {
        return <MeritListPage exam={selectedExam} onBack={resetView} />;
    }

    if (view === 'attendance' && selectedExam) {
        return <ExamAttendanceReport exam={selectedExam} onBack={resetView} />;
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Exam Management for {user?.currentBatch}</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <span>Add Exam</span>
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Exam Name</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Batch</th>
                                <th scope="col" className="px-6 py-3">Total Marks</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length > 0 ? exams.map(exam => (
                                <tr key={exam.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{exam.name}</th>
                                    <td className="px-6 py-4">{new Date(exam.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{exam.batch}</td>
                                    <td className="px-6 py-4">{exam.totalMarks}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEnterMarks(exam)} className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">
                                            Enter Marks
                                        </button>
                                         <button onClick={() => handleViewMeritList(exam)} className="px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">
                                            Merit List
                                        </button>
                                        <button onClick={() => handleViewAttendance(exam)} className="px-2 py-1 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900">
                                            Attendance
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No exams found for this batch.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && currentBatchObject && (
                <ExamFormModal 
                    onSave={handleSaveExam}
                    onCancel={() => setIsModalOpen(false)}
                    currentBatch={currentBatchObject}
                />
            )}
        </div>
    );
};

export default TeacherExamManagement;