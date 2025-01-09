import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from '../services/userService';
import { uploadProfileImage } from '../services/storageService';
import type { UserProfile } from '../types/user';
import type { RegistrationData } from '../types/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logWithMask } from '@/utils/logger';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (email: string, password: string, data: RegistrationData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    console.log('Setting up profile listener for user:', currentUser.uid);

    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, {
      next: (doc) => {
        logWithMask('Profile document changed:', doc.data());
        if (doc.exists()) {
          const data = doc.data();
          const profileData = {
            ...data,
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            id: doc.id
          } as UserProfile;
          logWithMask('Setting user profile:', profileData);
          setUserProfile(profileData);
        } else {
          console.log('Profile document does not exist');
          setUserProfile(null);
        }
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error listening to profile changes:', error);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up profile listener');
      unsubscribe();
    };
  }, [currentUser]);

  async function signup(email: string, password: string, data: RegistrationData) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateFirebaseProfile(user, { 
      displayName: data.fullName
    });

    let profileImage;
    if (data.profileImage) {
      try {
        const imageFile = await fetch(data.profileImage).then(r => r.blob());
        profileImage = await uploadProfileImage(new File([imageFile], 'profile.jpg', { type: 'image/jpeg' }));
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }

    const profileData: Partial<UserProfile> = {
      email,
      fullName: data.fullName,
      professionalTitle: data.professionalTitle,
      bio: data.bio,
      skills: data.skills || [],
      projectPreferences: data.projectPreferences || [],
      collaborationPreferences: data.collaborationStyles?.map(style => 
        style as 'Remote' | 'Hybrid' | 'On-site'
      ) || [],
      country: data.country || '',
      languages: data.languages || [],
      weeklyAvailability: data.weeklyAvailability || 40,
      profileImage: profileImage || undefined,
      profileEmoji: data.profileEmoji,
      profileColor: data.profileColor
    };

    await createUserProfile(user.uid, profileData);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  async function updateProfile(data: Partial<UserProfile>) {
    if (!currentUser) throw new Error('No user logged in');

    try {
      console.log('Updating profile with data:', data);
      
      // Update Firebase Auth displayName if fullName changes
      if (data.fullName) {
        await updateFirebaseProfile(currentUser, {
          displayName: data.fullName
        });
        // Force refresh the current user to get updated displayName
        await currentUser.reload();
        // Update the local currentUser state
        setCurrentUser(auth.currentUser);
      }

      // Update server
      await updateUserProfile(currentUser.uid, data);
      
      // Refresh user profile
      await refreshUserProfile();
      
      console.log('Profile update successful');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async function refreshUserProfile() {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        // Update Firebase Auth displayName untuk memastikan sinkronisasi
        if (profile.fullName !== currentUser.displayName) {
          await updateFirebaseProfile(currentUser, {
            displayName: profile.fullName
          });
        }
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  }

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    updateProfile,
    refreshUserProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export { useAuth };