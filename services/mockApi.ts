import { UserRole, Student, StudentCategory, Gender, StudentType, Batch, Exam, ExamResult, Attendance, Teacher, Parent, User, SmsMessage, Division, StarPerformerDetails, BatchName, Payment } from '../types';

let paymentIdCounter = 100;
const generatePaymentId = () => `PAY${paymentIdCounter++}`;

export const INITIAL_BATCHES: Batch[] = [
    { name: '11th', fee: 50000 },
    { name: '12th', fee: 60000 },
    { name: 'MHT-CET', fee: 45000 },
    { name: 'Crash-course', fee: 20000 },
    { name: 'JEE Advanced', fee: 75000 }, // New unassigned batch for testing deletion
];
let availableBatches: Batch[] = JSON.parse(JSON.stringify(INITIAL_BATCHES));

// Mock Data
let students: Student[] = [
  { id: 'S001', rollNo: '11A01', name: 'Rohan Sharma', address: '123 MG Road, Pune', studentMobile: '9876543210', parentMobile: '9876543211', tenthMarks: 92, category: 'General', gender: Gender.MALE, type: StudentType.REGULAR, batch: '11th', division: Division.A, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S001/200', remarks: 'Excellent performer.', fees: { total: 50000, collected: 40000, concession: 0, overdue: 0, pending: 10000, payments: [{ id: generatePaymentId(), amount: 40000, date: '2024-07-10T10:00:00Z', mode: 'Online', particulars: 'First Installment' }] }, parentId: 'P001' },
  { id: 'S002', rollNo: '12B05', name: 'Priya Patel', address: '456 FC Road, Pune', studentMobile: '8765432109', parentMobile: '8765432108', tenthMarks: 88, category: 'OBC', gender: Gender.FEMALE, type: StudentType.REGULAR, batch: '12th', division: Division.B, batchTiming: 'Evening', photoUrl: 'https://picsum.photos/seed/S002/200', remarks: 'Needs to focus on Calculus.', fees: { total: 60000, collected: 60000, concession: 0, overdue: 0, pending: 0, payments: [{ id: generatePaymentId(), amount: 30000, date: '2024-06-20T10:00:00Z', mode: 'Cheque', particulars: 'First Installment' }, { id: generatePaymentId(), amount: 30000, date: '2024-07-20T10:00:00Z', mode: 'Cash', particulars: 'Final Installment' }] }, parentId: 'P002' },
  { id: 'S003', rollNo: 'CET03', name: 'Amit Singh', address: '789 JM Road, Pune', studentMobile: '7654321098', parentMobile: '7654321097', tenthMarks: 95, category: 'General', gender: Gender.MALE, type: StudentType.REPEATER, batch: 'MHT-CET', division: Division.A, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S003/200', remarks: '', fees: { total: 45000, collected: 30000, concession: 5000, overdue: 5000, pending: 10000, payments: [{ id: generatePaymentId(), amount: 30000, date: '2024-07-01T12:00:00Z', mode: 'Online', particulars: 'Full Payment' }] }, parentId: 'P003' },
  { id: 'S004', rollNo: '11A02', name: 'Sunita Williams', address: '321 Deccan, Pune', studentMobile: '9988776655', parentMobile: '9988776654', tenthMarks: 85, category: 'SC', gender: Gender.FEMALE, type: StudentType.REGULAR, batch: '11th', division: Division.C, batchTiming: 'Morning', photoUrl: 'https://picsum.photos/seed/S004/200', remarks: 'Good progress.', fees: { total: 50000, collected: 50000, concession: 0, overdue: 0, pending: 0, payments: [{ id: generatePaymentId(), amount: 50000, date: '2024-07-05T15:00:00Z', mode: 'Cash', particulars: 'Full Payment' }] }, parentId: 'P004' },
];

let teachers: Teacher[] = [
  { id: 'T01', name: 'Dr. Anjali Verma', mobile: '9111111111', assignedBatches: ['11th', '12th'], qualification: 'M.Sc. Maths, PhD', experience: 10 },
  { id: 'T02', name: 'Prof. Vikram Rathod', mobile: '9222222222', assignedBatches: ['MHT-CET', 'Crash-course'], qualification: 'M.Sc. Maths', experience: 8 },
];

let parents: Parent[] = [
    { id: 'P001', name: 'Anil Sharma', mobile: '9876543211', childId: 'S001' },
    { id: 'P002', name: 'Sanjay Patel', mobile: '8765432108', childId: 'S002' },
    { id: 'P003', name: 'Sunita Singh', mobile: '7654321097', childId: 'S003' },
    { id: 'P004', name: 'James Williams', mobile: '9988776654', childId: 'S004' },
];

let exams: Exam[] = [
  { id: 'E01', name: 'Term 1 - Algebra', date: '2024-08-15', totalMarks: 100, batch: '11th' },
  { id: 'E02', name: 'Term 1 - Calculus', date: '2024-08-20', totalMarks: 100, batch: '12th' },
  { id: 'E03', name: 'MHT-CET Mock Test 1', date: '2024-07-30', totalMarks: 200, batch: 'MHT-CET' },
];

let examResults: ExamResult[] = [
  { examId: 'E01', studentId: 'S001', marks: 85 },
  { examId: 'E01', studentId: 'S004', marks: 78 },
  { examId: 'E02', studentId: 'S002', marks: 91 },
  { examId: 'E03', studentId: 'S003', marks: 175 },
];

let attendance: Record<string, Attendance[]> = {
    'S001': [
        { date: '2024-07-20', present: true },
        { date: '2024-07-21', present: true },
        { date: '2024-07-22', present: false },
        { date: '2024-07-23', present: true },
    ],
    'S002': [
        { date: '2024-07-20', present: true },
        { date: '2024-07-21', present: true },
        { date: '2024-07-22', present: true },
        { date: '2024-07-23', present: true },
    ],
};

let smsHistory: SmsMessage[] = [
    { id: 'SMS01', recipient: 'Batch: 12th', message: 'Dear student, your upcoming exam is scheduled for tomorrow. Best of luck!', date: '2024-07-25T10:00:00Z', status: 'Sent' },
    { id: 'SMS02', recipient: 'All Students', message: 'The classes will be closed tomorrow due to heavy rain. Stay safe.', date: '2024-07-20T18:30:00Z', status: 'Sent' },
];

let starPerformers: StarPerformerDetails[] = [
    { studentId: 'S002', examId: 'E02', remarks: 'Top scorer in Calculus!', description: 'Priya has shown exceptional talent in advanced mathematics.' },
    { studentId: 'S003', examId: 'E03', remarks: 'Excellent mock test performance.', description: 'Amit is on the right track for cracking the MHT-CET.' }
];

const MOCK_USERS = {
  admin: { id: 'U01', name: 'Admin User', role: UserRole.Admin, username: 'admin' },
  // Teacher, student, and parent are now found dynamically by mobile number.
};


// API Functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const recalculateFees = (student: Student) => {
    const fees = student.fees;
    fees.collected = (fees.payments || []).reduce((sum, p) => sum + p.amount, 0);
    fees.pending = fees.total - fees.concession - fees.collected;
    
    // Simple overdue logic: Assume any pending is overdue if there's no better logic
    // A more complex system would have due dates.
    fees.overdue = fees.pending > 0 ? fees.pending : 0; 

    // Ensure overdue is zero if pending is zero
    if (fees.pending <= 0) {
        fees.pending = 0;
        fees.overdue = 0;
    }
    return student;
};


export const api = {
  login: async (identifier: string, role: UserRole): Promise<User | null> => {
    await delay(500);

    switch (role) {
        case UserRole.Admin:
            if (identifier === 'admin') {
                return MOCK_USERS.admin;
            }
            break;
        
        case UserRole.Teacher: {
            const teacher = teachers.find(t => t.mobile === identifier);
            if (teacher) {
                return {
                    id: teacher.id,
                    name: teacher.name,
                    role: UserRole.Teacher,
                    mobile: teacher.mobile,
                    assignedBatches: teacher.assignedBatches
                };
            }
            break;
        }

        case UserRole.Student: {
            const student = students.find(s => s.studentMobile === identifier);
            if (student) {
              return {
                id: student.id,
                name: student.name,
                role: UserRole.Student,
                mobile: student.studentMobile,
              };
            }
            break;
        }
        
        case UserRole.Parent: {
            const parent = parents.find(p => p.mobile === identifier);
            if (parent) {
              return {
                id: parent.id,
                name: parent.name,
                role: UserRole.Parent,
                mobile: parent.mobile,
              };
            }
            break;
        }
    }

    return null;
  },

  getBatches: async (): Promise<Batch[]> => {
    await delay(100);
    return [...availableBatches];
  },

  addBatch: async (batchData: Omit<Batch, ''>): Promise<Batch> => {
    await delay(300);
    if (availableBatches.find(b => b.name.toLowerCase() === batchData.name.toLowerCase())) {
        throw new Error(`Batch "${batchData.name}" already exists.`);
    }
    const newBatch: Batch = { name: batchData.name, fee: batchData.fee };
    availableBatches.push(newBatch);
    console.log("Added batch:", newBatch);
    return newBatch;
  },

  updateBatch: async (originalName: BatchName, updatedBatchData: Batch): Promise<Batch> => {
      await delay(400);
      const index = availableBatches.findIndex(b => b.name === originalName);
      if (index === -1) {
          throw new Error(`Batch "${originalName}" not found for update.`);
      }

      // Check if the new name is already taken by another batch
      const isNameChanged = originalName.toLowerCase() !== updatedBatchData.name.toLowerCase();
      if (isNameChanged && availableBatches.some(b => b.name.toLowerCase() === updatedBatchData.name.toLowerCase())) {
          throw new Error(`A batch with the name "${updatedBatchData.name}" already exists.`);
      }

      availableBatches[index] = { ...updatedBatchData };

      // If batch name changed, update all related entities
      if (isNameChanged) {
          students.forEach(s => { if (s.batch === originalName) s.batch = updatedBatchData.name; });
          teachers.forEach(t => {
              const batchIndex = t.assignedBatches.indexOf(originalName);
              if (batchIndex > -1) {
                  t.assignedBatches[batchIndex] = updatedBatchData.name;
              }
          });
          exams.forEach(e => { if (e.batch === originalName) e.batch = updatedBatchData.name; });
      }

      console.log("Updated batch:", availableBatches[index]);
      return availableBatches[index];
  },

  deleteBatch: async (batchName: BatchName): Promise<boolean> => {
    await delay(400);
    // Prevent deletion if a student or teacher is assigned to this batch
    const isAssignedToStudent = students.some(s => s.batch === batchName);
    const isAssignedToTeacher = teachers.some(t => t.assignedBatches.includes(batchName));
    
    if (isAssignedToStudent || isAssignedToTeacher) {
        throw new Error(`Cannot delete batch "${batchName}" as it is currently assigned to students or teachers.`);
    }
    
    const index = availableBatches.findIndex(b => b.name === batchName);
    if (index > -1) {
        availableBatches.splice(index, 1);
        console.log("Deleted batch:", batchName);
        return true;
    }
    
    // Throw an error if the batch to be deleted is not found, preventing silent failures.
    throw new Error(`Could not delete batch "${batchName}" because it was not found.`);
  },

  getStudents: async (batch?: BatchName) => {
    await delay(300);
    if (batch) {
      return students.filter(s => s.batch === batch);
    }
    return [...students];
  },
  
  getStudentById: async (id: string) => {
    await delay(200);
    const student = students.find(s => s.id === id);
    return student ? {...student} : null;
  },

  getStudentsByBatch: async (batch: BatchName) => {
    await delay(300);
    return students.filter(s => s.batch === batch);
  },

  getTeachers: async () => {
    await delay(300);
    return [...teachers];
  },

  getParents: async () => {
    await delay(300);
    return [...parents];
  },

  getExams: async (batch?: BatchName) => {
    await delay(300);
    if (batch) {
        return exams.filter(e => e.batch === batch);
    }
    return [...exams];
  },

  getExamResults: async (examId: string) => {
    await delay(300);
    return examResults.filter(r => r.examId === examId);
  },

  getResultsForExams: async (examIds: string[]): Promise<ExamResult[]> => {
    await delay(400);
    return examResults.filter(r => examIds.includes(r.examId));
  },
  
  getStudentResults: async (studentId: string) => {
    await delay(300);
    const results = examResults.filter(r => r.studentId === studentId);
    return results.map(r => {
        const exam = exams.find(e => e.id === r.examId);
        return { ...r, examName: exam?.name, totalMarks: exam?.totalMarks };
    });
  },

  getStudentAttendance: async (studentId: string) => {
      await delay(300);
      return attendance[studentId] || [];
  },

  getChildOfParent: async (parentId: string) => {
      await delay(300);
      const parent = parents.find(p => p.id === parentId);
      if (!parent) return null;
      return students.find(s => s.id === parent.childId) || null;
  },
  
  updateExamMarks: async (results: ExamResult[]) => {
      await delay(500);
      results.forEach(newResult => {
          const index = examResults.findIndex(r => r.examId === newResult.examId && r.studentId === newResult.studentId);
          if (index !== -1) {
              examResults[index] = newResult;
          } else {
              examResults.push(newResult);
          }
      });
      console.log("Updated marks:", examResults);
      return true;
  },

  addStudent: async (studentDataWithParent: Omit<Student, 'id' | 'rollNo' | 'parentId'> & { parentName: string }) => {
    await delay(500);
    const newStudentId = `S${String(students.length + 1).padStart(3, '0')}`;
    const { parentName, ...studentData } = studentDataWithParent;
    
    // Create and add a corresponding parent
    const newParentId = `P${String(parents.length + 1).padStart(3, '0')}`;
    const newParent: Parent = {
        id: newParentId,
        name: parentName,
        mobile: studentData.parentMobile,
        childId: newStudentId,
    };
    parents.push(newParent);
    
    // Create the new student
    const newRollNo = `${studentData.batch.slice(0, 3).toUpperCase()}${String(Math.floor(Math.random() * 90) + 10)}`;
    const newStudent: Student = {
      ...studentData,
      id: newStudentId,
      rollNo: newRollNo,
      parentId: newParentId,
      fees: {
          ...studentData.fees,
          payments: studentData.fees.payments || [],
      }
    };
    students.push(newStudent);
    console.log("Added student:", newStudent);
    console.log("Added parent:", newParent);
    return newStudent;
  },

  updateStudent: async (studentData: Student, parentName?: string) => {
    await delay(500);
    const index = students.findIndex(s => s.id === studentData.id);
    if (index !== -1) {
      students[index] = studentData;
      
      if (parentName) {
        const parentIndex = parents.findIndex(p => p.id === studentData.parentId);
        if (parentIndex !== -1) {
            parents[parentIndex].name = parentName;
            console.log("Updated parent:", parents[parentIndex]);
        }
      }

      console.log("Updated student:", students[index]);
      return students[index];
    }
    throw new Error("Student not found for update");
  },

  deleteStudent: async (studentId: string) => {
    await delay(500);
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        const deletedStudent = students.splice(studentIndex, 1)[0];
        
        // Also delete the corresponding parent
        const parentIndex = parents.findIndex(p => p.id === deletedStudent.parentId);
        if (parentIndex !== -1) {
            parents.splice(parentIndex, 1);
            console.log("Deleted parent:", deletedStudent.parentId);
        }

        console.log("Deleted student:", studentId);
        return true;
    }
    return false;
  },

  addTeacher: async (teacherData: Omit<Teacher, 'id'>) => {
    await delay(500);
    const newId = `T${String(teachers.length + 1).padStart(2, '0')}`;
    const newTeacher: Teacher = {
        ...teacherData,
        id: newId,
    };
    teachers.push(newTeacher);
    console.log("Added teacher:", newTeacher);
    return newTeacher;
  },
  
  updateTeacher: async (teacherData: Teacher) => {
    await delay(500);
    const index = teachers.findIndex(t => t.id === teacherData.id);
    if (index !== -1) {
      teachers[index] = teacherData;
      console.log("Updated teacher:", teachers[index]);
      return teachers[index];
    }
    throw new Error("Teacher not found for update");
  },

  deleteTeacher: async (teacherId: string) => {
    await delay(500);
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
        teachers.splice(index, 1);
        console.log("Deleted teacher:", teacherId);
        return true;
    }
    return false;
  },

  addExam: async (examData: Omit<Exam, 'id'>) => {
    await delay(500);
    const newId = `E${String(exams.length + 1).padStart(2, '0')}`;
    const newExam: Exam = {
      ...examData,
      id: newId,
    };
    exams.push(newExam);
    console.log("Added exam:", newExam);
    return newExam;
  },

  getSmsHistory: async (): Promise<SmsMessage[]> => {
    await delay(300);
    return [...smsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  sendSms: async (recipient: string, message: string): Promise<boolean> => {
    await delay(1000);
    const newSms: SmsMessage = {
        id: `SMS${String(smsHistory.length + 1).padStart(2, '0')}`,
        recipient,
        message,
        date: new Date().toISOString(),
        status: 'Sent', // Simulate success
    };
    smsHistory.push(newSms);
    console.log("Sent SMS:", newSms);
    return true;
  },

  getStarPerformers: async (): Promise<StarPerformerDetails[]> => {
      await delay(100);
      return [...starPerformers];
  },

  addStarPerformer: async (details: StarPerformerDetails): Promise<boolean> => {
      await delay(200);
      const index = starPerformers.findIndex(p => p.studentId === details.studentId);
      if (index > -1) {
          // Update existing
          starPerformers[index] = details;
      } else {
          // Add new
          starPerformers.push(details);
      }
      console.log("Star Performers:", starPerformers);
      return true;
  },

  removeStarPerformer: async (studentId: string): Promise<boolean> => {
      await delay(200);
      const index = starPerformers.findIndex(p => p.studentId === studentId);
      if (index > -1) {
          starPerformers.splice(index, 1);
      }
      console.log("Star Performers:", starPerformers);
      return true;
  },

  addPayment: async (studentId: string, paymentData: Omit<Payment, 'id'>): Promise<Student> => {
    await delay(500);
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");

    if (!student.fees.payments) student.fees.payments = [];
    
    const newPayment: Payment = { ...paymentData, id: generatePaymentId() };
    student.fees.payments.push(newPayment);
    
    const updatedStudent = recalculateFees(student);
    console.log("Added payment for student:", student.id, " New fees:", updatedStudent.fees);
    return updatedStudent;
  },

  updatePayment: async (studentId: string, paymentData: Payment): Promise<Student> => {
    await delay(500);
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");

    const paymentIndex = student.fees.payments?.findIndex(p => p.id === paymentData.id);
    if (paymentIndex === undefined || paymentIndex === -1) {
        throw new Error("Payment not found to update");
    }
    
    student.fees.payments![paymentIndex] = paymentData;
    
    const updatedStudent = recalculateFees(student);
    console.log("Updated payment for student:", student.id, " New fees:", updatedStudent.fees);
    return updatedStudent;
  },

  deletePayment: async (studentId: string, paymentId: string): Promise<Student> => {
    await delay(500);
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");

    if (!student.fees.payments) throw new Error("No payments exist for this student");

    student.fees.payments = student.fees.payments.filter(p => p.id !== paymentId);
    
    const updatedStudent = recalculateFees(student);
    console.log("Deleted payment for student:", student.id, " New fees:", updatedStudent.fees);
    return updatedStudent;
  },


  getAllData: async () => {
    await delay(200);
    return {
        students,
        teachers,
        parents,
        exams,
        examResults,
        attendance,
        smsHistory,
        availableBatches,
        starPerformers,
    };
  },

  restoreData: async (data: any) => {
      await delay(500);
      try {
          // A simple validation to check if the keys exist
          if (data.students && data.teachers && data.parents && data.exams && data.examResults && data.attendance && data.smsHistory && data.availableBatches && data.starPerformers) {
              students = data.students;
              teachers = data.teachers;
              parents = data.parents;
              exams = data.exams;
              examResults = data.examResults;
              attendance = data.attendance;
              smsHistory = data.smsHistory;
              availableBatches = data.availableBatches;
              starPerformers = data.starPerformers;
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