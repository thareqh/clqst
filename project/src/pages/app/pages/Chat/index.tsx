import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs, doc, getDoc, DocumentData, updateDoc, limit, arrayUnion } from 'firebase/firestore';
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
  HandThumbUpIcon
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
      // Query untuk projects dimana user adalah member
      const memberProjectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', user.uid)
      );

      // Query untuk projects dimana user adalah owner
      const ownerProjectsQuery = query(
        collection(db, 'projects'),
        where('owner.id', '==', user.uid)
      );

      try {
        logger.debug('Fetching projects');
        
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

        const allProjects = [...memberProjects, ...ownerProjects];
        const uniqueProjects = allProjects.filter((project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
        );

        logger.info('Projects loaded', { count: uniqueProjects.length });
        setProjects(uniqueProjects);
      } catch (error) {
        logger.error('Error fetching projects:', error);
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

  // Add message status update
  useEffect(() => {
    if (!user || !activeProject) return;

    // Mark messages as read
    const unreadMessages = messages.filter(
      msg => msg.sender.id !== user.uid && (!msg.readBy || !msg.readBy.includes(user.uid))
    );

    unreadMessages.forEach(async (message) => {
      const messageRef = doc(db, 'messages', message.id);
      await updateDoc(messageRef, {
        status: 'read',
        readBy: arrayUnion(user.uid)
      });
    });
  }, [messages, user, activeProject]);

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
    // Navigate to specific chat URL
    navigate(`/app/chat/${dm.id}`);
    
    setActiveDM(dm.id);
    setActiveProject(null);
    setChatType('dm');
    setReplyingTo(null);

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
    navigate('/app/chat'); // Reset URL to base chat URL
    setActiveProject(projectId);
    setActiveDM(null);
    setChatType('project');
    setReplyingTo(null);
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

  return (
    <div className="h-screen flex gap-8 p-8 bg-gray-50">
        {/* Sidebar */}
      <Card className="w-96 flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Chats</h2>
          </div>
        <div className="flex-1 overflow-y-auto p-6">
          {/* Projects List */}
          <div className="space-y-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className={`w-full p-4 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  activeProject === project.id ? 'bg-primary-50 border border-primary-200' : ''
                }`}
              >
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                )}
                <div className="flex-1 text-left">
                  <h3 className="font-medium truncate">{project.title}</h3>
                  <p className="text-sm text-gray-500">
                    {project.members.length} members
                  </p>
                </div>
              </button>
            ))}
          </div>

              {/* Direct Messages */}
          <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Direct Messages</h3>
                <div className="space-y-2">
                  {directMessages.map((dm) => (
                    <button
                      key={dm.id}
                      onClick={() => handleDMClick(dm)}
                      className={`w-full p-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        activeDM === dm.id ? 'bg-primary-50 border border-primary-200' : ''
                      }`}
                    >
                      {(userProfiles[dm.userId]?.avatar || dm.avatar) ? (
                        <img
                          src={userProfiles[dm.userId]?.avatar || dm.avatar}
                          alt={userProfiles[dm.userId]?.name || dm.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            if (e.currentTarget instanceof HTMLImageElement) {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfiles[dm.userId]?.name || dm.name)}&background=random&size=32`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600">
                            {(userProfiles[dm.userId]?.name || dm.name).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <h4 className="font-medium">{userProfiles[dm.userId]?.name || dm.name}</h4>
                        {dm.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {dm.lastMessage}
                          </p>
                        )}
                      </div>
                      {dm.unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-600 rounded-full">
                          {dm.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Chat Area */}
      <Card className="flex-1 flex flex-col h-screen">
          {(activeProject || activeDM || chatId) ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  {chatType === 'project' && activeProject && (
                    <div className="flex items-center gap-3">
                      {projects.find(p => p.id === activeProject)?.coverImage ? (
                        <img
                          src={projects.find(p => p.id === activeProject)?.coverImage}
                          alt={projects.find(p => p.id === activeProject)?.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-lg">🎯</span>
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold">
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
                            className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            if (e.currentTarget instanceof HTMLImageElement && targetUser) {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfiles[targetUser.id]?.name || targetUser.name)}&background=random&size=40`;
                            }
                          }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary-600">
                              {(userProfiles[targetUser.id]?.name || targetUser.name).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      <h2 className="font-semibold">
                        {userProfiles[targetUser.id]?.name || targetUser.name || directMessages.find(d => d.userId === activeDM)?.name || 'Loading...'}
                      </h2>
                        </div>
                    )}
                  </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md ml-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in conversation..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results */}
                  {searchQuery && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            const element = document.getElementById(`message-${result.id}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element?.classList.add('highlight-message');
                            setTimeout(() => element?.classList.remove('highlight-message'), 2000);
                            setSearchQuery('');
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{result.sender.name}</p>
                          <p className="text-sm text-gray-500 truncate">{result.content}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 space-y-6">
                {groupedMessages.map((group) => (
                  <div key={group.date} className="space-y-6">
                    <div className="text-center sticky top-2 z-10">
                      <span className="px-4 py-1.5 text-xs font-medium bg-white/80 text-gray-600 rounded-full shadow-sm border backdrop-blur-sm">
                        {format(new Date(group.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    {group.messages.map((message) => (
                      <div
                        key={message.id}
                      id={`message-${message.id}`}
                      className={`flex items-start gap-4 ${
                        message.sender.id === user?.uid ? 'flex-row-reverse' : ''
                      }`}
                      >
                        {/* Avatar */}
                      <div className="flex-shrink-0 pt-1">
                        {(userProfiles[message.sender.id]?.avatar || message.sender.avatar) ? (
                          <img
                            src={userProfiles[message.sender.id]?.avatar || message.sender.avatar}
                            alt={userProfiles[message.sender.id]?.name || message.sender.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                              if (e.currentTarget instanceof HTMLImageElement) {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfiles[message.sender.id]?.name || message.sender.name)}&background=random&size=32`;
                              }
                            }}
                            />
                          ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center border-2 border-white shadow-sm">
                              <span className="text-sm font-semibold text-primary-600">
                              {(userProfiles[message.sender.id]?.name || message.sender.name).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                      <div className={`group relative max-w-[65%]`}>
                        {message.sender.id !== user?.uid && (
                          <p className="text-xs font-medium text-gray-500 mb-1.5 ml-1">
                            {userProfiles[message.sender.id]?.name || message.sender.name}
                          </p>
                        )}
                        <div
                          className={`relative rounded-2xl px-5 py-3 ${
                            message.sender.id === user?.uid
                              ? 'bg-primary-100 text-primary-900 border border-primary-200'
                              : 'bg-white text-gray-900 border border-gray-100'
                          }`}
                        >
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className={`mb-3 p-3 rounded-xl text-sm ${
                              message.sender.id === user?.uid
                                ? 'bg-primary-50/70 border border-primary-200'
                                : 'bg-gray-50/70 border border-gray-200'
                            }`}>
                              <p className="font-medium text-xs mb-0.5">{message.replyTo.sender.name}</p>
                              <p className="text-gray-600 line-clamp-2">{message.replyTo.content}</p>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                          
                          {/* Image Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {message.attachments.map((file, index) => (
                                file.type.startsWith('image/') ? (
                                  <div key={index} className="rounded-xl overflow-hidden border">
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="w-full h-auto max-h-[300px] object-cover"
                                    />
                                  </div>
                                ) : null
                              ))}
                            </div>
                          )}

                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="absolute -bottom-3 right-2 flex -space-x-1 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
                              {Array.from(new Set(message.reactions?.map((r: { emoji: string }) => r.emoji) || [])).map((emoji, index) => {
                                const count = message.reactions?.filter((r: { emoji: string }) => r.emoji === emoji).length || 0;
                                const hasReacted = message.reactions?.some(
                                  (r: { emoji: string; userId: string }) => 
                                    r.emoji === emoji && r.userId === user?.uid
                                ) || false;
                                
                                return (
                                  <button
                                    key={index}
                                    onClick={() => handleAddReaction(message.id, emoji)}
                                    className={`text-sm hover:scale-110 transition-transform cursor-pointer px-1 rounded ${
                                      hasReacted ? 'bg-primary-50' : ''
                                    }`}
                                    title={`${count} ${count === 1 ? 'reaction' : 'reactions'}`}
                                  >
                                    <span>{emoji}</span>
                                    {count > 1 && (
                                      <span className="ml-1 text-xs text-gray-500">{count}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Message Status & Time */}
                          <div className={`flex items-center gap-2 mt-2 ${
                            message.sender.id === user?.uid ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className={`text-xs ${
                              message.sender.id === user?.uid 
                                ? 'text-primary-600' 
                                : 'text-gray-400'
                            }`}>
                              {format(new Date(message.createdAt), 'HH:mm')}
                            </span>
                            
                            {message.sender.id === user?.uid && (
                              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                {message.status === 'read' ? (
                                  <>
                                    <CheckIcon className="w-3 h-3 text-primary-500" />
                                    <CheckIcon className="w-3 h-3 text-primary-500 -ml-1" />
                                  </>
                                ) : message.status === 'delivered' ? (
                                  <>
                                    <CheckIcon className="w-3 h-3 text-gray-400" />
                                    <CheckIcon className="w-3 h-3 text-gray-400 -ml-1" />
                                  </>
                                ) : (
                                  <CheckIcon className="w-3 h-3 text-gray-400" />
                                )}
                            </span>
                            )}
                          </div>
                        </div>

                        {/* Message Actions */}
                        <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                          message.sender.id === user?.uid ? '-left-28' : '-right-28'
                        }`}>
                          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border p-1.5">
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-1.5 rounded-lg hover:bg-gray-100"
                              title="Reply"
                            >
                              <ArrowUturnLeftIcon className="w-4 h-4 text-gray-500" />
                            </button>
                            <div className="flex items-center gap-1">
                              {['👍', '❤️', '😊', '🎉', '👏', '🚀'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100"
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
            <div className="px-6 py-4 border-t flex-shrink-0">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
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
              
              <div className="flex flex-col gap-4">
                {/* Image Previews */}
                {attachments.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto">
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
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-5 py-3 rounded-2xl border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-gray-50"
                    rows={1}
                  />
                  <div className="flex gap-2">
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
                      className="rounded-2xl min-w-[46px] h-[46px] p-0 flex items-center justify-center"
                    >
                      <PaperClipIcon className="w-5 h-5" />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="rounded-2xl min-w-[46px] h-[46px] p-0 flex items-center justify-center"
                      >
                        <FaceSmileIcon className="w-5 h-5" />
                      </Button>
                      {showEmojiPicker && (
                        <div 
                          ref={emojiPickerRef}
                          className="absolute bottom-full right-0 mb-2"
                          style={{ zIndex: 50 }}
                        >
                          <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                          />
                        </div>
                      )}
                    </div>
                  <Button
                    onClick={handleSendMessage}
                      disabled={!newMessage.trim() && attachments.length === 0}
                      className="rounded-2xl min-w-[46px] h-[46px] p-0 flex items-center justify-center"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Select a chat to start messaging
              </h3>
              <p className="text-gray-500 text-lg">
                Choose a project or direct message from the sidebar
              </p>
            </div>
            </div>
          )}
        </Card>
    </div>
  );
}