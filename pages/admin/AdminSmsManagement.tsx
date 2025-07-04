import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { SmsMessage, Batch } from '../../types';
import { ICONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const SMS_TEMPLATES = {
    feeReminder: 'Dear student, this is a reminder that your fee payment is due. Please complete the payment at the earliest. - Ghonse Maths Academy',
    absentAlert: 'Dear parent, your child was absent from class today. Please contact us for more information. - Ghonse Maths Academy',
    examSchedule: 'Dear students, the exam schedule has been announced. Please check the portal for details. Best of luck! - Ghonse Maths Academy',
    custom: ''
};

const AdminSmsManagement: React.FC = () => {
    const { availableBatches } = useAuth();
    const [recipientType, setRecipientType] = useState('allStudents');
    const [customRecipient, setCustomRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<SmsMessage[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    const messageLength = message.length;
    const messageParts = Math.ceil(messageLength / 160);

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
                fetchHistory(); // Refresh history
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
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">SMS Management</h1>

            {/* SMS Composer */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleSendSms} className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-200 dark:border-slate-700">Compose New SMS</h2>
                    
                    {/* Recipient Selection */}
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
                    
                    {/* Message Templates */}
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

                    {/* Message Body */}
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

                    {/* Send Button */}
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

            {/* SMS History */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">Sent SMS History</h2>
                <div className="overflow-x-auto">
                    {loadingHistory ? (
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
        </div>
    );
};

export default AdminSmsManagement;