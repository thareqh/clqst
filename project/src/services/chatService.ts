import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message, Chat } from '../types/chat';

export async function createChat(participants: Array<{ id: string; name: string; avatar?: string }>) {
  try {
    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const participantIds = participants.map(p => p.id).sort();
    
    const q = query(
      chatsRef,
      where('participantIds', '==', participantIds)
    );
    
    const existingChats = await getDocs(q);
    if (!existingChats.empty) {
      // Return existing chat
      const chatDoc = existingChats.docs[0];
      return {
        id: chatDoc.id,
        ...chatDoc.data()
      } as Chat;
    }

    // Create new chat
    const chatData = {
      participants,
      participantIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const chatRef = await addDoc(chatsRef, chatData);
    return {
      id: chatRef.id,
      ...chatData
    } as Chat;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

export async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'messages'), {
      ...message,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export function subscribeToMessages(userId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
}

export function subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
  const q = query(
    collection(db, 'chats'),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];
    callback(chats);
  });
}