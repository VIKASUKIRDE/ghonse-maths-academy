export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student',
  Parent = 'Parent',
}

export type AcademicYear = string; // e.g., "2024-2025"

export type StudentCategory = string;

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum StudentType {
  REGULAR = 'Regular',
  REPEATER = 'Repeater',
  EXTERNAL = 'External',
}

export type BatchName = string;

export interface Batch {
    name: BatchName;
    fee: number;
}


export enum Division {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  mobile?: string; // Used for login for Parent/Student/Teacher
  username?: string; // Used for login for Admin
  password?: string;
  currentBatch?: BatchName; // The batch the user is currently managing
  assignedBatches?: BatchName[]; // For teachers, the batches they can choose from
  childrenToSelect?: { parentId: string, childId: string, childName: string, childBatch: BatchName }[];
  academicYear?: AcademicYear;
  availableAcademicYears?: AcademicYear[];
}

export interface Payment {
    id: string;
    amount: number;
    date: string; // ISO String
    mode: 'Cash' | 'Online' | 'Cheque';
    particulars: string;
}

export interface FeeDetails {
  total: number;
  collected: number;
  concession: number;
  overdue: number;
  pending: number;
  payments?: Payment[];
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  address: string;
  studentMobile: string;
  parentMobile: string;
  tenthMarks: number;
  category: StudentCategory;
  gender: Gender;
  type: StudentType;
  batch: BatchName;
  division: Division;
  batchTiming?: string;
  photoUrl: string;
  remarks: string;
  fees: FeeDetails;
  password?: string;
  parentId: string;
}

export interface Teacher {
  id: string;
  name: string;
  mobile: string;
  assignedBatches: BatchName[];
  qualification: string;
  experience: number; // in years
  password?: string;
}

export interface Parent {
  id: string;
  name: string;
  mobile: string;
  childId: string;
  password?: string;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
  batch: BatchName;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  marks: number | null;
}

export interface Attendance {
    date: string;
    present: boolean;
}

export interface SmsMessage {
  id: string;
  recipient: string; // Could be "All Students", "Batch: 11th", "9876543210"
  message: string;
  date: string;
  status: 'Sent' | 'Failed';
}

export interface StarPerformerDetails {
  studentId: string;
  examId?: string;
  remarks?: string;
  description?: string;
}

// New types for multi-year data management
export interface AcademyData {
    students: Student[];
    parents: Parent[];
    exams: Exam[];
    examResults: ExamResult[];
    attendance: Record<string, Attendance[]>;
    availableBatches: Batch[];
    starPerformers: StarPerformerDetails[];
}

export interface FullDatabase {
    academicYears: Record<AcademicYear, AcademyData>;
    teachers: Teacher[];
    smsHistory: SmsMessage[];
}
