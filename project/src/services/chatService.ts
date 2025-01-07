import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: 'project' | 'dm';
  createdAt: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: string;
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      name: string;
    };
  };
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[];
  chatId?: string;
  projectId?: string;
}

interface ChatData {
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: Record<string, number>;
}

interface Chat extends ChatData {
  id: string;
}

function validateChatData(data: any): data is ChatData {
  return (
    data &&
    Array.isArray(data.participants) &&
    data.participants.length > 0 &&
    data.participants.every((p: any) => p && p.id && typeof p.id === 'string' && p.name && typeof p.name === 'string') &&
    Array.isArray(data.participantIds) &&
    data.participantIds.length > 0 &&
    data.participantIds.every((id: any) => id && typeof id === 'string') &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string'
  );
}

export async function createChat(participants: Array<{ id: string; name: string; avatar?: string }>) {
  try {
    if (!participants || participants.length < 2) {
      throw new Error('At least two participants are required');
    }

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

    // Create new chat with validated data
    const chatData: ChatData = {
      participants: participants.map(p => ({
        id: p.id,
        name: p.name || 'Anonymous',
        ...(p.avatar && { avatar: p.avatar })
      })),
      participantIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: participants.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
    };

    // Validate chat data before creating
    if (!validateChatData(chatData)) {
      throw new Error('Invalid chat data');
    }

    const chatRef = await addDoc(chatsRef, chatData);
    const newChat: Chat = {
      id: chatRef.id,
      ...chatData
    };
    return newChat;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

export async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
  try {
    if (!message.content || !message.sender || !message.sender.id || !message.type) {
      throw new Error('Invalid message data');
    }

    const messageData = {
      ...message,
      createdAt: new Date().toISOString(),
      readBy: [message.sender.id],
      status: 'sent'
    };

    await addDoc(collection(db, 'messages'), messageData);
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