import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { UserManagementData, UserRole, User } from '../types';

export const userManagementService = {
  async createUser(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    createdBy: string
  ): Promise<UserManagementData> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore using UID as document ID
      const userData: Omit<UserManagementData, 'id'> = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role,
        createdAt: new Date(),
        createdBy,
        isActive: true
      };
      
      await setDoc(doc(db, 'userRoles', user.uid), userData);
      
      return {
        id: user.uid,
        ...userData
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async assignRoleToExistingUser(
    uid: string,
    email: string,
    displayName: string,
    role: UserRole,
    assignedBy: string
  ): Promise<UserManagementData> {
    try {
      const userData: Omit<UserManagementData, 'id'> = {
        uid,
        email,
        displayName,
        role,
        createdAt: new Date(),
        createdBy: assignedBy,
        isActive: true
      };
      
      await setDoc(doc(db, 'userRoles', uid), userData);
      
      return {
        id: uid,
        ...userData
      };
    } catch (error) {
      console.error('Error assigning role to existing user:', error);
      throw error;
    }
  },

  async getAllUsers(): Promise<UserManagementData[]> {
    try {
      const q = query(
        collection(db, 'userRoles'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserManagementData));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getAllUsersWithoutRoles(): Promise<{ uid: string; email: string; displayName: string }[]> {
    try {
      // Get all users with roles
      const rolesQuery = query(collection(db, 'userRoles'));
      const rolesSnapshot = await getDocs(rolesQuery);
      const usersWithRoles = new Set(rolesSnapshot.docs.map(doc => doc.id));

      // For now, we'll return an empty array since we can't directly access all Firebase Auth users
      // In a real implementation, you'd need Firebase Admin SDK or a cloud function
      return [];
    } catch (error) {
      console.error('Error fetching users without roles:', error);
      throw error;
    }
  },

  async getUserByUid(uid: string): Promise<UserManagementData | null> {
    try {
      const userDoc = await getDocs(query(collection(db, 'userRoles'), where('uid', '==', uid)));
      
      if (userDoc.empty) {
        return null;
      }
      
      const doc = userDoc.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as UserManagementData;
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      throw error;
    }
  },

  async getUserRoleByUid(uid: string): Promise<UserRole | null> {
    try {
      const userDoc = doc(db, 'userRoles', uid);
      const docSnap = await getDocs(query(collection(db, 'userRoles'), where('uid', '==', uid)));
      
      if (docSnap.empty) {
        return null;
      }
      
      const userData = docSnap.docs[0].data() as UserManagementData;
      return userData.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const userRef = doc(db, 'userRoles', userId);
      await updateDoc(userRef, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  async deactivateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'userRoles', userId);
      await updateDoc(userRef, { isActive: false });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  async activateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'userRoles', userId);
      await updateDoc(userRef, { isActive: true });
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'userRoles', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
