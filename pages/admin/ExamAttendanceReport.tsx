import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockApi';
import { Exam, Student } from '../../types';

interface ExamAttendanceReportProps {
    exam: Exam;
    onBack: () => void;
}

export const ExamAttendanceReport: React.FC<ExamAttendanceReportProps> = ({ exam, onBack }) => {
    const [presentStudents, setPresentStudents] = useState<Student[]>([]);
    const [absentStudents, setAbsentStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            setLoading(true);
            try {
                const [allStudentsInBatch, examResults] = await Promise.all([
                    api.getStudentsByBatch(exam.batch),
                    api.getExamResults(exam.id)
                ]);

                const presentStudentIds = new Set(examResults.map(r => r.studentId));
                
                const present: Student[] = [];
                const absent: Student[] = [];

                allStudentsInBatch.forEach(student => {
                    if (presentStudentIds.has(student.id)) {
                        present.push(student);
                    } else {
                        absent.push(student);
                    }
                });

                setPresentStudents(present.sort((a,b) => a.rollNo.localeCompare(b.rollNo)));
                setAbsentStudents(absent.sort((a,b) => a.rollNo.localeCompare(b.rollNo)));

            } catch (error) {
                console.error("Failed to fetch attendance data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [exam]);

    const handlePrint = () => {
        window.print();
    };
    
    const AttendanceTable = ({ title, students }: { title: string, students: Student[] }) => (
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">{title} ({students.length})</h3>
            <div className="relative overflow-x-auto border dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Sr. No</th>
                            <th scope="col" className="px-6 py-3">Roll No</th>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Parent Mobile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map((student, index) => (
                            <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">{student.rollNo}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{student.name}</th>
                                <td className="px-6 py-4">{student.parentMobile}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-4">No students in this list.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Exam List</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Report</button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden printable-area p-8">
                <header className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ghonse Maths Academy</h1>
                    <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-2">Exam Attendance Report</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        <strong>Exam:</strong> {exam.name} | <strong>Batch:</strong> {exam.batch} | <strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}
                    </p>
                </header>

                {loading ? (
                    <p className="text-center py-8">Loading attendance data...</p>
                ) : (
                    <>
                        <AttendanceTable title="Present Students" students={presentStudents} />
                        <AttendanceTable title="Absent Students" students={absentStudents} />
                    </>
                )}
                 <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between items-center">
                        <p>Report Generated On: {new Date().toLocaleString()}</p>
                        <p>Total Students in Batch: {presentStudents.length + absentStudents.length}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};
