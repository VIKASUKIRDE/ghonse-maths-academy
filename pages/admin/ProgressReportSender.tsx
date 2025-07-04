import React, { useState } from 'react';
import { Student } from '../../types';
import { api } from '../../services/mockApi';
import { APP_NAME, ICONS } from '../../constants';

type EnrichedStudent = Student & { parentName: string };

interface ProgressReportSenderProps {
    students: EnrichedStudent[];
    onBack: () => void;
}

const ProgressReportSender: React.FC<ProgressReportSenderProps> = ({ students, onBack }) => {
    const [sendingId, setSendingId] = useState<string | null>(null);

    const handleSendWhatsAppReport = async (student: EnrichedStudent) => {
        setSendingId(student.id);
        try {
            const results = await api.getStudentResults(student.id);
            const parentMobile = student.parentMobile;
            
            if (!parentMobile || !/^\d{10}$/.test(parentMobile)) {
                alert(`A valid 10-digit parent mobile number was not found for ${student.name}.`);
                return;
            }

            let reportText = `*${APP_NAME} - Progress Report*\n\n`;
            reportText += `*Student:* ${student.name}\n`;
            reportText += `*Roll No:* ${student.rollNo}\n\n`;
            reportText += `*Exam Performance:*\n`;

            if (results && results.length > 0 && results.some(r => r.marks !== null)) {
                results.forEach(r => {
                    if (r.marks !== null) {
                        reportText += `• *${r.examName || 'Exam'}*: ${r.marks} / ${r.totalMarks || 'N/A'}\n`;
                    }
                });
            } else {
                reportText += `No exam results available yet.\n`;
            }

            reportText += `\nThank you,\n${APP_NAME}`;

            const encodedText = encodeURIComponent(reportText);
            const whatsappUrl = `https://wa.me/91${parentMobile}?text=${encodedText}`;
            
            window.open(whatsappUrl, '_blank');

        } catch (error) {
            console.error("Failed to generate report for WhatsApp:", error);
            alert("Could not generate the report. Please try again.");
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Send Progress Reports</h1>
                <div></div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Roll No</th>
                                <th className="px-6 py-3">Student Name</th>
                                <th className="px-6 py-3">Parent Name</th>
                                <th className="px-6 py-3">Parent Mobile</th>
                                <th className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">{student.rollNo}</td>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.name}</th>
                                    <td className="px-6 py-4">{student.parentName}</td>
                                    <td className="px-6 py-4">{student.parentMobile}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleSendWhatsAppReport(student)}
                                            disabled={sendingId === student.id}
                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center space-x-2 w-32"
                                            title={`Send report to ${student.parentName}'s WhatsApp`}
                                        >
                                            {sendingId === student.id ? (
                                                <span>Loading...</span>
                                            ) : (
                                                <>
                                                    {ICONS.whatsapp}
                                                    <span>Send</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {students.length === 0 && (
                        <p className="text-center p-4">No students found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressReportSender;
