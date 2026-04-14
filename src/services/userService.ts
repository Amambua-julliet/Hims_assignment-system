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
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  matricule?: string; // Auto-generated ID
  department?: string; // Added for students/lecturers
  level?: string; // Added for students
  avatar?: string;
  createdAt: string;
  registeredCourseIds?: string[]; // Array of course IDs the student is registered for
}

const USERS_COLLECTION = 'users';

export const userService = {
  // Get all users
  async getAllUsers(): Promise<UserProfile[]> {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserProfile));
  },

  // Get user by ID
  async getUserById(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  },

  // Add/Create user profile
  async createUserProfile(profile: UserProfile): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, profile.id);
    await setDoc(docRef, {
      ...profile,
      createdAt: new Date().toISOString()
    });
  },

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, data);
  },

  // Delete user profile
  async deleteUserProfile(uid: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(docRef);
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<UserProfile[]> {
    const q = query(collection(db, USERS_COLLECTION), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserProfile));
  },

  // explicit register
  async registerForCourse(uid: string, courseId: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      registeredCourseIds: arrayUnion(courseId)
    });
  },

  // Get students registered for a course
  async getStudentsByCourse(courseId: string): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where("role", "==", "STUDENT"),
        where("registeredCourseIds", "array-contains", courseId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (err: any) {
      console.error(`Error fetching students for course ${courseId}:`, err);
      // Special check for permission issues often faced by lecturers
      if (err.code === 'permission-denied') {
        console.warn('Lecturer lacks permission to read student roster for this course.');
      }
      return [];
    }
  }
};
