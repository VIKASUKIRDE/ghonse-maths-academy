import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { Student, Payment } from '../../types';
import PaymentFormModal from './FeePaymentModal'; // Re-using the upgraded modal

type Transaction = {
    date: string;
    particulars: string;
    debit: number;
    credit: number;
    paymentRef?: Payment;
};

const FeeReceiptPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        paymentToEdit: Payment | null;
    }>({ isOpen: false, paymentToEdit: null });
    
    const [paymentToPrint, setPaymentToPrint] = useState<Payment | null>(null);


    const fetchStudentData = useCallback(async () => {
        if (!studentId) {
            setError("Student ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await api.getStudentById(studentId);
            if (data) {
                setStudent(data);
            } else {
                setError("Student not found.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch student data.");
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);
    
    useEffect(() => {
        if (paymentToPrint) {
            document.body.classList.add('print-mode-single');
            
            const handleAfterPrint = () => {
                document.body.classList.remove('print-mode-single');
                setPaymentToPrint(null);
                window.removeEventListener('afterprint', handleAfterPrint);
            };

            window.addEventListener('afterprint', handleAfterPrint);

            // Timeout to allow React to re-render with the new class on body
            const timer = setTimeout(() => {
                window.print();
            }, 50);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
                document.body.classList.remove('print-mode-single');
            };
        }
    }, [paymentToPrint]);

    const transactions = useMemo<Transaction[]>(() => {
        if (!student) return [];

        const allTransactions: Transaction[] = [];

        // 1. Total Fee (Debit)
        allTransactions.push({
            date: student.fees.payments?.[0]?.date || new Date().toISOString(), // Use first payment date or today
            particulars: 'Total Course Fees',
            debit: student.fees.total,
            credit: 0
        });

        // 2. Concession (Credit)
        if (student.fees.concession > 0) {
            allTransactions.push({
                date: student.fees.payments?.[0]?.date || new Date().toISOString(),
                particulars: 'Fee Concession',
                debit: 0,
                credit: student.fees.concession
            });
        }
        
        // 3. Payments (Credit)
        student.fees.payments?.forEach(p => {
            allTransactions.push({
                date: p.date,
                particulars: `${p.particulars} (Via ${p.mode})`,
                debit: 0,
                credit: p.amount,
                paymentRef: p
            });
        });

        // Sort by date
        return allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    }, [student]);

    const handleSavePayment = async (studentId: string, paymentData: Omit<Payment, 'id'>, paymentIdToUpdate: string | null) => {
        try {
            let updatedStudent;
            if (paymentIdToUpdate) {
                const fullPaymentData: Payment = { ...paymentData, id: paymentIdToUpdate };
                updatedStudent = await api.updatePayment(studentId, fullPaymentData);
            } else {
                updatedStudent = await api.addPayment(studentId, paymentData);
            }
            setStudent(updatedStudent);
            setModalState({ isOpen: false, paymentToEdit: null });
        } catch(err) {
            console.error("Failed to save payment", err);
            throw err;
        }
    };
    
    const handleDeletePayment = async (paymentId: string) => {
        if (!student) return;
        if(window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
            try {
                const updatedStudent = await api.deletePayment(student.id, paymentId);
                setStudent(updatedStudent); // Directly set the updated student from API response
            } catch (err: any) {
                alert(`Failed to delete payment: ${err.message}`);
            }
        }
    };

    const handlePrint = () => window.print();

    if (loading) return <div className="p-6">Loading student fee details...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!student) return <div className="p-6">No student data available.</div>;

    let runningBalance = 0;
    
    return (
        <div>
            <style>{`
                @media print {
                    /* In normal print mode (full statement), hide the single receipt div */
                    body:not(.print-mode-single) .print-only-single {
                        display: none;
                    }
                    
                    /* In single receipt print mode, hide the full statement div */
                    body.print-mode-single .printable-area {
                        display: none;
                    }

                    /* General visibility for what's being printed */
                    body.print-mode-single .print-only-single, body.print-mode-single .print-only-single * {
                        visibility: visible;
                    }
                    body:not(.print-mode-single) .printable-area, body:not(.print-mode-single) .printable-area * {
                        visibility: visible;
                    }

                    /* Hide everything else */
                    body * {
                        visibility: hidden;
                    }
                    
                    /* Reset position and size for the printed content */
                    .printable-area, .print-only-single {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                    }
                }
            `}</style>
            
            <div className="printable-area">
                <div className="no-print flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/fees')} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Fee List</button>
                    <div className="flex gap-4">
                        <button onClick={() => setModalState({ isOpen: true, paymentToEdit: null })} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add New Payment</button>
                        <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Statement</button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
                    <header className="text-center mb-6 border-b-2 border-black pb-4">
                        <h1 className="text-3xl font-bold">Ghonse Maths Academy</h1>
                        <p className="text-md">Rasane Nagar Road, Savedi</p>
                        <h2 className="text-2xl font-semibold mt-4">Fees Statement</h2>
                    </header>

                    <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div><strong>Roll No:</strong> {student.rollNo}</div>
                        <div><strong>Name:</strong> {student.name}</div>
                        <div><strong>Division:</strong> {student.division}</div>
                        <div><strong>Gender:</strong> {student.gender}</div>
                        <div><strong>Category:</strong> {student.category}</div>
                        <div><strong>Type:</strong> {student.type}</div>
                        <div><strong>Student Mob:</strong> {student.studentMobile}</div>
                        <div><strong>Parent Mob:</strong> {student.parentMobile}</div>
                        <div className="col-span-2 md:col-span-4"><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    </section>

                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Particulars</th>
                                <th className="px-4 py-2 text-right">Debit (₹)</th>
                                <th className="px-4 py-2 text-right">Credit (₹)</th>
                                <th className="px-4 py-2 text-right">Balance (₹)</th>
                                <th className="px-4 py-2 no-print text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => {
                                runningBalance += tx.debit - tx.credit;
                                return (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 font-medium">{tx.particulars}</td>
                                        <td className="px-4 py-2 text-right">{tx.debit > 0 ? tx.debit.toLocaleString() : '-'}</td>
                                        <td className="px-4 py-2 text-right">{tx.credit > 0 ? tx.credit.toLocaleString() : '-'}</td>
                                        <td className="px-4 py-2 text-right font-semibold">{runningBalance.toLocaleString()}</td>
                                        <td className="px-4 py-2 no-print text-center">
                                            {tx.paymentRef && (
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => setPaymentToPrint(tx.paymentRef!)} className="text-green-600 hover:underline text-xs">Print</button>
                                                    <button onClick={() => setModalState({ isOpen: true, paymentToEdit: tx.paymentRef! })} className="text-blue-500 hover:underline text-xs">Edit</button>
                                                    <button onClick={() => handleDeletePayment(tx.paymentRef!.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    
                    <footer className="mt-8 pt-4 border-t-2 border-black grid grid-cols-2 gap-4">
                        <div className="text-sm">
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                        </div>
                        <div className="text-right font-semibold text-sm space-y-1">
                            <div className="flex justify-between"><span>Total Fees:</span><span>₹{student.fees.total.toLocaleString()}</span></div>
                            <div className="flex justify-between text-purple-600"><span>Concession:</span><span>₹{student.fees.concession.toLocaleString()}</span></div>
                            <div className="flex justify-between text-green-600"><span>Total Paid:</span><span>₹{student.fees.collected.toLocaleString()}</span></div>
                            <hr className="my-1 border-gray-400 dark:border-gray-500"/>
                            <div className="flex justify-between text-lg text-red-600"><span>Balance Due:</span><span>₹{student.fees.pending.toLocaleString()}</span></div>
                        </div>
                    </footer>
                </div>
            </div>
            
            {modalState.isOpen && (
                <PaymentFormModal
                    student={student}
                    paymentToEdit={modalState.paymentToEdit}
                    onSave={handleSavePayment}
                    onCancel={() => setModalState({ isOpen: false, paymentToEdit: null })}
                />
            )}
            
            <div className="print-only-single">
                {paymentToPrint && student && (
                    <div className="bg-white p-8">
                        <header className="text-center mb-8 border-b-2 border-black pb-4">
                            <h1 className="text-3xl font-bold">Ghonse Maths Academy</h1>
                            <p className="text-md">Rasane Nagar Road, Savedi</p>
                            <h2 className="text-2xl font-semibold mt-4">Payment Receipt</h2>
                        </header>
                        <div className="grid grid-cols-2 text-sm mb-8">
                            <div>
                                <p><strong>Receipt No:</strong> {paymentToPrint.id}</p>
                                <p><strong>Student Name:</strong> {student.name}</p>
                                <p><strong>Roll No:</strong> {student.rollNo}</p>
                            </div>
                            <div className="text-right">
                                <p><strong>Payment Date:</strong> {new Date(paymentToPrint.date).toLocaleDateString()}</p>
                                <p><strong>Batch:</strong> {student.batch}</p>
                            </div>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border">Sr.No</th>
                                    <th className="px-4 py-2 border">Particulars</th>
                                    <th className="px-4 py-2 border">Mode</th>
                                    <th className="px-4 py-2 border text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-4 py-2 border">1</td>
                                    <td className="px-4 py-2 border font-medium">{paymentToPrint.particulars}</td>
                                    <td className="px-4 py-2 border">{paymentToPrint.mode}</td>
                                    <td className="px-4 py-2 border text-right font-semibold">{paymentToPrint.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 border text-right font-bold">Total</td>
                                    <td className="px-4 py-2 border text-right font-bold">₹{paymentToPrint.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-sm text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span>Total Fee:</span>
                                    <span>₹{student.fees.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Paid (including this receipt):</span>
                                    <span>₹{student.fees.collected.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base border-t mt-2 pt-2">
                                    <span>Balance Due:</span>
                                    <span>₹{student.fees.pending.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-24 text-right text-sm">
                            <div className="inline-block border-t-2 border-black px-12 py-2">
                                Authorised Signature
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeeReceiptPage;
