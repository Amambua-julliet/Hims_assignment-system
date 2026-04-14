import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Assignment {
  id: string;
  courseId: string;
  lecturerId: string;
  title: string;
  dueDate: string;
  points: number;
  instructions: string;
  fileUrl?: string; // Reference material from Cloudinary
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl: string; // From Cloudinary
  fileName: string;
  submittedAt: string;
  status: 'PENDING' | 'GRADED';
  grade?: {
    ca: number;
    exam: number;
    total: number;
  };
  feedback?: string;
}

const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'submissions';

export const assignmentService = {
  // --- Assignment Management (Lecturer) ---

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<string> {
    const docRef = doc(collection(db, ASSIGNMENTS_COLLECTION));
    const newAssignment: Assignment = {
      ...assignment,
      id: docRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newAssignment);
    return docRef.id;
  },

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION), 
      where("courseId", "==", courseId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
  },

  // --- Submission Management (Lecturer / Student) ---

  async createSubmission(submission: Omit<Submission, 'id' | 'status' | 'grade' | 'feedback' | 'submittedAt'>): Promise<string> {
    const docRef = doc(collection(db, SUBMISSIONS_COLLECTION));
    const newSubmission: Submission = {
      ...submission,
      id: docRef.id,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };
    await setDoc(docRef, newSubmission);
    return docRef.id;
  },

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION), 
      where("studentId", "==", studentId),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION), 
      where("assignmentId", "==", assignmentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  async getAssignmentsByCourses(courseIds: string[]): Promise<Assignment[]> {
    if (courseIds.length === 0) return [];
    // Firestore "in" query limited to 10 items. Usually enough for courses in a semester.
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION), 
      where("courseId", "in", courseIds),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
  },

  async updateGrade(submissionId: string, grade: Submission['grade'], feedback?: string): Promise<void> {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, {
      grade,
      feedback,
      status: 'GRADED'
    });
  },

  // Stream submissions for a specific lecturer's courses
  async getSubmissionsForLecturer(lecturerId: string): Promise<Submission[]> {
    const assignmentsQ = query(collection(db, ASSIGNMENTS_COLLECTION), where("lecturerId", "==", lecturerId));
    const assignmentsSnap = await getDocs(assignmentsQ);
    const assignmentIds = assignmentsSnap.docs.map(doc => doc.id);

    if (assignmentIds.length === 0) return [];

    const submissionsQ = query(collection(db, SUBMISSIONS_COLLECTION), where("assignmentId", "in", assignmentIds));
    const submissionsSnap = await getDocs(submissionsQ);
    return submissionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  }
};
