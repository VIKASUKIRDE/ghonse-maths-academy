import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Exam, Student, ExamResult } from '../../types';
import { api } from '../../services/mockApi';

interface AdminExamMarksEntryProps {
    exam: Exam;
    students: Student[];
    initialResults: ExamResult[];
    onBack: () => void;
    onSaveSuccess: () => void;
}

const AdminExamMarksEntry: React.FC<AdminExamMarksEntryProps> = ({ exam, students, initialResults, onBack, onSaveSuccess }) => {
    const [rollNo, setRollNo] = useState('');
    const [marks, setMarks] = useState('');
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<{ name: string; marks: number } | null>(null);
    const [percentage, setPercentage] = useState<string | null>(null);
    
    const rollNoInputRef = useRef<HTMLInputElement>(null);
    const marksInputRef = useRef<HTMLInputElement>(null);

    const studentMap = useMemo(() => new Map(students.map(s => [s.rollNo, s])), [students]);

    useEffect(() => {
        rollNoInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (marks !== '' && exam.totalMarks > 0) {
            const marksValue = parseFloat(marks);
            if (!isNaN(marksValue) && marksValue >= 0 && marksValue <= exam.totalMarks) {
                const perc = ((marksValue / exam.totalMarks) * 100).toFixed(2);
                setPercentage(`${perc}%`);
            } else {
                setPercentage(null);
            }
        } else {
            setPercentage(null);
        }
    }, [marks, exam.totalMarks]);
    
    const findStudent = () => {
        const student = studentMap.get(rollNo.trim());
        if (student) {
            setCurrentStudent(student);
            setError('');
            setMarks('');
            setPercentage(null);
            const existingResult = initialResults.find(r => r.studentId === student.id);
            if (existingResult && existingResult.marks !== null) {
                setMarks(String(existingResult.marks));
            }
            marksInputRef.current?.focus();
        } else {
            setCurrentStudent(null);
            setError('Student with this Roll No. not found in this batch.');
        }
    };

    const handleRollNoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            findStudent();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStudent || marks === '' || isSaving) return;

        const marksValue = parseFloat(marks);
        if (isNaN(marksValue) || marksValue < 0 || marksValue > exam.totalMarks) {
            setError(`Marks must be a number between 0 and ${exam.totalMarks}.`);
            return;
        }

        setError('');
        setIsSaving(true);
        
        const newResult: ExamResult = { examId: exam.id, studentId: currentStudent.id, marks: marksValue };

        try {
            await api.updateExamMarks([newResult]);
            setLastSaved({ name: currentStudent.name, marks: marksValue });
            onSaveSuccess();
            
            setRollNo('');
            setMarks('');
            setPercentage(null);
            setCurrentStudent(null);
            rollNoInputRef.current?.focus();

        } catch (apiError) {
            setError('Failed to save marks. Please try again.');
            console.error(apiError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Exam List</button>
                {lastSaved && (
                    <div className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-md animate-pulse-once">
                        ✓ Saved: {lastSaved.name} - {lastSaved.marks} marks.
                    </div>
                )}
            </div>

            <style>{`.animate-pulse-once { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1); }`}</style>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{exam.name}</h1>
                    <p className="text-slate-600 dark:text-slate-400">Total Marks: {exam.totalMarks}</p>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roll No</label>
                            <input
                                id="rollNo"
                                type="text"
                                ref={rollNoInputRef}
                                value={rollNo}
                                onChange={e => setRollNo(e.target.value)}
                                onKeyDown={handleRollNoKeyDown}
                                onBlur={findStudent}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter Roll No. and press Enter"
                            />
                        </div>
                        <div>
                            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Name</label>
                            <input
                                id="studentName"
                                type="text"
                                value={currentStudent?.name || ''}
                                disabled
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="marks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marks Obtained</label>
                            <input
                                id="marks"
                                type="number"
                                ref={marksInputRef}
                                value={marks}
                                onChange={e => setMarks(e.target.value)}
                                disabled={!currentStudent || isSaving}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder={`Out of ${exam.totalMarks}`}
                                step="any"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Percentage</label>
                             <div className="mt-1 flex items-center h-10 px-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md">
                                <span className="text-gray-700 dark:text-gray-200 font-semibold">{percentage || '-'}</span>
                             </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!currentStudent || marks === '' || isSaving}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save & Enter Next'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminExamMarksEntry;
