import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration should be in .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Add security rules helper
export const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
    
    // Profiles collection
    match /profiles/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if isSignedIn() && (
        resource.data.owner.id == request.auth.uid ||
        request.auth.uid in resource.data.members[*].id
      );
      allow write: if isSignedIn() && (
        resource.data.owner.id == request.auth.uid
      );
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isSignedIn() && (
        resource.data.type == 'project' ? (
          exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
          (get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.owner.id == request.auth.uid ||
           request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.members[*].id)
        ) : (
          resource.data.type == 'dm' &&
          request.auth.uid in resource.data.participants
        )
      );
      allow create: if isSignedIn() && (
        request.resource.data.sender.id == request.auth.uid
      );
      allow update: if isSignedIn() && (
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reactions', 'readBy', 'status'])
      );
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if isSignedIn() && (
        request.auth.uid in resource.data.participantIds
      );
      allow create: if isSignedIn() && (
        request.resource.data.participantIds.hasAll([request.auth.uid])
      );
      allow update: if isSignedIn() && (
        request.auth.uid in resource.data.participantIds &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastMessage', 'lastMessageTime'])
      );
    }
  }
}
`;