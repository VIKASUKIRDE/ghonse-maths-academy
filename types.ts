export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student',
  Parent = 'Parent',
}

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
  currentBatch?: BatchName; // The batch the user is currently managing
  assignedBatches?: BatchName[]; // For teachers, the batches they can choose from
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
  parentId: string;
}

export interface Teacher {
  id: string;
  name: string;
  mobile: string;
  assignedBatches: BatchName[];
  qualification: string;
  experience: number; // in years
}

export interface Parent {
  id: string;
  name: string;
  mobile: string;
  childId: string;
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