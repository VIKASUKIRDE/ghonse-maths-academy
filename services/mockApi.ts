import { UserRole, Student, Gender, StudentType, Batch, Exam, ExamResult, Attendance, Teacher, Parent, User, SmsMessage, Division, StarPerformerDetails, BatchName, Payment, AcademicYear, AcademyData, FullDatabase } from '../types';

let paymentIdCounter = 100;
const generatePaymentId = () => `PAY${paymentIdCounter++}`;
const DEFAULT_PASSWORD = 'Ghonse@123';
const CURRENT_YEAR: AcademicYear = "2024-2025";

const INITIAL_BATCHES: Batch[] = [
    { name: '9th', fee: 35000 },
    { name: '10th', fee: 40000 },
    { name: '11th', fee: 50000 },
    { name: '12th', fee: 60000 },
    { name: 'MHT-CET', fee: 45000 },
    { name: 'Crash-course', fee: 20000 },
    { name: 'JEE Advanced', fee: 75000 },
];

let database: FullDatabase = {
    academicYears: {
        [CURRENT_YEAR]: {
            students: [
                { id: 'S001', rollNo: '11A01', name: 'Rohan Sharma', address: '123 MG Road, Pune', studentMobile: '9876543210', parentMobile: '9876543211', tenthMarks: 92, category: 'General', gender: Gender.MALE, type: StudentType.REGULAR, batch: '11th', division: Division.A, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S001/200', remarks: 'Excellent performer.', fees: { total: 50000, collected: 40000, concession: 0, overdue: 0, pending: 10000, payments: [{ id: generatePaymentId(), amount: 40000, date: '2024-07-10T10:00:00Z', mode: 'Online', particulars: 'First Installment' }] }, parentId: 'P001', password: DEFAULT_PASSWORD },
                { id: 'S002', rollNo: '12B05', name: 'Priya Patel', address: '456 FC Road, Pune', studentMobile: '8765432109', parentMobile: '8765432108', tenthMarks: 88, category: 'OBC', gender: Gender.FEMALE, type: StudentType.REGULAR, batch: '12th', division: Division.B, batchTiming: 'Evening', photoUrl: 'https://picsum.photos/seed/S002/200', remarks: 'Needs to focus on Calculus.', fees: { total: 60000, collected: 60000, concession: 0, overdue: 0, pending: 0, payments: [{ id: generatePaymentId(), amount: 30000, date: '2024-06-20T10:00:00Z', mode: 'Cheque', particulars: 'First Installment' }, { id: generatePaymentId(), amount: 30000, date: '2024-07-20T10:00:00Z', mode: 'Cash', particulars: 'Final Installment' }] }, parentId: 'P002', password: DEFAULT_PASSWORD },
                { id: 'S003', rollNo: 'CET03', name: 'Amit Singh', address: '789 JM Road, Pune', studentMobile: '7654321098', parentMobile: '7654321097', tenthMarks: 95, category: 'General', gender: Gender.MALE, type: StudentType.REPEATER, batch: 'MHT-CET', division: Division.A, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S003/200', remarks: '', fees: { total: 45000, collected: 30000, concession: 5000, overdue: 5000, pending: 10000, payments: [{ id: generatePaymentId(), amount: 30000, date: '2024-07-01T12:00:00Z', mode: 'Online', particulars: 'Full Payment' }] }, parentId: 'P003', password: DEFAULT_PASSWORD },
                { id: 'S004', rollNo: '11A02', name: 'Sunita Williams', address: '321 Deccan, Pune', studentMobile: '9988776655', parentMobile: '9988776654', tenthMarks: 85, category: 'SC', gender: Gender.FEMALE, type: StudentType.REGULAR, batch: '11th', division: Division.C, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S004/200', remarks: 'Good progress.', fees: { total: 50000, collected: 50000, concession: 0, overdue: 0, pending: 0, payments: [{ id: generatePaymentId(), amount: 50000, date: '2024-07-05T15:00:00Z', mode: 'Cash', particulars: 'Full Payment' }] }, parentId: 'P004', password: DEFAULT_PASSWORD },
                { id: 'S005', rollNo: '12C01', name: 'Ria Sharma', address: '123 MG Road, Pune', studentMobile: '9876543212', parentMobile: '9876543211', tenthMarks: 90, category: 'General', gender: Gender.FEMALE, type: StudentType.REGULAR, batch: '12th', division: Division.C, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S005/200', remarks: 'New admission.', fees: { total: 60000, collected: 60000, concession: 0, overdue: 0, pending: 0, payments: [{ id: generatePaymentId(), amount: 60000, date: '2024-07-15T11:00:00Z', mode: 'Online', particulars: 'Full Payment' }] }, parentId: 'P005', password: DEFAULT_PASSWORD },
            ],
            parents: [
                { id: 'P001', name: 'Anil Sharma', mobile: '9876543211', childId: 'S001', password: DEFAULT_PASSWORD },
                { id: 'P002', name: 'Sanjay Patel', mobile: '8765432108', childId: 'S002', password: DEFAULT_PASSWORD },
                { id: 'P003', name: 'Sunita Singh', mobile: '7654321097', childId: 'S003', password: DEFAULT_PASSWORD },
                { id: 'P004', name: 'James Williams', mobile: '9988776654', childId: 'S004', password: DEFAULT_PASSWORD },
                { id: 'P005', name: 'Anil Sharma', mobile: '9876543211', childId: 'S005', password: DEFAULT_PASSWORD },
            ],
            exams: [
                { id: 'E01', name: 'Term 1 - Algebra', date: '2024-08-15', totalMarks: 100, batch: '11th' },
                { id: 'E02', name: 'Term 1 - Calculus', date: '2024-08-20', totalMarks: 100, batch: '12th' },
                { id: 'E03', name: 'MHT-CET Mock Test 1', date: '2024-07-30', totalMarks: 200, batch: 'MHT-CET' },
            ],
            examResults: [
                { examId: 'E01', studentId: 'S001', marks: 85 },
                { examId: 'E01', studentId: 'S004', marks: 78 },
                { examId: 'E02', studentId: 'S002', marks: 91 },
                { examId: 'E02', studentId: 'S005', marks: 95 },
                { examId: 'E03', studentId: 'S003', marks: 175 },
            ],
            attendance: {
                'S001': [{ date: '2024-07-20', present: true }, { date: '2024-07-21', present: true }, { date: '2024-07-22', present: false }, { date: '2024-07-23', present: true }],
                'S002': [{ date: '2024-07-20', present: true }, { date: '2024-07-21', present: true }, { date: '2024-07-22', present: true }, { date: '2024-07-23', present: true }],
            },
            availableBatches: JSON.parse(JSON.stringify(INITIAL_BATCHES)),
            starPerformers: [
                { studentId: 'S002', examId: 'E02', remarks: 'Top scorer in Calculus!', description: 'Priya has shown exceptional talent in advanced mathematics.' },
                { studentId: 'S003', examId: 'E03', remarks: 'Excellent mock test performance.', description: 'Amit is on the right track for cracking the MHT-CET.' }
            ],
        }
    },
    teachers: [
        { id: 'T01', name: 'Dr. Anjali Verma', mobile: '9111111111', assignedBatches: ['11th', '12th'], qualification: 'M.Sc. Maths, PhD', experience: 10, password: DEFAULT_PASSWORD },
        { id: 'T02', name: 'Prof. Vikram Rathod', mobile: '9222222222', assignedBatches: ['MHT-CET', 'Crash-course'], qualification: 'M.Sc. Maths', experience: 8, password: DEFAULT_PASSWORD },
    ],
    smsHistory: [
        { id: 'SMS01', recipient: 'Batch: 12th', message: 'Dear student, your upcoming exam is scheduled for tomorrow. Best of luck!', date: '2024-07-25T10:00:00Z', status: 'Sent' },
        { id: 'SMS02', recipient: 'All Students', message: 'The classes will be closed tomorrow due to heavy rain. Stay safe.', date: '2024-07-20T18:30:00Z', status: 'Sent' },
    ]
};

let currentAcademicYear: AcademicYear = CURRENT_YEAR;

const getLatestAcademicYear = (): AcademicYear => {
    return Object.keys(database.academicYears).sort().reverse()[0];
};

const MOCK_USERS = {
  admin: { id: 'U01', name: 'Admin User', role: UserRole.Admin, username: 'admin', password: DEFAULT_PASSWORD },
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const recalculateFees = (student: Student) => {
    const fees = student.fees;
    fees.collected = (fees.payments || []).reduce((sum, p) => sum + p.amount, 0);
    fees.pending = fees.total - fees.concession - fees.collected;
    fees.overdue = fees.pending > 0 ? fees.pending : 0; 
    if (fees.pending <= 0) {
        fees.pending = 0;
        fees.overdue = 0;
    }
    return student;
};

export const api = {
  login: async (identifier: string, password_param: string, role: UserRole, academicYear?: AcademicYear): Promise<User | null> => {
    await delay(500);

    let foundUser: User | null = null;
    const latestYear = getLatestAcademicYear();

    switch (role) {
        case UserRole.Admin:
            if (identifier === MOCK_USERS.admin.username && password_param === MOCK_USERS.admin.password) {
                 if (!academicYear || !database.academicYears[academicYear]) {
                    throw new Error("A valid academic year must be selected for admin login.");
                }
                api.setCurrentAcademicYear(academicYear);
                
                const batchesForYear = database.academicYears[academicYear]?.availableBatches || [];

                foundUser = {
                    ...MOCK_USERS.admin,
                    academicYear: academicYear,
                    availableAcademicYears: Object.keys(database.academicYears).sort().reverse(),
                    // Assign all batches for the selected year to the admin user.
                    // Do not set currentBatch, to trigger the BatchSelectionPage.
                    assignedBatches: batchesForYear.map(b => b.name),
                };
            }
            break;
        
        case UserRole.Teacher: {
            const teacher = database.teachers.find(t => t.mobile === identifier);
            if (teacher && (teacher.password || DEFAULT_PASSWORD) === password_param) {
                foundUser = {
                    id: teacher.id,
                    name: teacher.name,
                    role: UserRole.Teacher,
                    mobile: teacher.mobile,
                    assignedBatches: teacher.assignedBatches,
                    academicYear: latestYear,
                };
            }
            break;
        }

        case UserRole.Student: {
            const student = database.academicYears[latestYear].students.find(s => s.studentMobile === identifier);
            if (student && (student.password || DEFAULT_PASSWORD) === password_param) {
              foundUser = {
                id: student.id,
                name: student.name,
                role: UserRole.Student,
                mobile: student.studentMobile,
                academicYear: latestYear,
              };
            }
            break;
        }
        
        case UserRole.Parent: {
            const yearData = database.academicYears[latestYear];
            const matchingParents = yearData.parents.filter(p => p.mobile === identifier);
            if (matchingParents.length > 0 && (matchingParents[0].password || DEFAULT_PASSWORD) === password_param) {
                const parentRecord = matchingParents[0];
                if (matchingParents.length > 1) {
                    const childrenToSelect = matchingParents.map(p => {
                        const child = yearData.students.find(s => s.id === p.childId);
                        if (!child) return null;
                        return { parentId: p.id, childId: child.id, childName: child.name, childBatch: child.batch };
                    }).filter(Boolean) as any;

                    foundUser = {
                        id: `temp-parent-${parentRecord.mobile}`, name: parentRecord.name, role: UserRole.Parent, mobile: parentRecord.mobile,
                        childrenToSelect: childrenToSelect, academicYear: latestYear,
                    };
                } else {
                    foundUser = {
                        id: parentRecord.id, name: parentRecord.name, role: UserRole.Parent, mobile: parentRecord.mobile,
                        academicYear: latestYear,
                    };
                }
            }
            break;
        }
    }
    return foundUser;
  },

  changePassword: async (userId: string, userRole: UserRole, oldPass: string, newPass: string) => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    if (!yearData) throw new Error("Academic year data not found.");
    
    let userRecord: any;
    switch(userRole) {
        case UserRole.Admin:
            if (MOCK_USERS.admin.id === userId) userRecord = MOCK_USERS.admin;
            break;
        case UserRole.Teacher:
            userRecord = database.teachers.find(t => t.id === userId);
            break;
        case UserRole.Student:
            userRecord = yearData.students.find(s => s.id === userId);
            break;
        case UserRole.Parent:
             userRecord = yearData.parents.find(p => p.id === userId);
             if (!userRecord) {
                 const matchingParents = yearData.parents.filter(p => p.mobile === userId.replace('temp-parent-', ''));
                 if (matchingParents.length > 0) userRecord = matchingParents[0];
             }
             break;
    }

    if (!userRecord) throw new Error("User not found.");
    
    const currentPassword = userRecord.password || DEFAULT_PASSWORD;
    if (currentPassword !== oldPass) throw new Error("Incorrect old password.");

    if (userRole === UserRole.Parent && userRecord.mobile) {
        yearData.parents.forEach(p => {
            if (p.mobile === userRecord.mobile) p.password = newPass;
        });
    } else {
         userRecord.password = newPass;
    }
   
    console.log(`Password changed for ${userRole} ID ${userId}`);
    return true;
  },

  getAcademicYears: async (): Promise<AcademicYear[]> => {
      await delay(50);
      return Object.keys(database.academicYears).sort().reverse();
  },

  addAcademicYear: async (newYear: AcademicYear): Promise<boolean> => {
      await delay(300);
      if (database.academicYears[newYear]) {
          throw new Error(`Academic year "${newYear}" already exists.`);
      }
      const latestYear = getLatestAcademicYear();
      const latestYearData = database.academicYears[latestYear];
      
      const batchesForNewYear = latestYearData.availableBatches.length > 0
          ? latestYearData.availableBatches
          : INITIAL_BATCHES;

      database.academicYears[newYear] = {
          students: [],
          parents: [],
          exams: [],
          examResults: [],
          attendance: {},
          availableBatches: JSON.parse(JSON.stringify(batchesForNewYear)),
          starPerformers: [],
      };
      return true;
  },

  setCurrentAcademicYear: (year: AcademicYear) => {
      if (database.academicYears[year]) {
          currentAcademicYear = year;
      } else {
          console.error(`Attempted to set to non-existent academic year: ${year}`);
      }
  },
  
  getBatches: async (): Promise<Batch[]> => {
    await delay(100);
    return [...database.academicYears[currentAcademicYear]?.availableBatches || []];
  },

  addBatch: async (batchData: Omit<Batch, ''>): Promise<Batch> => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    if (yearData.availableBatches.find(b => b.name.toLowerCase() === batchData.name.toLowerCase())) {
        throw new Error(`Batch "${batchData.name}" already exists.`);
    }
    const newBatch: Batch = { name: batchData.name, fee: batchData.fee };
    yearData.availableBatches.push(newBatch);
    return newBatch;
  },

  updateBatch: async (originalName: BatchName, updatedBatchData: Batch): Promise<Batch> => {
      await delay(400);
      const yearData = database.academicYears[currentAcademicYear];
      const index = yearData.availableBatches.findIndex(b => b.name === originalName);
      if (index === -1) throw new Error(`Batch "${originalName}" not found for update.`);

      const isNameChanged = originalName.toLowerCase() !== updatedBatchData.name.toLowerCase();
      if (isNameChanged && yearData.availableBatches.some(b => b.name.toLowerCase() === updatedBatchData.name.toLowerCase())) {
          throw new Error(`A batch with the name "${updatedBatchData.name}" already exists.`);
      }

      yearData.availableBatches[index] = { ...updatedBatchData };

      if (isNameChanged) {
          yearData.students.forEach(s => { if (s.batch === originalName) s.batch = updatedBatchData.name; });
          database.teachers.forEach(t => {
              const batchIndex = t.assignedBatches.indexOf(originalName);
              if (batchIndex > -1) t.assignedBatches[batchIndex] = updatedBatchData.name;
          });
          yearData.exams.forEach(e => { if (e.batch === originalName) e.batch = updatedBatchData.name; });
      }
      return yearData.availableBatches[index];
  },

  deleteBatch: async (batchName: BatchName): Promise<boolean> => {
    await delay(400);
    const yearData = database.academicYears[currentAcademicYear];
    const isAssignedToStudent = yearData.students.some(s => s.batch === batchName);
    const isAssignedToTeacher = database.teachers.some(t => t.assignedBatches.includes(batchName));
    
    if (isAssignedToStudent || isAssignedToTeacher) {
        throw new Error(`Cannot delete batch "${batchName}" as it is currently assigned to students or teachers.`);
    }
    
    const index = yearData.availableBatches.findIndex(b => b.name === batchName);
    if (index > -1) {
        yearData.availableBatches.splice(index, 1);
        return true;
    }
    throw new Error(`Could not delete batch "${batchName}" because it was not found.`);
  },

  getStudents: async (batch?: BatchName) => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    if (!yearData) return [];
    if (batch) return yearData.students.filter(s => s.batch === batch);
    return [...yearData.students];
  },
  
  getStudentById: async (id: string) => {
    await delay(200);
    const yearData = database.academicYears[currentAcademicYear];
    const student = yearData?.students.find(s => s.id === id);
    return student ? {...student} : null;
  },

  getStudentsByBatch: async (batch: BatchName) => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    if (!yearData) return [];
    return yearData.students.filter(s => s.batch === batch);
  },

  getTeachers: async () => {
    await delay(300);
    return [...database.teachers];
  },

  getParents: async () => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    return [...yearData?.parents || []];
  },

  getExams: async (batch?: BatchName) => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    if (!yearData) return [];
    if (batch) return yearData.exams.filter(e => e.batch === batch);
    return [...yearData.exams];
  },

  getExamResults: async (examId: string) => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    return yearData?.examResults.filter(r => r.examId === examId) || [];
  },

  getResultsForExams: async (examIds: string[]): Promise<ExamResult[]> => {
    await delay(400);
    const yearData = database.academicYears[currentAcademicYear];
    return yearData?.examResults.filter(r => examIds.includes(r.examId)) || [];
  },
  
  getStudentResults: async (studentId: string) => {
    await delay(300);
    const yearData = database.academicYears[currentAcademicYear];
    const results = yearData?.examResults.filter(r => r.studentId === studentId) || [];
    return results.map(r => {
        const exam = yearData.exams.find(e => e.id === r.examId);
        return { ...r, examName: exam?.name, totalMarks: exam?.totalMarks };
    });
  },

  getStudentAttendance: async (studentId: string) => {
      await delay(300);
      const yearData = database.academicYears[currentAcademicYear];
      return yearData?.attendance[studentId] || [];
  },

  getChildOfParent: async (parentId: string) => {
      await delay(300);
      const yearData = database.academicYears[currentAcademicYear];
      const parent = yearData?.parents.find(p => p.id === parentId);
      if (!parent) return null;
      return yearData.students.find(s => s.id === parent.childId) || null;
  },
  
  updateExamMarks: async (results: ExamResult[]) => {
      await delay(500);
      const yearData = database.academicYears[currentAcademicYear];
      results.forEach(newResult => {
          const index = yearData.examResults.findIndex(r => r.examId === newResult.examId && r.studentId === newResult.studentId);
          if (index !== -1) yearData.examResults[index] = newResult;
          else yearData.examResults.push(newResult);
      });
      return true;
  },

  addStudent: async (studentDataWithParent: Omit<Student, 'id' | 'rollNo' | 'parentId'> & { parentName: string }) => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const newStudentId = `S${String(yearData.students.length + 1).padStart(3, '0')}`;
    const { parentName, ...studentData } = studentDataWithParent;
    
    const newParentId = `P${String(yearData.parents.length + 1).padStart(3, '0')}`;
    const newParent: Parent = {
        id: newParentId, name: parentName, mobile: studentData.parentMobile,
        childId: newStudentId, password: DEFAULT_PASSWORD,
    };
    yearData.parents.push(newParent);
    
    const newRollNo = `${studentData.batch.slice(0, 3).toUpperCase()}${String(Math.floor(Math.random() * 90) + 10)}`;
    const newStudent: Student = {
      ...studentData, id: newStudentId, rollNo: newRollNo, parentId: newParentId,
      password: DEFAULT_PASSWORD, fees: { ...studentData.fees, payments: studentData.fees.payments || [] }
    };
    yearData.students.push(newStudent);
    return newStudent;
  },

  updateStudent: async (studentData: Student, parentName?: string) => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const index = yearData.students.findIndex(s => s.id === studentData.id);
    if (index !== -1) {
      yearData.students[index] = studentData;
      if (parentName) {
        const parentIndex = yearData.parents.findIndex(p => p.id === studentData.parentId);
        if (parentIndex !== -1) yearData.parents[parentIndex].name = parentName;
      }
      return yearData.students[index];
    }
    throw new Error("Student not found for update");
  },

  deleteStudent: async (studentId: string) => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const studentIndex = yearData.students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        const deletedStudent = yearData.students.splice(studentIndex, 1)[0];
        const parentIndex = yearData.parents.findIndex(p => p.id === deletedStudent.parentId);
        if (parentIndex !== -1) yearData.parents.splice(parentIndex, 1);
        return true;
    }
    return false;
  },

  addTeacher: async (teacherData: Omit<Teacher, 'id'>) => {
    await delay(500);
    const newId = `T${String(database.teachers.length + 1).padStart(2, '0')}`;
    const newTeacher: Teacher = { ...teacherData, id: newId, password: DEFAULT_PASSWORD };
    database.teachers.push(newTeacher);
    return newTeacher;
  },
  
  updateTeacher: async (teacherData: Teacher) => {
    await delay(500);
    const index = database.teachers.findIndex(t => t.id === teacherData.id);
    if (index !== -1) {
      database.teachers[index] = teacherData;
      return database.teachers[index];
    }
    throw new Error("Teacher not found for update");
  },

  deleteTeacher: async (teacherId: string) => {
    await delay(500);
    const index = database.teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
        database.teachers.splice(index, 1);
        return true;
    }
    return false;
  },

  addExam: async (examData: Omit<Exam, 'id'>) => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const newId = `E${String(yearData.exams.length + 1).padStart(2, '0')}`;
    const newExam: Exam = { ...examData, id: newId };
    yearData.exams.push(newExam);
    return newExam;
  },

  getSmsHistory: async (): Promise<SmsMessage[]> => {
    await delay(300);
    return [...database.smsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  sendSms: async (recipient: string, message: string): Promise<boolean> => {
    await delay(1000);
    const newSms: SmsMessage = {
        id: `SMS${String(database.smsHistory.length + 1).padStart(2, '0')}`,
        recipient, message, date: new Date().toISOString(), status: 'Sent',
    };
    database.smsHistory.push(newSms);
    return true;
  },

  getStarPerformers: async (): Promise<StarPerformerDetails[]> => {
      await delay(100);
      const yearData = database.academicYears[currentAcademicYear];
      return [...yearData?.starPerformers || []];
  },

  addStarPerformer: async (details: StarPerformerDetails): Promise<boolean> => {
      await delay(200);
      const yearData = database.academicYears[currentAcademicYear];
      const index = yearData.starPerformers.findIndex(p => p.studentId === details.studentId);
      if (index > -1) yearData.starPerformers[index] = details;
      else yearData.starPerformers.push(details);
      return true;
  },

  removeStarPerformer: async (studentId: string): Promise<boolean> => {
      await delay(200);
      const yearData = database.academicYears[currentAcademicYear];
      const index = yearData.starPerformers.findIndex(p => p.studentId === studentId);
      if (index > -1) yearData.starPerformers.splice(index, 1);
      return true;
  },

  addPayment: async (studentId: string, paymentData: Omit<Payment, 'id'>): Promise<Student> => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const student = yearData.students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");
    if (!student.fees.payments) student.fees.payments = [];
    
    const newPayment: Payment = { ...paymentData, id: generatePaymentId() };
    student.fees.payments.push(newPayment);
    return recalculateFees(student);
  },

  updatePayment: async (studentId: string, paymentData: Payment): Promise<Student> => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const student = yearData.students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");

    const paymentIndex = student.fees.payments?.findIndex(p => p.id === paymentData.id);
    if (paymentIndex === undefined || paymentIndex === -1) throw new Error("Payment not found to update");
    
    student.fees.payments![paymentIndex] = paymentData;
    return recalculateFees(student);
  },

  deletePayment: async (studentId: string, paymentId: string): Promise<Student> => {
    await delay(500);
    const yearData = database.academicYears[currentAcademicYear];
    const student = yearData.students.find(s => s.id === studentId);
    if (!student || !student.fees.payments) throw new Error("Student or payments not found");

    student.fees.payments = student.fees.payments.filter(p => p.id !== paymentId);
    return recalculateFees(student);
  },

  getAllData: async (): Promise<FullDatabase> => {
    await delay(200);
    return database;
  },

  restoreData: async (data: any) => {
      await delay(500);
      try {
          if (data.academicYears && data.teachers && data.smsHistory) {
              database = data as FullDatabase;
              api.setCurrentAcademicYear(getLatestAcademicYear());
              console.log("Data restored from backup.");
              return true;
          } else {
              throw new Error("Backup file is missing required data structures.");
          }
      } catch (e) {
          console.error("Failed to restore data:", e);
          throw new Error("Invalid or corrupt backup file.");
      }
  }
};