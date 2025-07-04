import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { Student, Exam, StarPerformerDetails } from '../../types';

// Combined type for displaying star performers with their full details
type DisplayPerformer = {
    student: Student;
    details: StarPerformerDetails;
    examName?: string;
}

const AdminStarPerformerManagement: React.FC = () => {
    // Data
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [starPerformers, setStarPerformers] = useState<DisplayPerformer[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentForForm, setSelectedStudentForForm] = useState<Student | null>(null);
    const [formExamId, setFormExamId] = useState<string>('');
    const [formRemarks, setFormRemarks] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial data fetch
    const fetchData = async () => {
        setLoading(true);
        try {
            const [students, exams, performersDetails] = await Promise.all([
                api.getStudents(), // Fetch all students, not just by batch
                api.getExams(),
                api.getStarPerformers()
            ]);
            setAllStudents(students);
            setAllExams(exams);
            
            const studentMap = new Map(students.map(s => [s.id, s]));
            const examMap = new Map(exams.map(e => [e.id, e]));

            const displayData = performersDetails.map(details => {
                const student = studentMap.get(details.studentId);
                if (!student) return null;
                const examName = details.examId ? examMap.get(details.examId)?.name : undefined;
                return { student, details, examName };
            }).filter(Boolean) as DisplayPerformer[];

            setStarPerformers(displayData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const starPerformerIds = useMemo(() => starPerformers.map(p => p.student.id), [starPerformers]);

    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        const lowercasedQuery = searchQuery.toLowerCase();
        return allStudents.filter(student =>
            !starPerformerIds.includes(student.id) && (
                student.name.toLowerCase().includes(lowercasedQuery) ||
                student.rollNo.toLowerCase().includes(lowercasedQuery)
            )
        );
    }, [searchQuery, allStudents, starPerformerIds]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudentForForm(student);
        setSearchQuery('');
    };

    const handleCancelForm = () => {
        setSelectedStudentForForm(null);
        setFormExamId('');
        setFormRemarks('');
        setFormDescription('');
    };
    
    const handleSave = async () => {
        if (!selectedStudentForForm) return;
        setIsSaving(true);
        const details: StarPerformerDetails = {
            studentId: selectedStudentForForm.id,
            examId: formExamId || undefined,
            remarks: formRemarks || undefined,
            description: formDescription || undefined,
        };
        await api.addStarPerformer(details);
        await fetchData(); // Refresh all data
        handleCancelForm();
        setIsSaving(false);
    };

    const handleRemove = async (studentId: string) => {
        if(window.confirm("Are you sure you want to remove this student from star performers?")) {
            await api.removeStarPerformer(studentId);
            await fetchData();
        }
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Star Performer Management</h1>

            {/* Form for adding a new star performer */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-slate-700">Add New Star Performer</h2>
                
                <div className="relative">
                    <label htmlFor="search-student" className="block text-sm font-medium text-gray-700 dark:text-gray-300">1. Search Student by Name or Roll No</label>
                    <input
                        id="search-student"
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Start typing to search..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {searchResults.map(student => (
                                <li key={student.id} onClick={() => handleSelectStudent(student)} className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700">
                                    {student.name} ({student.rollNo}) - {student.batch}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {selectedStudentForForm && (
                    <div className="mt-6 border-t pt-6 border-gray-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-slate-700/50 rounded-lg">
                            <img src={selectedStudentForForm.photoUrl} alt={selectedStudentForForm.name} className="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <h3 className="text-lg font-bold">{selectedStudentForForm.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Roll No: {selectedStudentForForm.rollNo} | Batch: {selectedStudentForForm.batch}</p>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">2. Highlight a Specific Exam (Optional)</label>
                            <select value={formExamId} onChange={e => setFormExamId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">-- No Specific Exam --</option>
                                {allExams.filter(e => e.batch === selectedStudentForForm.batch).map(exam => (
                                    <option key={exam.id} value={exam.id}>{exam.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">3. Add Remarks (Optional)</label>
                            <textarea value={formRemarks} onChange={e => setFormRemarks(e.target.value)} rows={2} placeholder="e.g., Top scorer in Calculus!" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">4. Add Description (Optional)</label>
                            <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} placeholder="A short description for the landing page." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                        <div className="flex justify-end gap-4">
                             <button onClick={handleCancelForm} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-md">Cancel</button>
                             <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{isSaving ? 'Saving...' : 'Save as Star Performer'}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* List of current star performers */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Current Star Performers ({starPerformers.length})</h2>
                {loading ? <p>Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {starPerformers.map(performer => (
                           <div key={performer.student.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col">
                               <div className="flex items-start gap-4">
                                   <img src={performer.student.photoUrl} alt={performer.student.name} className="w-16 h-16 rounded-full object-cover" />
                                   <div className="flex-1">
                                       <h3 className="font-bold">{performer.student.name}</h3>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">{performer.student.batch}</p>
                                   </div>
                                    <button onClick={() => handleRemove(performer.student.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-slate-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                               </div>
                               <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 text-sm space-y-2">
                                   {performer.examName && <p><strong>Exam:</strong> {performer.examName}</p>}
                                   {performer.details.remarks && <p><strong>Remarks:</strong> {performer.details.remarks}</p>}
                                   {performer.details.description && <p><strong>Description:</strong> {performer.details.description}</p>}
                               </div>
                           </div>
                       ))}
                    </div>
                )}
                 {starPerformers.length === 0 && !loading && (
                    <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg">
                        <p>No star performers added yet. Use the form above to add one.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default AdminStarPerformerManagement;