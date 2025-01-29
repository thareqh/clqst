import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs, doc, getDoc, DocumentData, updateDoc, limit, arrayUnion, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, storage } from '@/config/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import {
  PaperClipIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  HandThumbUpIcon,
  ChevronLeftIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logger } from '@/utils/logger';
import { addFileFromChat } from '@/services/fileService';

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

interface Project {
  id: string;
  title: string;
  coverImage?: string;
  members: {
  id: string;
  name: string;
    avatar?: string;
  }[];
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface DirectMessage {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount: number;
  lastMessageTime?: string;
}

interface MessageGroup {
  date: string;
  messages: Message[];
}

interface FirestoreUser {
  displayName?: string;
  photoURL?: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
}

export function Chat() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [chatType, setChatType] = useState<'dm' | 'project'>('dm');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [targetUser, setTargetUser] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Group messages by date
  const groupedMessages = messages.reduce((groups: MessageGroup[], message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    const group = groups.find(g => g.date === date);
    
    if (group) {
      group.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
    
    return groups;
  }, []);

  // Handle URL parameters with user info extraction
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    const targetName = searchParams.get('name');
    const targetAvatar = searchParams.get('avatar');
    
    if (projectId) {
      setActiveProject(projectId);
      setChatType('project');
    } else if (chatId) {
      setActiveDM(chatId);
      setChatType('dm');
      
      // Set initial target user info from URL params
      if (targetName || targetAvatar) {
        logger.debug('Setting initial target user from params');
        setTargetUser({
          id: chatId,
          name: targetName ?? 'Anonymous',
          avatar: targetAvatar ?? undefined
        });
      }
    }
  }, [searchParams, chatId]);

  // Fetch user's projects
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        logger.debug('Fetching projects');
        
        // Query untuk mendapatkan semua proyek dimana user adalah member atau owner
        const projectsRef = collection(db, 'projects');
        const memberProjectsQuery = query(
          projectsRef,
          where('members', 'array-contains', {
            id: user.uid,
            name: user.displayName || 'Anonymous',
            avatar: user.photoURL
          })
        );
        const ownerProjectsQuery = query(
          projectsRef,
          where('owner.id', '==', user.uid)
        );

        const [memberSnapshot, ownerSnapshot] = await Promise.all([
          getDocs(memberProjectsQuery),
          getDocs(ownerProjectsQuery)
        ]);

        const memberProjects = memberSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        const ownerProjects = ownerSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        // Gabungkan dan hilangkan duplikat
        const allProjects = [...memberProjects, ...ownerProjects];
        const uniqueProjects = allProjects.filter((project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
        );

        logger.info('Projects loaded', { count: uniqueProjects.length });
        setProjects(uniqueProjects);
      } catch (error) {
        logger.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      }
    };

    fetchProjects();
  }, [user]);

  // Reset target user when switching chat type
  useEffect(() => {
    if (chatType === 'project') {
      setTargetUser(null);
      setActiveDM(null);
    } else if (chatType === 'dm') {
      setActiveProject(null);
    }
  }, [chatType]);

  // Fetch direct messages
  useEffect(() => {
    if (!user) return;

    logger.info('Setting up chat listener');
    
    // Query untuk mendapatkan chats dimana user adalah participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      try {
        logger.debug('Processing chats snapshot:', { count: snapshot.docs.length });
        const newDirectMessages: DirectMessage[] = [];

        for (const doc of snapshot.docs) {
          const chatData = doc.data();
          logger.debug('Processing chat data', { chatId: doc.id });

          // Cari ID participant lain
          const otherParticipantId = chatData.participantIds?.find(
            (id: string) => id !== user.uid
          );

          if (otherParticipantId) {
            // Ambil data participant dari array participants
            const otherParticipant = chatData.participants?.find(
              (p: any) => p.id === otherParticipantId
            );

            if (otherParticipant) {
              logger.debug('Found participant data');
              
              // Ambil pesan terakhir
              const messagesQuery = query(
                collection(db, 'messages'),
                where('chatId', '==', doc.id),
                where('type', '==', 'dm'),
                orderBy('createdAt', 'desc'),
                limit(1)
              );

              const messagesSnap = await getDocs(messagesQuery);
              const lastMessage = messagesSnap.docs[0]?.data();

              newDirectMessages.push({
                id: doc.id,
                userId: otherParticipantId,
                name: otherParticipant.name || 'Anonymous',
                avatar: otherParticipant.avatar,
                lastMessage: lastMessage?.content || chatData.lastMessage,
                unreadCount: chatData.unreadCount?.[user.uid] || 0,
                lastMessageTime: lastMessage?.createdAt || chatData.lastMessageTime
              });
            }
          }
        }

        // Sort by most recent message
        newDirectMessages.sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });

        logger.info('Setting direct messages', { count: newDirectMessages.length });
        setDirectMessages(newDirectMessages);
      } catch (error) {
        logger.error('Error processing chats:', error);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages with better filtering
  useEffect(() => {
    if (!user) return;

    let messagesQuery;
    if (chatType === 'project' && activeProject) {
      messagesQuery = query(
        collection(db, 'messages'),
        where('projectId', '==', activeProject),
        where('type', '==', 'project'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else if (chatType === 'dm' && (activeDM || chatId)) {
      const dmId = activeDM || chatId;
      logger.debug('Fetching messages for chat', { chatId: dmId });
      messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', dmId),
        where('type', '==', 'dm'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      return;
    }

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      try {
        let participantsInfo = new Map();
        
        if (chatType === 'dm' && (activeDM || chatId)) {
          const chatRef = doc(db, 'chats', activeDM || chatId || '');
          const chatSnap = await getDoc(chatRef);
          
          if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            logger.debug('Processing chat data');
            chatData.participants?.forEach((p: any) => {
              participantsInfo.set(p.id, {
                name: p.name,
                avatar: p.avatar
              });
            });
          }
        }

        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          logger.debug('Processing message data');
          const senderInfo = participantsInfo.get(data.sender.id);
          
          return {
            id: doc.id,
            content: data.content,
            sender: {
              id: data.sender.id,
              name: senderInfo?.name || data.sender.name,
              avatar: senderInfo?.avatar || data.sender.avatar
            },
            type: data.type,
            createdAt: data.createdAt,
            attachments: data.attachments,
            reactions: data.reactions,
            replyTo: data.replyTo,
            status: data.status,
            readBy: data.readBy,
            chatId: data.chatId,
            projectId: data.projectId
          } as Message;
        });

        logger.debug('Setting messages', { count: messages.length });
        setMessages(messages.reverse());
        scrollToBottom();
      } catch (error) {
        logger.error('Error loading messages:', error);
      }
    });

    return () => unsubscribe();
  }, [user, activeProject, activeDM, chatType, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!user || (!activeProject && !activeDM && !chatId) || !newMessage.trim()) return;

    try {
      setIsUploading(true);
      const currentChatId = activeDM || chatId;
      logger.debug('Preparing to send message', { chatId: currentChatId });
      
      // Get user profile data first
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : null;
      
      // Upload attachments
      const uploadedFiles = await Promise.all(
        attachments.map(async (file) => {
          const storageRef = ref(storage, `chat/${activeProject || currentChatId}/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          
          // Add to file system if in project chat
          if (activeProject) {
            await addFileFromChat(
              {
                name: file.name,
                url,
                type: file.type,
                size: file.size
              },
              activeProject,
              user.uid,
              profileData?.fullName || user.displayName || 'Anonymous',
              profileData?.avatar || profileData?.profileImage || profileData?.photoURL || user.photoURL || undefined
            );
          }

          return {
            name: file.name,
            url,
            type: file.type
          };
        })
      );

      // Create message with complete profile data
      const messageData = {
        content: newMessage,
        sender: {
          id: user.uid,
          name: profileData?.fullName || user.displayName || 'Anonymous',
          avatar: profileData?.avatar || profileData?.profileImage || profileData?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || user.displayName || 'Anonymous')}&background=random`
        },
        type: chatType,
        createdAt: new Date().toISOString(),
        attachments: uploadedFiles,
        ...(replyingTo && {
          replyTo: {
            id: replyingTo.id,
            content: replyingTo.content,
            sender: {
              name: replyingTo.sender.name
            }
          }
        }),
        ...(chatType === 'project' 
          ? { projectId: activeProject } 
          : { 
              chatId: currentChatId,
              readBy: [user.uid]
            }
        )
      };

      logger.debug('Sending message with profile data:', messageData);
      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Update chat document for DMs
      if (chatType === 'dm' && currentChatId) {
        const chatRef = doc(db, 'chats', currentChatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          const otherParticipantId = chatData.participantIds.find((id: string) => id !== user.uid);
          
          // Update chat with last message info and sender profile
          await updateDoc(chatRef, {
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
            [`unreadCount.${otherParticipantId}`]: (chatData.unreadCount?.[otherParticipantId] || 0) + 1,
            participants: chatData.participants.map((p: any) => 
              p.id === user.uid 
                ? {
                    ...p,
                    name: profileData?.fullName || user.displayName || 'Anonymous',
                    avatar: profileData?.avatar || profileData?.profileImage || profileData?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || user.displayName || 'Anonymous')}&background=random`
                  }
                : p
            )
          });
        }
      }

      setNewMessage('');
      setAttachments([]);
      setReplyingTo(null);
      setIsUploading(false);
      scrollToBottom();
    } catch (error) {
      logger.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length !== files.length) {
        toast.error('Only image files are supported');
      }
      
      setAttachments(imageFiles);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const message = messageDoc.data();
        const reactions = message.reactions || [];
        
        // Check if user already reacted with this emoji
        const existingReactionIndex = reactions.findIndex(
          (r: { emoji: string; userId: string }) => 
            r.emoji === emoji && r.userId === user.uid
        );

        let updatedReactions;
        if (existingReactionIndex > -1) {
          // Remove reaction if already exists
          updatedReactions = reactions.filter((_: any, index: number) => index !== existingReactionIndex);
        } else {
          // Add new reaction
          updatedReactions = [...reactions, { emoji, userId: user.uid }];
        }

        await updateDoc(messageRef, {
          reactions: updatedReactions
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Handle clicking outside emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiObject: any) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const text = newMessage.slice(0, cursor) + emojiObject.emoji + newMessage.slice(cursor);
    setNewMessage(text);
    setShowEmojiPicker(false);
  };

  // Add textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchLower = query.toLowerCase();
    
    // Search in current messages first
    const results = messages.filter(message => 
      message.content.toLowerCase().includes(searchLower)
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Subscribe to direct messages
  useEffect(() => {
    if (!user) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const dms = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const otherUserId = data.participants.find((id: string) => id !== user.uid);
          
          // Get unread count specifically for current user
          const unreadCount = data.unreadCount?.[user.uid] || 0;
          
          return {
            id: doc.id,
            userId: otherUserId,
            name: data.participantNames?.[otherUserId] || 'Unknown',
            avatar: data.participantAvatars?.[otherUserId],
            lastMessage: data.lastMessage || '',
            lastMessageTime: data.lastMessageTime,
            unreadCount
          };
        })
      );

      setDirectMessages(dms);
    });

    return () => unsubscribe();
  }, [user]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!user || !activeDM) return;

    const chatRef = doc(db, 'chats', activeDM);
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', activeDM),
      orderBy('createdAt', 'desc')
    );

    const markMessagesAsRead = async () => {
      const snapshot = await getDocs(messagesQuery);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      
      // Filter messages that need to be marked as read
      snapshot.docs.forEach(doc => {
        const messageData = doc.data();
        if (
          messageData.sender.id !== user.uid && 
          (!messageData.readBy || !messageData.readBy.includes(user.uid))
        ) {
          batch.update(doc.ref, {
        readBy: arrayUnion(user.uid)
      });
        }
      });

      // Reset unread count
      batch.update(chatRef, {
        [`unreadCount.${user.uid}`]: 0
      });

      await batch.commit();

      // Update local state
      setDirectMessages(prev => prev.map(dm => 
        dm.id === activeDM 
          ? { ...dm, unreadCount: 0 }
          : dm
      ));
    };

    markMessagesAsRead();
  }, [user, activeDM]);

  // Add effect to reset replyingTo when project/DM changes
  useEffect(() => {
    setReplyingTo(null);
  }, [activeProject, activeDM]);

  // Fetch user data helper function
  const fetchUserData = async (userId: string) => {
    logger.debug('Fetching user data', { userId });
    
    try {
      // Try profiles collection first
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        logger.debug('Found user in profiles');
        return {
          id: userId,
          name: profileData.fullName || profileData.name || 'Anonymous',
          avatar: profileData.avatar || profileData.profileImage || profileData.photoURL || profileData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || profileData.name || 'Anonymous')}&background=random`
        };
      }

      // If not found in profiles, try chats collection
      if (chatId) {
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          logger.debug('Found chat data');
          
          // Get participant info for the other user
          const participant = chatData.participants?.find((p: any) => p.id === userId);
          if (participant) {
            logger.debug('Found participant data');
            return {
              id: userId,
              name: participant.name || 'Anonymous',
              avatar: participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name || 'Anonymous')}&background=random`
            };
          }
        }
      }

      // If not found anywhere, return default with UI Avatars
      logger.debug('User not found in any collection');
      return {
        id: userId,
        name: 'Anonymous',
        avatar: `https://ui-avatars.com/api/?name=Anonymous&background=random`
      };
    } catch (error) {
      logger.error('Error fetching user data:', error);
      return {
        id: userId,
        name: 'Error Loading',
        avatar: `https://ui-avatars.com/api/?name=Error&background=random`
      };
    }
  };

  // Fetch target user info
  useEffect(() => {
    if (!chatId || !user) return;

    const loadTargetUser = async () => {
      try {
        logger.debug('Loading target user info', { chatId });
        
        // Try to get from chat document first
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          logger.debug('Found chat data');
          
          // Get the other participant's info
          const otherParticipantId = chatData.participantIds?.find(
            (id: string) => id !== user.uid
          );
          
          if (otherParticipantId) {
            const otherParticipant = chatData.participants?.find(
              (p: any) => p.id === otherParticipantId
            );
            
            if (otherParticipant) {
              logger.debug('Found participant data');
              setTargetUser({
                id: otherParticipantId,
                name: otherParticipant.name || 'Anonymous',
                avatar: otherParticipant.avatar
              });
              return;
            }
          }
        }

        // If not found in chat, try existing DMs
        const existingDM = directMessages.find(dm => dm.userId === chatId);
        if (existingDM) {
          logger.debug('Found in direct messages');
          setTargetUser({
            id: existingDM.userId,
            name: existingDM.name,
            avatar: existingDM.avatar
          });
          return;
        }

        // If not found anywhere, try profiles
        const profileRef = doc(db, 'profiles', chatId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          logger.debug('Found in profiles');
          setTargetUser({
            id: chatId,
            name: profileData.name || 'Anonymous',
            avatar: profileData.avatar || profileData.profileImage || profileData.photoURL || profileData.photo
          });
        } else {
          logger.debug('Using URL params as fallback');
          setTargetUser({
            id: chatId,
            name: searchParams.get('name') || 'Anonymous',
            avatar: searchParams.get('avatar') || undefined
          });
        }
      } catch (error) {
        logger.error('Error loading target user:', error);
        setTargetUser({
          id: chatId,
          name: 'Error Loading User',
          avatar: undefined
        });
      }
    };

    loadTargetUser();
  }, [chatId, user, directMessages, searchParams]);

  // Handle DM click
  const handleDMClick = async (dm: DirectMessage) => {
    // Update URL tanpa refresh menggunakan replace
    window.history.replaceState({}, '', `/app/chat/${dm.id}`);
    
    setActiveDM(dm.id);
    setActiveProject(null);
    setChatType('dm');
    setReplyingTo(null);
    setShowSidebar(false);

    // Get fresh participant data from chat document
    try {
      const chatRef = doc(db, 'chats', dm.id);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const otherParticipant = chatData.participants?.find(
          (p: any) => p.id === dm.userId
        );
        
        if (otherParticipant) {
          setTargetUser({
            id: dm.userId,
            name: otherParticipant.name,
            avatar: otherParticipant.avatar
          });
        }
      }
    } catch (error) {
      console.error('Error getting participant data:', error);
    }
  };

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    // Update URL tanpa refresh
    window.history.replaceState({}, '', `/app/chat?projectId=${projectId}`);
    
    setActiveProject(projectId);
    setActiveDM(null);
    setChatType('project');
    setReplyingTo(null);
    setShowSidebar(false);
  };

  // Subscribe to user profile changes
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserProfiles(prev => ({
          ...prev,
          [user.uid]: {
            id: user.uid,
            name: userData.fullName || user.displayName || 'Anonymous',
            avatar: userData.avatar || userData.profileImage || userData.photoURL || user.photoURL
          }
        }));
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load all DM users' profiles proactively
  useEffect(() => {
    if (!directMessages.length) return;

    const loadProfiles = async () => {
      const profilePromises = directMessages.map(async (dm) => {
        try {
          // Try profiles collection first
          const profileRef = doc(db, 'profiles', dm.userId);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            return {
              id: dm.userId,
              name: profileData.fullName || profileData.name || dm.name,
              avatar: profileData.avatar || profileData.profileImage || profileData.photoURL || dm.avatar
            };
          }

          // If not in profiles, try users collection
          const userRef = doc(db, 'users', dm.userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            return {
              id: dm.userId,
              name: userData.fullName || userData.displayName || dm.name,
              avatar: userData.avatar || userData.profileImage || userData.photoURL || dm.avatar
            };
          }

          return {
            id: dm.userId,
            name: dm.name,
            avatar: dm.avatar
          };
        } catch (error) {
          console.error('Error loading profile:', error);
          return null;
        }
      });

      const profiles = await Promise.all(profilePromises);
      const validProfiles = profiles.filter(Boolean);
      
      setUserProfiles(prev => ({
        ...prev,
        ...Object.fromEntries(validProfiles.map(profile => [profile!.id, profile!]))
      }));
    };

    loadProfiles();
  }, [directMessages]);

  // Subscribe to target user profile changes
  useEffect(() => {
    if (!targetUser?.id) return;

    const userRef = doc(db, 'users', targetUser.id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserProfiles(prev => ({
          ...prev,
          [targetUser.id]: {
            id: targetUser.id,
            name: userData.fullName || targetUser.name,
            avatar: userData.avatar || userData.profileImage || userData.photoURL || targetUser.avatar
          }
        }));
      }
    });

    return () => unsubscribe();
  }, [targetUser?.id]);

  // Add delete message function
  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      // Delete message from Firestore
      const messageRef = doc(db, 'messages', messageId);
      await deleteDoc(messageRef);
      
      // Update last message in chat if needed
      if (activeDM) {
        const chatRef = doc(db, 'chats', activeDM);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          // If deleted message was the last message, update chat
          if (chatData.lastMessage === messages.find(m => m.id === messageId)?.content) {
            const previousMessage = messages.find(m => m.id !== messageId);
            await updateDoc(chatRef, {
              lastMessage: previousMessage?.content || '',
              lastMessageTime: previousMessage?.createdAt || new Date().toISOString()
            });
          }
        }
      }

      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Add delete conversation function
  const handleDeleteConversation = async () => {
    if (!user || !activeDM) return;
    
    try {
      // Delete all messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', activeDM)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      await Promise.all(
        messagesSnapshot.docs.map(doc => deleteDoc(doc.ref))
      );
      
      // Update chat document
      const chatRef = doc(db, 'chats', activeDM);
      await updateDoc(chatRef, {
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        [`unreadCount.${user.uid}`]: 0
      });

      toast.success('Conversation deleted');
      setShowChatMenu(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Add remove from DM list function
  const handleRemoveFromDM = async () => {
    if (!user || !activeDM) return;
    
    try {
      const chatRef = doc(db, 'chats', activeDM);
      await deleteDoc(chatRef);
      
      toast.success('Removed from messages');
      navigate('/app/chat');
      setShowChatMenu(false);
    } catch (error) {
      console.error('Error removing chat:', error);
      toast.error('Failed to remove from messages');
    }
  };

  // Subscribe to messages and handle notifications
  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = change.doc.data();
          // Only show notification if it's a new message and not from the current user
          if (message.sender.id !== user.uid && new Date(message.createdAt).getTime() > Date.now() - 1000) {
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Message', {
                body: `${message.sender.name}: ${message.content}`,
                icon: message.sender.avatar
              });
            } else if ('Notification' in window && Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('New Message', {
                    body: `${message.sender.name}: ${message.content}`,
                    icon: message.sender.avatar
                  });
                }
              });
            }
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Error playing sound:', e));
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="h-[100dvh] flex flex-col sm:flex-row sm:gap-6 bg-gray-50/50 overflow-hidden p-0 sm:p-6">
        {/* Sidebar */}
      <Card className={`w-full sm:w-[380px] flex flex-col h-[100dvh] sm:h-[calc(100dvh-3rem)] rounded-none sm:rounded-2xl border-0 sm:border ${!showSidebar ? 'hidden sm:flex' : ''}`}>
        <div className="sticky top-0 z-10 px-4 py-4 sm:p-6 border-b border-gray-100 flex-shrink-0 bg-white">
          <h2 className="text-lg font-medium text-gray-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {/* Projects List */}
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 hover:bg-gray-50/80 transition-colors ${
                  activeProject === project.id ? 'bg-white shadow-sm border border-gray-100' : ''
                }`}
              >
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <span className="text-base">🎯</span>
                  </div>
                )}
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900 text-sm">{project.title}</h3>
                  <p className="text-xs text-gray-500">
                    {project.members.length} members
                  </p>
                </div>
              </button>
            ))}
          </div>

              {/* Direct Messages */}
          <div className="mt-6">
            <h3 className="text-xs font-medium text-gray-500 mb-3 px-2">Direct Messages</h3>
            <div className="space-y-1">
                  {directMessages.map((dm) => (
                <div key={dm.id} className="group flex items-center gap-2 px-1">
                    <button
                      onClick={() => handleDMClick(dm)}
                    className={`flex-1 p-3 rounded-xl flex items-center gap-3 hover:bg-gray-50/80 transition-colors ${
                      activeDM === dm.id ? 'bg-white shadow-sm border border-gray-100' : ''
                      }`}
                    >
                      {(userProfiles[dm.userId]?.avatar || dm.avatar) ? (
                        <img
                          src={userProfiles[dm.userId]?.avatar || dm.avatar}
                          alt={userProfiles[dm.userId]?.name || dm.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                          onError={(e) => {
                            if (e.currentTarget instanceof HTMLImageElement) {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfiles[dm.userId]?.name || dm.name)}&background=random`;
                            }
                          }}
                        />
                      ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-white flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-900">
                            {(userProfiles[dm.userId]?.name || dm.name).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {userProfiles[dm.userId]?.name || dm.name}
                        </h4>
                        {dm.unreadCount > 0 && (
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-50 text-[11px] font-medium text-red-600">
                            {dm.unreadCount > 99 ? '99+' : dm.unreadCount}
                          </span>
                        )}
                      </div>
                        {dm.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">
                            {dm.lastMessage}
                          </p>
                        )}
                      </div>
                    </button>
                  
                  {/* Menu for each DM */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDM(dm.id);
                      setShowChatMenu(!showChatMenu);
                    }}
                    className="p-2 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-50 hover:text-gray-600 transition-all"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                  
                  {showChatMenu && activeDM === dm.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-100">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation();
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 transition-colors flex items-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete conversation
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromDM();
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50/80 hover:text-red-600 transition-colors flex items-center gap-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Remove from messages
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Chat Area */}
      <Card className={`w-full flex-1 flex flex-col h-[100dvh] sm:h-[calc(100dvh-3rem)] rounded-none sm:rounded-2xl border-0 sm:border ${showSidebar ? 'hidden sm:flex' : 'flex'}`}>
          {(activeProject || activeDM || chatId) ? (
            <>
              {/* Chat Header */}
            <div className="sticky top-0 z-20 px-4 py-3 sm:p-4 border-b border-gray-100 flex-shrink-0 bg-white">
                  <div className="flex items-center gap-3">
                  {/* Back Button for Mobile */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors sm:hidden"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {chatType === 'project' && activeProject && (
                    <div className="flex items-center gap-3">
                      {projects.find(p => p.id === activeProject)?.coverImage ? (
                        <img
                          src={projects.find(p => p.id === activeProject)?.coverImage}
                          alt={projects.find(p => p.id === activeProject)?.title}
                        className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <span className="text-base">🎯</span>
                        </div>
                      )}
                      <div>
                      <h2 className="font-medium text-gray-900">
                          {projects.find(p => p.id === activeProject)?.title}
                        </h2>
                      <p className="text-sm text-gray-500">
                          {projects.find(p => p.id === activeProject)?.members.length} members
                        </p>
                      </div>
                    </div>
                  )}

                  {(chatType === 'dm' || chatId) && targetUser && (
                    <div className="flex items-center gap-3">
                        {(userProfiles[targetUser.id]?.avatar || targetUser.avatar) ? (
                          <img
                            src={userProfiles[targetUser.id]?.avatar || targetUser.avatar}
                            alt={userProfiles[targetUser.id]?.name || targetUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                          onError={(e) => {
                            if (e.currentTarget instanceof HTMLImageElement && targetUser) {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfiles[targetUser.id]?.name || targetUser.name)}&background=random`;
                            }
                          }}
                          />
                        ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-white flex items-center justify-center">
                        <span className="text-base font-medium text-gray-900">
                              {(userProfiles[targetUser.id]?.name || targetUser.name).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                    <h2 className="font-medium text-gray-900">
                        {userProfiles[targetUser.id]?.name || targetUser.name || directMessages.find(d => d.userId === activeDM)?.name || 'Loading...'}
                      </h2>
                        </div>
                    )}
                </div>
              </div>

              {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {groupedMessages.map((group) => (
                <div key={group.date} className="space-y-6">
                    <div className="text-center sticky top-2 z-10">
                    <span className="px-3 py-1 text-xs font-medium bg-white/90 text-gray-500 rounded-full shadow-sm border backdrop-blur-sm">
                        {format(new Date(group.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    {group.messages.map((message) => (
                      <div
                        key={message.id}
                      id={`message-${message.id}`}
                      className={`group flex items-start gap-3 ${
                        message.sender.id === user?.uid ? 'flex-row-reverse' : ''
                      }`}
                      >
                        {/* Avatar */}
                      <div className="flex-shrink-0 pt-1">
                        {(userProfiles[message.sender.id]?.avatar || message.sender.avatar) ? (
                          <img
                            src={userProfiles[message.sender.id]?.avatar || message.sender.avatar}
                            alt={userProfiles[message.sender.id]?.name || message.sender.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                            onError={(e) => {
                              if (e.currentTarget instanceof HTMLImageElement) {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfiles[message.sender.id]?.name || message.sender.name)}&background=random`;
                              }
                            }}
                            />
                          ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-white flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-900">
                              {(userProfiles[message.sender.id]?.name || message.sender.name).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                      <div className={`group relative max-w-[75%]`}>
                        {message.sender.id !== user?.uid && (
                          <p className="text-xs font-medium text-gray-500 mb-1 ml-1">
                            {userProfiles[message.sender.id]?.name || message.sender.name}
                          </p>
                        )}
                        <div
                          className={`relative rounded-2xl px-4 py-3 ${
                            message.sender.id === user?.uid
                              ? 'bg-gray-100 text-gray-900 border border-gray-200'
                              : 'bg-white text-gray-900 border border-gray-100'
                          }`}
                        >
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className={`mb-2 p-2 rounded-xl text-sm ${
                              message.sender.id === user?.uid
                                ? 'bg-white/80 border border-gray-200'
                                : 'bg-gray-50 border border-gray-100'
                            }`}>
                              <p className="font-medium text-xs mb-0.5">{message.replyTo.sender.name}</p>
                              <p className="text-gray-600 line-clamp-2">{message.replyTo.content}</p>
                            </div>
                          )}

                          {/* Message Text */}
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.attachments.map((attachment, index) => (
                                <a
                                  key={index}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={attachment.url}
                                    alt={`Attachment ${index + 1}`}
                                    className="max-w-[200px] max-h-[200px] rounded-lg"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="absolute -bottom-2 left-4 flex -space-x-1">
                              {Object.entries(
                                message.reactions.reduce((acc: Record<string, string[]>, reaction) => {
                                  if (!acc[reaction.emoji]) {
                                    acc[reaction.emoji] = [];
                                  }
                                  acc[reaction.emoji].push(reaction.userId);
                                  return acc;
                                }, {})
                              ).map(([emoji, users]) => (
                                <div
                                  key={emoji}
                                  className="px-2 py-1 bg-white rounded-full shadow-sm border text-xs flex items-center gap-1"
                                  >
                                    <span>{emoji}</span>
                                  <span className="text-gray-500">{users.length}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                          message.sender.id === user?.uid ? '-left-24' : '-right-24'
                        }`}>
                          <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border p-1.5">
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-1.5 rounded-lg hover:bg-gray-50"
                              title="Reply"
                            >
                              <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400" />
                            </button>
                            {message.sender.id === user?.uid && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-red-500"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                            <div className="flex items-center gap-0.5">
                              {['👍', '❤️', '😊', '🎉', '👏', '��'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                  className="p-1.5 rounded-lg hover:bg-gray-50"
                                  title={`React with ${emoji}`}
                                >
                                  <span className="text-sm">{emoji}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
            <div className="sticky bottom-0 z-20 w-full px-4 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Replying to {replyingTo.sender.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                {/* Image Previews */}
                {attachments.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-20 h-20 object-cover"
                        />
                        <button
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative flex items-center">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        const lines = e.target.value.split('\n');
                        const hasMultipleLines = lines.some(line => 
                          e.target.scrollWidth > e.target.clientWidth || lines.length > 1
                        );
                        
                        if (hasMultipleLines) {
                          const maxHeight = 116;
                          e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full h-[46px] max-h-[116px] px-4 pr-12 rounded-xl border focus:outline-none focus:border-gray-300 resize-none bg-gray-50 text-sm py-3"
                      rows={1}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-[40px] h-[40px] p-0 flex items-center justify-center hover:bg-gray-100 rounded-full"
                      >
                        <FaceSmileIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 z-50">
                          <div className="bg-white rounded-lg shadow-lg">
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                      accept="image/*"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="min-w-[46px] min-h-[46px] p-0 flex items-center justify-center rounded-full"
                    >
                      <PaperClipIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSendMessage}
                      disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                      className="min-w-[46px] min-h-[46px] p-0 flex items-center justify-center rounded-full"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </>
          ) : (
          <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
              <div className="text-5xl mb-6">💬</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Select a chat to start messaging
                </h3>
              <p className="text-base text-gray-500">
                  Choose a project or direct message from the sidebar
                </p>
              </div>
            </div>
          )}
        </Card>
    </div>
  );
}