import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { notificationService } from './notificationService';
import { userService } from './userService';

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
    // Defensive Validation
    if (!assignment.title || !assignment.courseId || !assignment.lecturerId) {
      throw new Error('Missing required fields for assignment creation.');
    }

    const docRef = doc(collection(db, ASSIGNMENTS_COLLECTION));
    const newAssignment: Assignment = {
      ...assignment,
      id: docRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newAssignment);

    // Notify all students registered for this course
    try {
      const students = await userService.getStudentsByCourse(assignment.courseId);
      const notificationPromises = students.map(student => 
        notificationService.createNotification({
          userId: student.id,
          title: 'New Assignment Posted',
          message: `A new assignment "${assignment.title}" has been posted.`,
          type: 'ASSIGNMENT',
          link: `/assignments/${docRef.id}`
        })
      );
      await Promise.all(notificationPromises);
    } catch (err) {
      console.error('Error sending assignment notifications:', err);
    }

    return docRef.id;
  },

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION), 
      where("courseId", "==", courseId)
    );
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
    // Client-side sort to bypass missing index requirements
    return assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAssignmentsByLecturer(lecturerId: string): Promise<Assignment[]> {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION), 
      where("lecturerId", "==", lecturerId)
    );
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
    // Client-side sort to bypass missing index requirements
    return assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<void> {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deleteAssignment(id: string): Promise<void> {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, id);
    await deleteDoc(docRef);
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

    // Notify the lecturer
    try {
      const assignDoc = await getDoc(doc(db, ASSIGNMENTS_COLLECTION, submission.assignmentId));
      if (assignDoc.exists()) {
        const assignData = assignDoc.data();
        await notificationService.createNotification({
          userId: assignData.lecturerId,
          title: 'New Submission Received',
          message: `${submission.studentName} has submitted "${assignData.title}".`,
          type: 'SUBMISSION',
          link: `/lecturer-grading/${docRef.id}`
        });
      }
    } catch (err) {
      console.error('Error sending submission notification:', err);
    }

    return docRef.id;
  },

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION), 
      where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
    return submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
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
      where("courseId", "in", courseIds)
    );
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
    return assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateGrade(submissionId: string, grade: Submission['grade'], feedback?: string): Promise<void> {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, {
      grade,
      feedback,
      status: 'GRADED'
    });

    // Notify the student
    try {
      const subDoc = await getDoc(docRef);
      if (subDoc.exists()) {
        const subData = subDoc.data();
        const assignDoc = await getDoc(doc(db, ASSIGNMENTS_COLLECTION, subData.assignmentId));
        const assignTitle = assignDoc.exists() ? assignDoc.data().title : 'your assignment';
        
        await notificationService.createNotification({
          userId: subData.studentId,
          title: 'Assignment Graded',
          message: `Your submission for "${assignTitle}" has been graded.`,
          type: 'GRADING',
          link: '/student-grades'
        });
      }
    } catch (err) {
      console.error('Error sending grade notification:', err);
    }
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
