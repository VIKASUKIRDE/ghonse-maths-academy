import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../../constants';
import { api } from '../../services/mockApi';
import { Student, Parent } from '../../types';
import StudentListReport from './StudentListReport';
import MailingLabelsReport from './MailingLabelsReport';
import { ICardReport } from './ICardReport';
import { FeeCollectionStatement } from './FeeCollectionStatement';
import BalanceStatement from './BalanceStatement';
import ProgressReportSender from './ProgressReportSender';
import { useAuth } from '../../hooks/useAuth';
import AttendanceReport from './AttendanceReport';

type EnrichedStudent = Student & { parentName: string };

export const AdminReports: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'main' | 'studentList' | 'mailingLabels' | 'iCardReport' | 'feeCollection' | 'balanceStatement' | 'progressReportSender' | 'attendanceReport'>('main');
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allParents, setAllParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);

    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (!user?.currentBatch) {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [studentData, parentData] = await Promise.all([
                    api.getStudentsByBatch(user.currentBatch!), 
                    api.getParents()
                ]); 
                setAllStudents(studentData);
                setAllParents(parentData);
            } catch (error) {
                console.error("Failed to fetch data for reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [user?.currentBatch]);
    
    const enrichedStudents = useMemo<EnrichedStudent[]>(() => {
        const parentMap = new Map(allParents.map(p => [p.id, p.name]));
        return allStudents.map(student => ({
            ...student,
            parentName: parentMap.get(student.parentId) || 'N/A'
        }));
    }, [allStudents, allParents]);

    // All filters are removed, so the list of students for reports is always all students in the current batch.
    const filteredStudents = enrichedStudents;

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleGenerateStudentList = () => {
        if (filteredStudents.length === 0) {
            showToast("No students found in the current batch.");
            return;
        }
        setView('studentList');
    };
    
    const handleGenerateMailingLabels = () => {
        if (filteredStudents.length === 0) {
            showToast("No students found in the current batch.");
            return;
        }
        setView('mailingLabels');
    };
    
    const handleGenerateICards = () => {
        if (filteredStudents.length === 0) {
            showToast("No students found in the current batch.");
            return;
        }
        setView('iCardReport');
    };

    if (view === 'studentList') {
        const reportTitle = `Student List for ${user?.currentBatch} Batch`;
        return <StudentListReport students={filteredStudents} onBack={() => setView('main')} reportTitle={reportTitle} />;
    }
    
    if (view === 'mailingLabels') {
        const reportTitle = `Mailing Labels for ${user?.currentBatch} Batch`;
        return <MailingLabelsReport students={filteredStudents} onBack={() => setView('main')} reportTitle={reportTitle} />;
    }
    
    if (view === 'iCardReport') {
        return <ICardReport students={filteredStudents} onBack={() => setView('main')} />;
    }

    if (view === 'feeCollection') {
        return <FeeCollectionStatement students={enrichedStudents} onBack={() => setView('main')} />;
    }
    
    if (view === 'balanceStatement') {
        return <BalanceStatement students={enrichedStudents} onBack={() => setView('main')} />;
    }
    
    if (view === 'attendanceReport') {
        return <AttendanceReport students={filteredStudents} onBack={() => setView('main')} />;
    }

    if (view === 'progressReportSender') {
        return <ProgressReportSender students={enrichedStudents} onBack={() => setView('main')} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Reports</h1>
            
            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">Student List Report</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Generate a printable list of all students in the current batch with their contact details and address.</p>
                    <button 
                        onClick={handleGenerateStudentList} 
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        Generate List
                    </button>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">Mailing Labels</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Create printable mailing labels (10 per page) with parent name, address, and roll no for the current batch.</p>
                    <button 
                        onClick={handleGenerateMailingLabels} 
                        className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300"
                        disabled={loading}
                    >
                        Generate Labels
                    </button>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">I-Card Generator</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Create printable, colored I-Cards for all students in the current batch with photos and essential details.</p>
                    <button 
                        onClick={handleGenerateICards} 
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-orange-300"
                        disabled={loading}
                    >
                        Generate I-Cards
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">Fee Collection Statement</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Generate a report of all fees collected from the current batch within a selected date range.</p>
                    <button 
                        onClick={() => setView('feeCollection')} 
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center space-x-2"
                        disabled={loading}
                    >
                       {ICONS.fees} <span>Generate Statement</span>
                    </button>
                </div>

                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">Balance Statement</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Generate a list of students from the current batch based on their pending fee amount and status.</p>
                    <button 
                        onClick={() => setView('balanceStatement')} 
                        className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 disabled:bg-purple-300 flex items-center justify-center space-x-2"
                        disabled={loading}
                    >
                        {ICONS.reports} <span>Generate Statement</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">Progress Report Sender</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Send individual student progress reports to parents via WhatsApp for the current batch.</p>
                    <button 
                        onClick={() => setView('progressReportSender')} 
                        className="w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-300 flex items-center justify-center space-x-2"
                        disabled={loading}
                    >
                        {ICONS.whatsapp} <span>Open Sender</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-2">Attendance Report</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">Generate a date-wise attendance percentage report for all students in the current batch.</p>
                    <button
                        onClick={() => setView('attendanceReport')}
                        className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 disabled:bg-rose-300 flex items-center justify-center space-x-2"
                        disabled={loading}
                    >
                        {ICONS.attendance} <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-gray-900 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">
                    {toastMessage}
                </div>
            )}
             <style>{`
                .animate-fade-in-out {
                    animation: fadeInOut 3s forwards;
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); }
                }
            `}</style>
        </div>
    );
};