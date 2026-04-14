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

export interface Course {
  id: string; // Firestore UID
  code: string; // e.g., SWE301
  name: string;
  lecturerId: string;
  lecturerName: string;
  department: string; // Added
  level: string; // Added (e.g., Level 300)
  semester: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const COURSES_COLLECTION = 'courses';

export const courseService = {
  // Get all courses (Admin)
  async getAllCourses(): Promise<Course[]> {
    const querySnapshot = await getDocs(collection(db, COURSES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
  },

  // Get courses by lecturer (Lecturer)
  async getCoursesByLecturer(lecturerId: string): Promise<Course[]> {
    const q = query(collection(db, COURSES_COLLECTION), where("lecturerId", "==", lecturerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
  },

  // Get courses for student (Student)
  async getCoursesForStudent(department: string, level: string): Promise<Course[]> {
    const q = query(
      collection(db, COURSES_COLLECTION), 
      where("department", "==", department),
      where("level", "==", level),
      where("status", "==", "Active")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
  },

  // Create course (Admin only)
  async createCourse(course: Omit<Course, 'id' | 'createdAt'>): Promise<string> {
    const docRef = doc(collection(db, COURSES_COLLECTION));
    const newCourse: Course = {
      ...course,
      id: docRef.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newCourse);
    return docRef.id;
  },

  // Update course
  async updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await updateDoc(docRef, data);
  },

  // Delete course
  async deleteCourse(courseId: string): Promise<void> {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(docRef);
  }
};
