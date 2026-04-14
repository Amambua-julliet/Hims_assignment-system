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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  department?: string; // Added for students/lecturers
  level?: string; // Added for students
  avatar?: string;
  createdAt: string;
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
  }
};
