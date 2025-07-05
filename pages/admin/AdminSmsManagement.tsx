import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { SmsMessage, Batch, Student, Exam, ExamResult, Parent } from '../../types';
import { ICONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const SMS_TEMPLATES = {
    feeReminder: 'Dear student, this is a reminder that your fee payment is due. Please complete the payment at the earliest. - Ghonse Maths Academy',
    absentAlert: 'Dear parent, your child was absent from class today. Please contact us for more information. - Ghonse Maths Academy',
    examSchedule: 'Dear students, the exam schedule has been announced. Please check the portal for details. Best of luck! - Ghonse Maths Academy',
    custom: ''
};

type ReportData = {
    student: Student;
    result: ExamResult | null;
    rank: number;
};

// Component for the new Exam Result Sender feature
const ExamResultSender: React.FC<{ 
    allExams: Exam[], 
    allStudents: Student[], 
    allParents: Parent[],
    onSmsSent: () => void 
}> = ({ allExams, allStudents, allParents, onSmsSent }) => {
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [loadingReport, setLoadingReport] = useState(false);
    const [sendModalData, setSendModalData] = useState<ReportData | null>(null);
    const [sending, setSending] = useState(false);
    const [sendMethod, setSendMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
    
    const parentMap = useMemo(() => new Map(allParents.map(p => [p.id, p])), [allParents]);

    useEffect(() => {
        const generateReport = async () => {
            if (!selectedExamId) {
                setReportData([]);
                return;
            }
            setLoadingReport(true);
            try {
                const exam = allExams.find(e => e.id === selectedExamId);
                if (!exam) return;

                const studentsInBatch = allStudents.filter(s => s.batch === exam.batch);
                const results = await api.getExamResults(exam.id);
                const resultMap = new Map(results.map(r => [r.studentId, r]));

                // Calculate ranks
                const presentResults = results.filter(r => r.marks !== null).sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0));
                const rankMap = new Map<string, number>();
                let rank = 1;
                presentResults.forEach((res, index) => {
                    if (index > 0 && res.marks! < presentResults[index - 1].marks!) {
                        rank = index + 1;
                    }
                    rankMap.set(res.studentId, rank);
                });

                const data = studentsInBatch.map(student => ({
                    student,
                    result: resultMap.get(student.id) || null,
                    rank: rankMap.get(student.id) || -1
                })).sort((a, b) => a.student.rollNo.localeCompare(b.student.rollNo));
                
                setReportData(data);

            } catch (error) {
                console.error("Failed to generate report data", error);
            } finally {
                setLoadingReport(false);
            }
        };

        generateReport();
    }, [selectedExamId, allExams, allStudents]);

    const handleSend = async (target: 'student' | 'parent' | 'both') => {
        if (!sendModalData) return;
        setSending(true);

        const { student, result, rank } = sendModalData;
        const exam = allExams.find(e => e.id === selectedExamId);
        if(!exam) {
            setSending(false);
            return;
        }

        const parent = parentMap.get(student.parentId);
        
        let message = `Ghonse Maths Academy\n`;
        message += `Roll: ${student.rollNo}\n`;
        message += `Name: ${student.name}\n`;
        message += `Date: ${new Date(exam.date).toLocaleDateString('en-GB')}\n`;
        message += `Exam: ${exam.name}\n`;
        
        if (result && result.marks !== null) {
            message += `Status: Present\n`;
            message += `Marks Obt: ${result.marks}/${exam.totalMarks}\n`;
            message += `Rank: ${rank}\n`;
        } else {
            message += `Status: Absent\n`;
            message += `Marks Obt: 0/${exam.totalMarks}\n`;
            message += `Rank: -1\n`;
        }
        message += `Team GMC, A'nagar.`;

        if (sendMethod === 'whatsapp') {
            const encodedMessage = encodeURIComponent(message);
            const openWhatsapp = (mobile: string) => {
                if (!/^\d{10}$/.test(mobile)) {
                    alert(`Invalid 10-digit mobile number: ${mobile}`);
                    return;
                }
                const url = `https://wa.me/91${mobile}?text=${encodedMessage}`;
                window.open(url, '_blank');
            };

            if (target === 'student' || target === 'both') {
                openWhatsapp(student.studentMobile);
            }
            if (target === 'parent' || target === 'both') {
                if (parent?.mobile) {
                  openWhatsapp(parent.mobile);
                } else if (target === 'parent') {
                  alert(`Parent mobile not found for ${student.name}`);
                }
            }
        } else { // sendMethod is 'sms'
            const mobileNumbers: string[] = [];
            if (target === 'student' || target === 'both') {
                if (student.studentMobile && /^\d{10}$/.test(student.studentMobile)) {
                    mobileNumbers.push(student.studentMobile);
                }
            }
            if (target === 'parent' || target === 'both') {
                if (parent?.mobile && /^\d{10}$/.test(parent.mobile)) {
                    mobileNumbers.push(parent.mobile);
                }
            }
            
            const uniqueMobileNumbers = [...new Set(mobileNumbers)];

            if (uniqueMobileNumbers.length === 0) {
                alert('No valid mobile number found for the selected recipient(s).');
                setSending(false);
                return;
            }
        
            let successes = 0;
            let failures = 0;
            for (const mobile of uniqueMobileNumbers) {
                try {
                    await api.sendSms(mobile, message);
                    successes++;
                } catch (e) {
                    failures++;
                    console.error(`SMS send failure to ${mobile}`, e);
                }
            }
        
            let alertMessage = '';
            if (successes > 0) alertMessage += `Text SMS sent to ${successes} recipient(s).`;
            if (failures > 0) alertMessage += `\nFailed to send to ${failures} recipient(s). Check console for details.`;
            alert(alertMessage.trim());
        
            if (successes > 0) {
                onSmsSent();
            }
        }
        
        setSending(false);
        setSendModalData(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="exam-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Exam</label>
                <select 
                    id="exam-select"
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                     className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/2 p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                    <option value="">-- Choose an Exam --</option>
                    {allExams.map(exam => <option key={exam.id} value={exam.id}>{exam.name} ({exam.batch})</option>)}
                </select>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Student Results</h3>
                 <div className="overflow-x-auto">
                    {loadingReport ? (
                        <p>Loading results...</p>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Roll No</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Marks</th>
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row) => (
                                    <tr key={row.student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-2">{row.student.rollNo}</td>
                                        <td className="px-4 py-2 font-medium">{row.student.name}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${row.result?.marks !== null && row.result?.marks !== undefined ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {row.result?.marks !== null && row.result?.marks !== undefined ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{row.result?.marks ?? 'AB'} / {allExams.find(e => e.id === selectedExamId)?.totalMarks}</td>
                                        <td className="px-4 py-2">{row.rank > 0 ? row.rank : '-'}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => setSendModalData(row)} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs font-semibold flex items-center gap-1 mx-auto">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                                Send
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {reportData.length === 0 && !loadingReport && selectedExamId && (
                        <p className="py-4 text-center">No students found for this exam's batch.</p>
                    )}
                </div>
            </div>
            
            {sendModalData && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">Send Report</h2>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">For: <strong>{sendModalData.student.name}</strong></p>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Choose Method</label>
                            <div className="flex w-full bg-gray-200 dark:bg-slate-700 rounded-lg p-1">
                                <button 
                                    onClick={() => setSendMethod('whatsapp')}
                                    className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${sendMethod === 'whatsapp' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    {ICONS.whatsapp} WhatsApp
                                </button>
                                <button 
                                    onClick={() => setSendMethod('sms')}
                                    className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${sendMethod === 'sms' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    {ICONS.sms} Text SMS
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Choose Recipient(s)</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {sendMethod === 'whatsapp' 
                                    ? "This will open WhatsApp with a pre-filled message." 
                                    : "This will send a standard Text SMS from the system."
                                }
                            </p>
                            <div className="flex flex-col sm:flex-row justify-around gap-3">
                                <button onClick={() => handleSend('student')} disabled={sending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">Student</button>
                                <button onClick={() => handleSend('parent')} disabled={sending} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400">Parent</button>
                                <button onClick={() => handleSend('both')} disabled={sending} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">Both</button>
                            </div>
                        </div>

                        <div className="text-center mt-6">
                            <button onClick={() => setSendModalData(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};


// Component for the original broadcast SMS feature
const BroadcastComposer: React.FC<{ availableBatches: Batch[], onSmsSent: () => void }> = ({ availableBatches, onSmsSent }) => {
    const [recipientType, setRecipientType] = useState('allStudents');
    const [customRecipient, setCustomRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const messageLength = message.length;
    const messageParts = Math.ceil(messageLength / 160);
    
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateKey = e.target.value as keyof typeof SMS_TEMPLATES;
        setMessage(SMS_TEMPLATES[templateKey] || '');
    };

    const handleSendSms = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) {
            alert('Message cannot be empty.');
            return;
        }

        let finalRecipient = '';
        switch(recipientType) {
            case 'allStudents': finalRecipient = 'All Students'; break;
            case 'allTeachers': finalRecipient = 'All Teachers'; break;
            case 'batch': 
                if (!customRecipient) {
                    alert('Please select a batch.');
                    return;
                }
                finalRecipient = `Batch: ${customRecipient}`; 
                break;
            case 'singleNumber': 
                if (!customRecipient.match(/^\d{10}$/)) {
                    alert('Please enter a valid 10-digit mobile number.');
                    return;
                }
                finalRecipient = customRecipient;
                break;
            default: return;
        }
        
        setIsSending(true);
        try {
            const success = await api.sendSms(finalRecipient, message);
            if (success) {
                alert('SMS sent successfully!');
                setMessage('');
                setCustomRecipient('');
                setRecipientType('allStudents');
                onSmsSent(); // Refresh history
            } else {
                alert('Failed to send SMS.');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            alert('An error occurred while sending the SMS.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <form onSubmit={handleSendSms} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-200 dark:border-slate-700">Compose New SMS</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient</label>
                    <div className="flex flex-wrap gap-4 items-center">
                        <select 
                            value={recipientType} 
                            onChange={e => { setRecipientType(e.target.value); setCustomRecipient(''); }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="allStudents">All Students</option>
                            <option value="allTeachers">All Teachers</option>
                            <option value="batch">Specific Batch</option>
                            <option value="singleNumber">Single Number</option>
                        </select>
                        {recipientType === 'batch' && (
                            <select 
                                value={customRecipient} 
                                onChange={e => setCustomRecipient(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="">Select Batch</option>
                                {availableBatches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                            </select>
                        )}
                        {recipientType === 'singleNumber' && (
                            <input 
                                type="tel"
                                placeholder="Enter 10-digit number"
                                value={customRecipient}
                                onChange={e => setCustomRecipient(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Use a Template (Optional)</label>
                    <select 
                        id="template-select"
                        onChange={handleTemplateChange}
                        className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/2 p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="custom">-- Custom Message --</option>
                        <option value="feeReminder">Fee Reminder</option>
                        <option value="absentAlert">Absent Alert</option>
                        <option value="examSchedule">Exam Schedule</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="message-body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                    <textarea 
                        id="message-body"
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Type your message here..."
                    ></textarea>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {messageLength} characters / {messageParts} SMS
                    </div>
                </div>
                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isSending || !message}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                         {isSending ? 'Sending...' : 'Send SMS'}
                         {!isSending && <div className="ml-2 w-5 h-5">{ICONS.sms}</div>}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Component for SMS History
const SmsHistory: React.FC<{ history: SmsMessage[], loading: boolean }> = ({ history, loading }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">Sent SMS History</h2>
        <div className="overflow-x-auto">
            {loading ? (
                <p>Loading history...</p>
            ) : (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Recipient</th>
                            <th className="px-6 py-3">Message</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(sms => (
                            <tr key={sms.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(sms.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sms.recipient}</td>
                                <td className="px-6 py-4 max-w-sm truncate" title={sms.message}>{sms.message}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${sms.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {sms.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);


const AdminSmsManagement: React.FC = () => {
    const { availableBatches } = useAuth();
    const [view, setView] = useState<'broadcast' | 'exam_results'>('broadcast');

    const [history, setHistory] = useState<SmsMessage[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    // Data for ExamResultSender
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allParents, setAllParents] = useState<Parent[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const data = await api.getSmsHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch SMS history:", error);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    useEffect(() => {
        const loadAllData = async () => {
            setDataLoading(true);
            try {
                const [exams, students, parents] = await Promise.all([
                    api.getExams(),
                    api.getStudents(),
                    api.getParents()
                ]);
                setAllExams(exams.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setAllStudents(students);
                setAllParents(parents);
            } catch(e) {
                console.error("Failed to load data for SMS manager", e);
            } finally {
                setDataLoading(false);
            }
        }
        loadAllData();
    }, []);

    const activeTabClass = "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600";

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">SMS Management</h1>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setView('broadcast')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${view === 'broadcast' ? activeTabClass : inactiveTabClass}`}>
                        Broadcast SMS
                    </button>
                    <button onClick={() => setView('exam_results')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${view === 'exam_results' ? activeTabClass : inactiveTabClass}`}>
                        Exam Result Sender
                    </button>
                </nav>
            </div>
            
            <div className="mt-6">
                {view === 'broadcast' && (
                    <div className="space-y-8">
                        <BroadcastComposer availableBatches={availableBatches} onSmsSent={fetchHistory} />
                        <SmsHistory history={history} loading={loadingHistory} />
                    </div>
                )}
                {view === 'exam_results' && (
                     <div>
                        {dataLoading ? <p>Loading data...</p> : 
                            <ExamResultSender 
                                allExams={allExams} 
                                allStudents={allStudents} 
                                allParents={allParents} 
                                onSmsSent={fetchHistory}
                            />
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSmsManagement;