import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { Exam, Student, ExamResult } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface ReportData {
    student: Student;
    results: (ExamResult & { 
        examName?: string; 
        totalMarks?: number; 
        examDate?: string;
        examRank: number;
    })[];
}

const TeacherProgressReport: React.FC = () => {
    const { user } = useAuth();
    const [configView, setConfigView] = useState(true);
    const [loading, setLoading] = useState(true);
    
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    
    const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentFilter, setStudentFilter] = useState('');
    
    const [reportData, setReportData] = useState<ReportData[]>([]);

    useEffect(() => {
        const fetchConfigData = async () => {
            if (!user?.currentBatch) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [exams, students] = await Promise.all([
                    api.getExams(user.currentBatch),
                    api.getStudentsByBatch(user.currentBatch)
                ]);
                setAllExams(exams);
                setAllStudents(students);
                // By default, select all students and exams
                setSelectedExamIds(exams.map(e => e.id));
                setSelectedStudentIds(students.map(s => s.id));
            } catch (error) {
                console.error("Failed to fetch data for report configuration:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfigData();
    }, [user?.currentBatch]);

    const filteredStudents = useMemo(() => {
        if (!studentFilter) return allStudents;
        return allStudents.filter(student =>
            student.name.toLowerCase().includes(studentFilter.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(studentFilter.toLowerCase())
        );
    }, [allStudents, studentFilter]);

    const handleGenerateReport = async () => {
        if (selectedExamIds.length === 0 || selectedStudentIds.length === 0) {
            alert("Please select at least one exam and one student.");
            return;
        }
        setLoading(true);
        try {
            const results = await api.getResultsForExams(selectedExamIds);
            const examMap = new Map(allExams.map(e => [e.id, e]));
            const studentMap = new Map(allStudents.map(s => [s.id, s]));

            // Calculate per-exam ranks
            const perExamRankMap = new Map<string, Map<string, number>>();

            for (const examId of selectedExamIds) {
                const examResultsForThisExam = results.filter(r => r.examId === examId && r.marks !== null);
                
                const performanceList = examResultsForThisExam
                    .filter(r => selectedStudentIds.includes(r.studentId))
                    .map(r => ({
                        studentId: r.studentId,
                        marks: r.marks!,
                        tenthMarks: studentMap.get(r.studentId)!.tenthMarks
                    }));

                performanceList.sort((a, b) => {
                    if (b.marks !== a.marks) return b.marks - a.marks;
                    return b.tenthMarks - a.tenthMarks;
                });

                const examRankMapForCurrentExam = new Map<string, number>();
                let rank = 0;
                let lastScore = -1;
                let lastTenthMarks = -1;
                performanceList.forEach((p, index) => {
                    if (p.marks !== lastScore || p.tenthMarks !== lastTenthMarks) {
                        rank = index + 1;
                        lastScore = p.marks;
                        lastTenthMarks = p.tenthMarks;
                    }
                    examRankMapForCurrentExam.set(p.studentId, rank);
                });
                perExamRankMap.set(examId, examRankMapForCurrentExam);
            }

            // Generate report data
            const generatedData = selectedStudentIds.map(studentId => {
                const student = studentMap.get(studentId)!;
                const studentResults = selectedExamIds.map(examId => {
                    const result = results.find(r => r.studentId === studentId && r.examId === examId);
                    const rank = perExamRankMap.get(examId)?.get(studentId);
                    
                    return {
                        ...(result || { examId, studentId, marks: null }),
                        examName: examMap.get(examId)?.name,
                        examDate: examMap.get(examId)?.date,
                        totalMarks: examMap.get(examId)?.totalMarks,
                        examRank: rank || 0,
                    };
                });
                
                return { 
                    student, 
                    results: studentResults,
                };
            }).sort((a, b) => a.student.rollNo.localeCompare(b.student.rollNo));
            
            setReportData(generatedData);
            setConfigView(false);

        } catch (error) {
            console.error("Failed to generate report:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSelectAllExams = (checked: boolean) => {
        setSelectedExamIds(checked ? allExams.map(e => e.id) : []);
    };
    
    const handleSelectAllStudents = (checked: boolean) => {
        const filteredIds = filteredStudents.map(s => s.id);
        if (checked) {
            setSelectedStudentIds(prev => [...new Set([...prev, ...filteredIds])]);
        } else {
            setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)));
        }
    };
    
    const handlePrint = () => window.print();

    if (loading && configView) return <p>Loading configuration for {user?.currentBatch}...</p>;

    if (!configView) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6 no-print">
                    <button onClick={() => setConfigView(true)} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Configuration</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Report</button>
                </div>
                <div className="printable-area space-y-8 p-4">
                    {loading ? <p>Generating report...</p> : reportData.map(({ student, results }) => (
                        <div key={student.id} className="report-card bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                            <div className="text-center mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
                                <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Ghonse Maths Academy</h1>
                                <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-2">Overall Progress Report</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-4">
                                <div><strong>Roll No:</strong> {student.rollNo}</div>
                                <div className="md:col-span-2"><strong>Name:</strong> {student.name}</div>
                                <div><strong>Gender:</strong> {student.gender}</div>
                                <div><strong>Division:</strong> {student.division}</div>
                                <div><strong>Category:</strong> {student.category}</div>
                                <div className="md:col-span-2"><strong>Parent Mobile:</strong> {student.parentMobile}</div>
                            </div>
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2">Sr. No</th>
                                        <th className="px-4 py-2">Name of the Exam</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Marks Obtained</th>
                                        <th className="px-4 py-2">Out of Marks</th>
                                        <th className="px-4 py-2 text-center">General Merit Rank</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, index) => {
                                        const status = r.marks !== null ? 'Present' : 'Absent';
                                        const marksObtained = r.marks !== null ? r.marks : 'AB';
                                        return (
                                            <tr key={r.examId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">{r.examName || 'N/A'}</th>
                                                <td className="px-4 py-2">{status}</td>
                                                <td className="px-4 py-2 font-semibold">{marksObtained}</td>
                                                <td className="px-4 py-2">{r.totalMarks || 'N/A'}</td>
                                                <td className="px-4 py-2 font-bold text-center text-indigo-600">{r.examRank > 0 ? r.examRank : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                             <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between items-end">
                                    <div><p><strong>Date:</strong> {new Date().toLocaleDateString()}</p></div>
                                    <div className="text-center"><p className="border-t border-gray-500 pt-1">Signature</p></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="no-print">
                <div className="flex justify-between items-center mb-6">
                     <Link to="/dashboard" className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Dashboard</Link>
                     <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Progress Report for {user?.currentBatch}</h1>
                     <div></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Report Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                <h3 className="text-lg font-semibold">1. Select Exams</h3>
                                <label className="text-sm flex items-center"><input type="checkbox" checked={selectedExamIds.length === allExams.length && allExams.length > 0} onChange={e => handleSelectAllExams(e.target.checked)} className="mr-2"/> Select All</label>
                            </div>
                            <div className="space-y-1 max-h-64 overflow-y-auto p-2 border rounded-md">
                                {allExams.map(exam => (
                                    <label key={exam.id} className="flex items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"><input type="checkbox" value={exam.id} checked={selectedExamIds.includes(exam.id)} onChange={e => setSelectedExamIds(p => e.target.checked ? [...p, exam.id] : p.filter(id => id !== exam.id))} className="mr-3 h-4 w-4"/> {exam.name}</label>
                                ))}
                                 {allExams.length === 0 && <p className="text-sm text-gray-500 p-2">No exams found for this batch.</p>}
                            </div>
                        </div>
                         <div>
                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                <h3 className="text-lg font-semibold">2. Select Students</h3>
                                <label className="text-sm flex items-center"><input type="checkbox" checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0} onChange={e => handleSelectAllStudents(e.target.checked)} className="mr-2"/> Select All (Visible)</label>
                            </div>
                             <input
                                type="text"
                                placeholder="Filter by name or roll no..."
                                value={studentFilter}
                                onChange={e => setStudentFilter(e.target.value)}
                                className="w-full p-2 mb-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="space-y-1 max-h-56 overflow-y-auto p-2 border rounded-md">
                                {filteredStudents.map(student => (
                                    <label key={student.id} className="flex items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"><input type="checkbox" value={student.id} checked={selectedStudentIds.includes(student.id)} onChange={e => setSelectedStudentIds(p => e.target.checked ? [...p, student.id] : p.filter(id => id !== student.id))} className="mr-3 h-4 w-4"/> {student.name} ({student.rollNo})</label>
                                ))}
                                {allStudents.length === 0 && <p className="text-sm text-gray-500 p-2">No students found for this batch.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <button onClick={handleGenerateReport} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400" disabled={selectedExamIds.length === 0 || selectedStudentIds.length === 0}>
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProgressReport;
