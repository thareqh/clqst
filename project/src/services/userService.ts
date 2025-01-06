import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile } from '../types/user';

export async function createUserProfile(userId: string, data: Partial<UserProfile>) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Clean undefined values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const userRef = doc(db, 'users', userId);
    
    // Add timestamps
    const profileData = {
      ...cleanData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(userRef, profileData);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Updating user profile in Firestore:', { userId, data });

    // Clean undefined values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const userRef = doc(db, 'users', userId);

    // Tambahkan timestamp server
    const updateData = {
      ...cleanData,
      updatedAt: serverTimestamp()
    };

    console.log('Final update data:', updateData);

    await updateDoc(userRef, updateData);
    
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}