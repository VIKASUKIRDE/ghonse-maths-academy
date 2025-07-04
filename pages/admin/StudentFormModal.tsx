import React, { useEffect, useState } from 'react';
import { Student, BatchName, StudentCategory, Gender, StudentType, Division } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const StudentFormModal = ({ 
    currentBatch, 
    studentToEdit,
    onSave, 
    onCancel 
}: { 
    currentBatch: BatchName; 
    studentToEdit: (Student & { parentName?: string }) | null;
    onSave: (data: Omit<Student, 'id' | 'rollNo' | 'parentId'> & { parentName: string }, studentId: string | null) => void; 
    onCancel: () => void; 
}) => {
    const isEditMode = !!studentToEdit;
    const { availableBatches } = useAuth();

    // State initialization for form fields
    const [name, setName] = useState('');
    const [parentName, setParentName] = useState('');
    const [address, setAddress] = useState('');
    const [studentMobile, setStudentMobile] = useState('');
    const [parentMobile, setParentMobile] = useState('');
    const [tenthMarks, setTenthMarks] = useState<number | ''>(0);
    const [category, setCategory] = useState<StudentCategory>('General');
    const [customCategory, setCustomCategory] = useState('');
    const [gender, setGender] = useState(Gender.MALE);
    const [type, setType] = useState(StudentType.REGULAR);
    const [batch, setBatch] = useState(currentBatch);
    const [division, setDivision] = useState(Division.A);
    const [batchTiming, setBatchTiming] = useState('Morning');
    const [customBatchTiming, setCustomBatchTiming] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [remarks, setRemarks] = useState('');
    const [totalFees, setTotalFees] = useState<number | ''>(0);
    const [concession, setConcession] = useState<number | ''>(0);

    const standardCategories = ['General', 'OBC', 'SC', 'ST', 'NT', 'VJNT', 'Other'];
    
    const toTitleCase = (str: string): string => {
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    };

    useEffect(() => {
        if (isEditMode && studentToEdit) {
            setName(studentToEdit.name);
            setParentName(studentToEdit.parentName || '');
            setAddress(studentToEdit.address);
            setStudentMobile(studentToEdit.studentMobile);
            setParentMobile(studentToEdit.parentMobile);
            setTenthMarks(studentToEdit.tenthMarks);
            if (standardCategories.includes(studentToEdit.category)) {
                setCategory(studentToEdit.category);
                setCustomCategory('');
            } else {
                setCategory('Other');
                setCustomCategory(studentToEdit.category);
            }
            setGender(studentToEdit.gender);
            setType(studentToEdit.type);
            setBatch(studentToEdit.batch);
            setDivision(studentToEdit.division);
            if (studentToEdit.batchTiming === 'Morning' || studentToEdit.batchTiming === 'Evening') {
                setBatchTiming(studentToEdit.batchTiming);
                setCustomBatchTiming('');
            } else {
                setBatchTiming('Custom');
                setCustomBatchTiming(studentToEdit.batchTiming || '');
            }
            setPhotoPreview(studentToEdit.photoUrl);
            setRemarks(studentToEdit.remarks);
            setTotalFees(studentToEdit.fees.total);
            setConcession(studentToEdit.fees.concession);
        } else {
             // Reset form for "Add" mode
            setName('');
            setParentName('');
            setAddress('');
            setStudentMobile('');
            setParentMobile('');
            setTenthMarks(0);
            setCategory('General');
            setCustomCategory('');
            setGender(Gender.MALE);
            setType(StudentType.REGULAR);
            setBatch(currentBatch);
            setDivision(Division.A);
            setBatchTiming('Morning');
            setCustomBatchTiming('');
            setPhotoPreview(null);
            setRemarks('');
            setTotalFees(0);
            setConcession(0);
        }
    }, [studentToEdit, currentBatch, isEditMode]);

    useEffect(() => {
        // Auto-fill parent name from student name
        if (!isEditMode && name) {
            const nameParts = name.trim().split(' ');
            let extractedParentName = '';
            if (nameParts.length >= 2) {
                // e.g., "Rohan Anil Sharma" -> "Anil Sharma"
                // e.g., "Priya Sharma" -> "Sharma"
                extractedParentName = nameParts.slice(1).join(' ');
            }
            
            if (extractedParentName) {
                setParentName(toTitleCase('Shri ' + extractedParentName));
            } else {
                setParentName('');
            }
        }
    }, [name, isEditMode]);

    useEffect(() => {
        // Auto-fill fee when batch changes for a new student, or when an existing student's batch is changed.
        const isInitialLoadForEdit = isEditMode && studentToEdit && studentToEdit.batch === batch;
        if (isInitialLoadForEdit) {
            return; // Don't override the existing fee on initial load
        }

        const selectedBatchData = availableBatches.find(b => b.name === batch);
        if (selectedBatchData) {
            setTotalFees(selectedBatchData.fee);
        }
    }, [batch, availableBatches, isEditMode, studentToEdit]);


    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
            setPhotoPreview(previewUrl);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalCategory = category === 'Other' ? customCategory : category;
        if (category === 'Other' && !customCategory) {
            alert('Please specify the custom category.'); return;
        }

        const finalBatchTiming = batchTiming === 'Custom' ? customBatchTiming : batchTiming;
        if (batchTiming === 'Custom' && !customBatchTiming) {
            alert('Please specify the custom batch timing.'); return;
        }

        const collected = isEditMode && studentToEdit ? studentToEdit.fees.collected : 0;

        const finalTotalFees = Number(totalFees) || 0;
        const finalConcession = Number(concession) || 0;
        const finalTenthMarks = Number(tenthMarks) || 0;

        const studentFormData: Omit<Student, 'id' | 'rollNo' | 'parentId'> & { parentName: string } = {
            name, 
            parentName,
            address, 
            studentMobile, 
            parentMobile, 
            tenthMarks: finalTenthMarks,
            category: finalCategory, 
            gender, 
            type, 
            batch, 
            division,
            batchTiming: finalBatchTiming,
            photoUrl: photoPreview || 'https://picsum.photos/seed/new-student/200',
            remarks,
            fees: {
                total: finalTotalFees,
                collected: collected,
                concession: finalConcession,
                overdue: isEditMode && studentToEdit ? studentToEdit.fees.overdue : 0,
                pending: finalTotalFees - finalConcession - collected,
                payments: (isEditMode && studentToEdit?.fees.payments) || []
            }
        };
        onSave(studentFormData, studentToEdit ? studentToEdit.id : null);
    };

    const formRowClass = "grid grid-cols-1 md:grid-cols-2 gap-4";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const selectClass = inputClass + " pr-10";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                    {isEditMode ? 'Edit Student Details' : `Add New Student`}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={formRowClass}>
                         <div><label className={labelClass}>Student Full Name</label><input type="text" value={name} onChange={e => setName(toTitleCase(e.target.value))} className={inputClass} required /></div>
                         <div><label className={labelClass}>Parent Full Name</label><input type="text" value={parentName} onChange={e => setParentName(toTitleCase(e.target.value))} className={inputClass} required /></div>
                    </div>
                    <div><label className={labelClass}>Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} className={inputClass} required /></div>
                     <div className={formRowClass}>
                         <div><label className={labelClass}>Student Mobile</label><input type="tel" value={studentMobile} onChange={e => setStudentMobile(e.target.value)} className={inputClass} required /></div>
                         <div><label className={labelClass}>Parent Mobile</label><input type="tel" value={parentMobile} onChange={e => setParentMobile(e.target.value)} className={inputClass} required /></div>
                    </div>
                     <div className={formRowClass}>
                        <div>
                            <label className={labelClass}>Batch</label>
                            <select value={batch} onChange={e => setBatch(e.target.value as BatchName)} className={selectClass} required>
                                {availableBatches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Batch Timing</label>
                            <select value={batchTiming} onChange={e => setBatchTiming(e.target.value)} className={selectClass}>
                                <option value="Morning">Morning</option>
                                <option value="Evening">Evening</option>
                                <option value="Custom">Custom</option>
                            </select>
                            {batchTiming === 'Custom' && (
                                <input type="text" value={customBatchTiming} onChange={e => setCustomBatchTiming(e.target.value)} className={inputClass + " mt-2"} placeholder="e.g., 4 PM - 6 PM" required />
                            )}
                        </div>
                    </div>
                     <div className={formRowClass}>
                         <div><label className={labelClass}>Total Fees (₹)</label><input type="number" value={totalFees} onChange={e => setTotalFees(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} required /></div>
                         <div><label className={labelClass}>Fee Concession (₹)</label><input type="number" value={concession} onChange={e => setConcession(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} /></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className={labelClass}>Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
                                {standardCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {category === 'Other' && (
                                <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className={inputClass + " mt-2"} placeholder="Specify category" required />
                            )}
                        </div>
                        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value as Gender)} className={selectClass}>{Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                        <div><label className={labelClass}>Student Type</label><select value={type} onChange={e => setType(e.target.value as StudentType)} className={selectClass}>{Object.values(StudentType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClass}>Division</label><select value={division} onChange={e => setDivision(e.target.value as Division)} className={selectClass}>{Object.values(Division).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                     </div>
                     <div><label className={labelClass}>10th Marks (%)</label><input type="number" value={tenthMarks} onChange={e => setTenthMarks(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} required /></div>
                    <div>
                        <label className={labelClass}>Student Photo</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                                {photoPreview ? 
                                    <img src={photoPreview} alt="Student Preview" className="h-full w-full object-cover" /> : 
                                    <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.997A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                }
                            </span>
                            <label htmlFor="photo-upload" className="cursor-pointer bg-white dark:bg-slate-600 py-2 px-3 border border-gray-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-500">
                                <span>Upload Photo</span>
                                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        </div>
                    </div>
                     <div><label className={labelClass}>Remarks</label><textarea value={remarks} onChange={e => setRemarks(e.target.value)} className={inputClass} /></div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isEditMode ? 'Save Changes' : 'Add Student'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentFormModal;