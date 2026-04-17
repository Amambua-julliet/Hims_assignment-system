import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'SUBMISSION' | 'GRADING' | 'ANNOUNCEMENT' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<string> {
    const docRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    const newNotification: Notification = {
      ...notification,
      id: docRef.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newNotification);
    return docRef.id;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  },

  async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { isRead: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    const promises = querySnapshot.docs.map(notificationDoc => 
      updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationDoc.id), { isRead: true })
    );
    await Promise.all(promises);
  }
};
