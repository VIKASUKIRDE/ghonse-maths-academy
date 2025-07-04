import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockApi';
import { Exam, Student, ExamResult } from '../../types';

interface MeritListPageProps {
    exam: Exam;
    onBack: () => void;
}

interface MergedResult {
    rank: number;
    student: Student;
    result: ExamResult;
}

const MeritListPage: React.FC<MeritListPageProps> = ({ exam, onBack }) => {
    const [meritList, setMeritList] = useState<MergedResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateMeritList = async () => {
            setLoading(true);
            try {
                const [students, results] = await Promise.all([
                    api.getStudentsByBatch(exam.batch),
                    api.getExamResults(exam.id)
                ]);

                const studentMap = new Map(students.map(s => [s.id, s]));
                
                const processedResults = results
                    .filter(r => r.marks !== null && studentMap.has(r.studentId))
                    .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0));
                
                let rank = 1;
                const finalMeritList = processedResults.map((result, index) => {
                    if (index > 0 && result.marks !== processedResults[index-1].marks) {
                        rank = index + 1;
                    }
                    return {
                        rank: rank,
                        student: studentMap.get(result.studentId)!,
                        result
                    };
                });

                setMeritList(finalMeritList);
            } catch (error) {
                console.error("Failed to generate merit list:", error);
            } finally {
                setLoading(false);
            }
        };

        generateMeritList();
    }, [exam]);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Exam List</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Merit List</button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden printable-area p-8">
                 <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ghonse Maths Academy</h1>
                    <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                    <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2">Merit List</h2>
                    <p className="text-slate-500 dark:text-slate-400">Batch: {exam.batch} | Total Marks: {exam.totalMarks}</p>
                 </div>
                 
                 <div className="relative overflow-x-auto">
                    {loading ? <p className="p-4 text-center">Generating list...</p> : (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Rank</th>
                                    <th scope="col" className="px-6 py-3">Roll No</th>
                                    <th scope="col" className="px-6 py-3">Student Name</th>
                                    <th scope="col" className="px-6 py-3">Marks Obtained</th>
                                    <th scope="col" className="px-6 py-3">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meritList.length > 0 ? meritList.map(({ rank, student, result }) => (
                                    <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-bold text-lg text-gray-900 dark:text-white">{rank}</td>
                                        <td className="px-6 py-4">{student.rollNo}</td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{student.name}</th>
                                        <td className="px-6 py-4 font-semibold">{result.marks} / {exam.totalMarks}</td>
                                        <td className="px-6 py-4">{((result.marks! / exam.totalMarks) * 100).toFixed(2)}%</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">No results have been entered for this exam yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                 </div>
                 <div className="mt-8 text-right text-sm text-gray-500 dark:text-gray-400">
                    Date: {new Date().toLocaleDateString()}
                 </div>
            </div>
        </div>
    );
};

export default MeritListPage;