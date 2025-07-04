import React from 'react';
import { Student } from '../../types';
import { APP_NAME } from '../../constants';

interface StudentListReportProps {
    students: Student[];
    reportTitle: string;
    onBack: () => void;
}

const StudentListReport: React.FC<StudentListReportProps> = ({ students, reportTitle, onBack }) => {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print List</button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden printable-area p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print-header">{APP_NAME}</h1>
                    <p className="text-md text-slate-600 dark:text-slate-500">Rasane Nagar Road, Savedi</p>
                    <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2">{reportTitle}</h2>
                </div>
                
                 <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Sr.No</th>
                                <th scope="col" className="px-6 py-3">Roll No</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Gender</th>
                                <th scope="col" className="px-6 py-3">Batch</th>
                                <th scope="col" className="px-6 py-3">Student Mobile</th>
                                <th scope="col" className="px-6 py-3">Parent Mobile</th>
                                <th scope="col" className="px-6 py-3">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? students.map((student, index) => (
                                <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{student.rollNo}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{student.name}</th>
                                    <td className="px-6 py-4">{student.gender}</td>
                                    <td className="px-6 py-4">{student.batch}</td>
                                    <td className="px-6 py-4">{student.studentMobile}</td>
                                    <td className="px-6 py-4">{student.parentMobile}</td>
                                    <td className="px-6 py-4">{student.address}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">No students found matching filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
                 <div className="mt-8 flex justify-between items-end text-sm text-gray-500 dark:text-gray-400">
                    <div>Date: {new Date().toLocaleDateString()}</div>
                    <div>Total Students: {students.length}</div>
                 </div>
            </div>
        </div>
    );
};

export default StudentListReport;