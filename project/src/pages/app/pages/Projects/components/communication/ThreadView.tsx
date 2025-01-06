import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { db } from '@/config/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { FiMessageCircle, FiStar, FiAlertCircle, FiCheckCircle, FiClock, FiSearch, FiX, FiTrash2, FiPaperclip, FiBarChart2, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { Menu, Transition } from '@headlessui/react';
import { addFileFromDiscussion } from '@/services/fileService';
import { FILE_LIMITS, validateFileUpload, formatFileSize } from '@/types/file';

interface Thread {
  id: string;
  content: string;
  lastMessageAt: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
    profileImage?: string;
    photoURL?: string;
  };
  type: 'update' | 'question' | 'decision' | 'idea';
  status: 'open' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  messageCount: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  poll?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: string[];
    }[];
    endDate?: string;
  };
}

interface Message {
  id: string;
  content: string;
  threadId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    profileImage?: string;
    photoURL?: string;
  };
  projectId: string;
  createdAt: string;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      name: string;
    };
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  poll?: {
    options: {
      id: string;
      text: string;
      votes: string[];
    }[];
    endDate?: string;
  };
}

const MESSAGE_TYPE_CONFIG = {
  update: { 
    icon: FiMessageCircle, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50', 
    label: 'Update'
  },
  question: { 
    icon: FiAlertCircle, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-50', 
    label: 'Question'
  },
  decision: { 
    icon: FiCheckCircle, 
    color: 'text-green-500', 
    bgColor: 'bg-green-50', 
    label: 'Decision'
  },
  idea: { 
    icon: FiStar, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-50', 
    label: 'Idea'
  }
};

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', color: 'text-red-500', bgColor: 'bg-red-50' },
  medium: { label: 'Medium Priority', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  low: { label: 'Low Priority', color: 'text-gray-500', bgColor: 'bg-gray-50' }
};

export function ThreadView({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThread, setNewThread] = useState<{
    content: string;
    type: Thread['type'];
    priority: Thread['priority'];
    createdBy?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>({
    content: '',
    type: 'update',
    priority: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollEndDate, setPollEndDate] = useState<string>('');
  const [showPollSection, setShowPollSection] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId || !user) return;

    const threadsQuery = query(
      collection(db, 'threads'),
      where('projectId', '==', projectId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(threadsQuery, (snapshot) => {
      const newThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Thread[];
      setThreads(newThreads);
      
      if (selectedThread) {
        const updatedThread = newThreads.find(t => t.id === selectedThread.id);
        if (updatedThread) {
          setSelectedThread(updatedThread);
        }
      }
    }, (error) => {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load threads');
    });

    return () => unsubscribe();
  }, [projectId, user]);

  useEffect(() => {
    if (!selectedThread?.id) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('threadId', '==', selectedThread.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    }, (error) => {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    });

    return () => unsubscribe();
  }, [selectedThread?.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredThreads(threads);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const filtered = threads.filter(thread => 
      thread.content.toLowerCase().includes(query) ||
      thread.type.toLowerCase().includes(query) ||
      thread.priority.toLowerCase().includes(query)
    );
    setFilteredThreads(filtered);
  }, [searchQuery, threads]);

  useEffect(() => {
    if (!user) return;

    setNewThread(prev => ({
      ...prev,
      createdBy: {
        id: user.uid,
        name: user.displayName || 'Anonymous',
        avatar: user.photoURL || undefined
      }
    }));
  }, [user]);

  const handleDeleteThread = async (threadId: string) => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      const threadRef = doc(db, 'threads', threadId);
      await deleteDoc(threadRef);
      setSelectedThread(null);
      toast.success('Discussion deleted successfully');
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error('Failed to delete discussion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCreateThread = async () => {
    if (!user || !newThread.content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Upload attachments first
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          console.log('Uploading file:', file.name);
          const storageRef = ref(storage, `attachments/${projectId}/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          
          console.log('File uploaded, adding to file system:', {
            name: file.name,
            url,
            type: file.type,
            size: file.size
          });
          
          // Add to file system
          const fileItem = await addFileFromDiscussion(
            {
              name: file.name,
              url,
              type: file.type,
              size: file.size
            },
            projectId,
            user.uid,
            user.displayName || 'Anonymous',
            user.photoURL || undefined
          );
          
          console.log('File added to system:', fileItem);

          return {
            name: file.name,
            url,
            type: file.type
          };
        })
      );

      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      const threadData = {
        content: newThread.content.trim(),
        type: newThread.type,
        priority: newThread.priority,
        status: 'open',
        createdBy: {
          id: user.uid,
          name: userData?.fullName || user.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.profileImage || user.photoURL
        },
        projectId,
        createdAt: Timestamp.now().toDate().toISOString(),
        lastMessageAt: Timestamp.now().toDate().toISOString(),
        messageCount: 0,
        attachments: uploadedAttachments,
        ...(showPollSection && pollOptions.filter(Boolean).length >= 2 && {
          poll: {
            question: pollQuestion,
            options: pollOptions
              .filter(Boolean)
              .map(text => ({
                id: crypto.randomUUID(),
                text,
                votes: []
              })),
            endDate: pollEndDate || undefined
          }
        })
      };

      const threadRef = await addDoc(collection(db, 'threads'), threadData);
      const newThreadData = { id: threadRef.id, ...threadData } as Thread;

      setShowNewThreadModal(false);
      setNewThread({
        content: '',
        type: 'update',
        priority: 'medium'
      });
      setShowPollSection(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollEndDate('');
      setAttachments([]);
      setSelectedThread(newThreadData);
      toast.success('Discussion created successfully');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create discussion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedThread?.id || !newMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);

      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      const messageData: any = {
        content: newMessage.trim(),
        threadId: selectedThread.id,
        sender: {
          id: user.uid,
          name: userData?.fullName || user.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.profileImage || user.photoURL
        },
        projectId,
        createdAt: Timestamp.now().toDate().toISOString(),
        reactions: []
      };

      if (replyTo) {
        messageData.replyTo = {
          id: replyTo.id,
          content: replyTo.content,
          sender: {
            name: replyTo.sender.name
          }
        };
      }

      if (selectedThread.type === 'decision' && pollOptions.filter(Boolean).length >= 2) {
        messageData.poll = {
          options: pollOptions
            .filter(Boolean)
            .map(text => ({
              id: crypto.randomUUID(),
              text,
              votes: []
            })),
          endDate: pollEndDate || undefined
        };
      }

      await addDoc(collection(db, 'messages'), messageData);
      
      const threadRef = doc(db, 'threads', selectedThread.id);
      await updateDoc(threadRef, {
        lastMessageAt: Timestamp.now().toDate().toISOString(),
        messageCount: (messages.length || 0) + 1
      });

      setNewMessage('');
      setReplyTo(null);
      setPollOptions(['', '']);
      setPollEndDate('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleResolveThread = async (threadId: string) => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      const threadRef = doc(db, 'threads', threadId);
      await updateDoc(threadRef, {
        status: 'resolved'
      });
      toast.success('Thread marked as resolved');
    } catch (error) {
      console.error('Error resolving thread:', error);
      toast.error('Failed to resolve thread');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (messageId: string, optionId: string) => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      const messageData = messageDoc.data();

      if (!messageData?.poll) return;

      const updatedOptions = messageData.poll.options.map((option: { id: string; votes: string[] }) => ({
        ...option,
        votes: option.id === optionId 
          ? [...option.votes, user.uid]
          : option.votes.filter((uid: string) => uid !== user.uid)
      }));

      await updateDoc(messageRef, {
        'poll.options': updatedOptions
      });

      toast.success('Vote recorded successfully');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengambil data profil pengguna
  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.warn('User ID is missing');
      return;
    }

    console.log('Fetching user profile for:', userId);
    
    try {
      // Coba ambil dari Firebase Auth terlebih dahulu
      const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('User doc exists:', userDoc.exists(), 'Data:', userDoc.data());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfiles(prev => ({
          ...prev,
          [userId]: {
            ...userData,
            id: userId,
            name: userData.fullName || userData.displayName || 'Anonymous',
            avatar: userData.avatar || userData.profileImage || userData.photoURL
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Mengambil data profil untuk setiap pengguna yang terlibat
  useEffect(() => {
    if (!user) return;

    console.log('Threads changed:', threads);
    console.log('Current user profiles:', userProfiles);
    
    // Fetch user's own profile first
    if (!userProfiles[user.uid]) {
      console.log('Will fetch profile for current user:', user.uid);
      fetchUserProfile(user.uid);
    }
    
    threads.forEach(thread => {
      console.log('Processing thread:', thread.id, 'Created by:', thread.createdBy);
      
      if (thread.createdBy?.id && !userProfiles[thread.createdBy.id]) {
        console.log('Will fetch profile for:', thread.createdBy.id);
        fetchUserProfile(thread.createdBy.id);
      }
    });
  }, [threads, user]);

  // Mengambil data profil untuk pesan-pesan
  useEffect(() => {
    if (!user) return;

    console.log('Messages changed:', messages);
    
    messages.forEach(message => {
      if (message.sender?.id && !userProfiles[message.sender.id]) {
        console.log('Will fetch profile for message sender:', message.sender.id);
        fetchUserProfile(message.sender.id);
      }
    });
  }, [messages, user]);

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check file count
    if (fileArray.length > FILE_LIMITS.maxFileCount) {
      toast.error(`Maksimum ${FILE_LIMITS.maxFileCount} file dalam satu kali upload`);
      return;
    }

    // Validate each file
    const invalidFiles = fileArray.map(file => ({
      file,
      validation: validateFileUpload(file)
    })).filter(item => !item.validation.valid);

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(item => {
        toast.error(`${item.file.name}: ${item.validation.error}`);
      });
      return;
    }

    // Calculate total size of new files
    const totalNewSize = fileArray.reduce((acc, file) => acc + file.size, 0);
    
    // Get current storage usage
    try {
      setIsLoading(true);
      const currentUsage = await calculateTotalStorage(projectId);
      
      // Check if upload would exceed storage limit
      if (totalNewSize + currentUsage > FILE_LIMITS.totalStorage) {
        toast.error(`Upload akan melebihi batas penyimpanan. Tersisa ${formatFileSize(FILE_LIMITS.totalStorage - currentUsage)}`);
        return;
      }

      // Continue with upload...
      setAttachments([...attachments, ...fileArray]);
      toast.success('Files selected successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white sticky top-0">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <Button 
          variant="primary"
          onClick={() => setShowNewThreadModal(true)}
          className="ml-4 flex items-center gap-2 px-6 py-2.5 relative z-10"
        >
          <FiMessageCircle className="w-5 h-5" />
          New Discussion
          </Button>
        </div>
        
      {threads.length === 0 && !isSearching ? (
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-6">
              💬
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No discussions yet</h3>
            <p className="text-base text-gray-500 mb-8">
              Start a new discussion to collaborate with your team and keep track of project conversations
            </p>
            <Button
              variant="primary"
              onClick={() => setShowNewThreadModal(true)}
              className="px-6 py-2.5"
            >
              <FiMessageCircle className="w-5 h-5 mr-2" />
              Start New Discussion
            </Button>
          </div>
                </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Thread List */}
          <div className="w-full max-w-3xl border-r border-gray-200 overflow-y-auto bg-gray-50">
            {isSearching && filteredThreads.length === 0 ? (
              <div className="flex items-center justify-center min-h-[200px] p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    🔍
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-base text-gray-500">
                    Try adjusting your search terms
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {(filteredThreads.length > 0 ? filteredThreads : threads).map((thread) => {
                  const TypeIcon = MESSAGE_TYPE_CONFIG[thread.type].icon;
                  return (
                    <Card
                      key={thread.id}
                      className={`border border-gray-100 ${
                        selectedThread?.id === thread.id ? 'bg-primary-50/30' : 'bg-white'
                      }`}
                      onClick={() => handleSelectThread(thread)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {thread.createdBy.avatar || (userProfiles[thread.createdBy.id]?.avatar) ? (
                              <img 
                                src={thread.createdBy.avatar || userProfiles[thread.createdBy.id]?.avatar || userProfiles[thread.createdBy.id]?.profileImage || userProfiles[thread.createdBy.id]?.photoURL}
                                alt={thread.createdBy.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    target.remove();
                                    parent.classList.add('bg-primary-100', 'flex', 'items-center', 'justify-center');
                                    const span = document.createElement('span');
                                    span.className = 'text-lg font-medium text-primary-700';
                                    span.textContent = thread.createdBy.name.charAt(0).toUpperCase();
                                    parent.appendChild(span);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-lg font-medium text-primary-700">
                                  {thread.createdBy.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900">{thread.createdBy.name}</span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(thread.createdAt), 'MMM d')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${MESSAGE_TYPE_CONFIG[thread.type].bgColor} ${MESSAGE_TYPE_CONFIG[thread.type].color}`}>
                                  <TypeIcon className="w-3 h-3 mr-0.5" />
                                  {MESSAGE_TYPE_CONFIG[thread.type].label}
                                </div>
                                <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_CONFIG[thread.priority].bgColor} ${PRIORITY_CONFIG[thread.priority].color}`}>
                                  {PRIORITY_CONFIG[thread.priority].label}
                                </div>
                                <Menu as="div" className="relative">
                                  <Menu.Button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                    <FiMoreVertical className="w-3.5 h-3.5 text-gray-500" />
                                  </Menu.Button>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                  >
                                    <Menu.Items className="absolute right-0 mt-1 w-48 origin-top-right bg-white rounded-lg shadow-lg border border-gray-100 focus:outline-none z-10">
                                      <div className="py-1">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectThread(thread);
                                              }}
                                              className={`${
                                                active ? 'bg-gray-50' : ''
                                              } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                            >
                                              <FiMessageSquare className="w-4 h-4 mr-3" />
                                              Reply
                                            </button>
                                          )}
                                        </Menu.Item>
                                        {thread.status === 'open' && (
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleResolveThread(thread.id);
                                                }}
                                                className={`${
                                                  active ? 'bg-gray-50' : ''
                                                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                              >
                                                <FiCheckCircle className="w-4 h-4 mr-3" />
                                                Mark as Resolved
                                              </button>
                                            )}
                                          </Menu.Item>
                                        )}
                                        {user?.uid === thread.createdBy.id && (
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteThread(thread.id);
                                                }}
                                                className={`${
                                                  active ? 'bg-gray-50' : ''
                                                } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                                              >
                                                <FiTrash2 className="w-4 h-4 mr-3" />
                                                Delete
                                              </button>
                                            )}
                                          </Menu.Item>
                                        )}
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-900">
                              {thread.content}
                            </div>
                            {thread.poll && thread.poll.options && (
                              <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-900">{thread.poll?.question}</div>
                                {thread.poll?.options.map((option) => {
                                  const totalVotes = thread.poll?.options.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;
                                  const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                                  const hasVoted = option.votes.includes(user?.uid || '');
                                  
                                  return (
                                    <button
                                      key={option.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVote(thread.id, option.id);
                                      }}
                                      disabled={thread.poll?.endDate ? new Date(thread.poll.endDate) < new Date() : false}
                                      className={`w-full p-2 rounded-lg border text-left group transition-all ${
                                        hasVoted ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{option.text}</span>
                                        <span className="text-sm text-gray-500">{option.votes.length} votes</span>
                                      </div>
                                      <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary-500 transition-all"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </button>
                                  );
                                })}
                                {thread.poll.endDate && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    Poll ends at {format(new Date(thread.poll.endDate), 'MMM d, h:mm a')}
                                  </div>
                                )}
                              </div>
                            )}
                            {thread.attachments && thread.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {thread.attachments.map((file, index) => (
                                  <a
                                    key={index}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FiPaperclip className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                                  </a>
          ))}
        </div>
                            )}
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                              <button 
                                className="flex items-center gap-1.5 text-gray-600 hover:text-primary-500 transition-colors text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedThread(thread);
                                  setReplyTo({
                                    id: thread.id,
                                    content: thread.content,
                                    threadId: thread.id,
                                    projectId: projectId,
                                    createdAt: thread.createdAt,
                                    sender: {
                                      id: thread.createdBy.id,
                                      name: thread.createdBy.name,
                                      avatar: thread.createdBy.avatar
                                    }
                                  });
                                }}
                              >
                                <FiMessageCircle className="w-3.5 h-3.5" />
                                <span className="font-medium">{thread.messageCount} Replies</span>
                              </button>
                              {thread.attachments && thread.attachments.length > 0 && (
                                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                  <FiPaperclip className="w-3.5 h-3.5" />
                                  <span className="font-medium">{thread.attachments.length} Files</span>
                                </div>
                              )}
                              {thread.poll && (
                                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                  <FiBarChart2 className="w-3.5 h-3.5" />
                                  <span className="font-medium">Poll</span>
                                </div>
                              )}
                              {thread.status === 'resolved' && (
                                <div className="flex items-center gap-1.5 text-green-600 text-xs">
                                  <FiCheckCircle className="w-3.5 h-3.5" />
                                  <span className="font-medium">Resolved</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
      </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {selectedThread ? (
              <>
                <div className="px-4 py-4 border-b border-gray-200 bg-white shadow-sm">
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {selectedThread.createdBy.avatar || (userProfiles[selectedThread.createdBy.id]?.avatar) ? (
                          <img 
                            src={selectedThread.createdBy.avatar || userProfiles[selectedThread.createdBy.id]?.avatar || userProfiles[selectedThread.createdBy.id]?.profileImage || userProfiles[selectedThread.createdBy.id]?.photoURL}
                            alt={selectedThread.createdBy.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const parent = target.parentElement;
                              if (parent) {
                                target.remove();
                                parent.classList.add('bg-primary-100', 'flex', 'items-center', 'justify-center');
                                const span = document.createElement('span');
                                span.className = 'text-lg font-medium text-primary-700';
                                span.textContent = selectedThread.createdBy.name.charAt(0).toUpperCase();
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary-700">
                              {selectedThread.createdBy.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{selectedThread.createdBy.name}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(selectedThread.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="mt-2 text-gray-900 text-sm whitespace-pre-wrap">
                          {selectedThread.content}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${MESSAGE_TYPE_CONFIG[selectedThread.type].bgColor} ${MESSAGE_TYPE_CONFIG[selectedThread.type].color}`}>
                            {React.createElement(MESSAGE_TYPE_CONFIG[selectedThread.type].icon, {
                              className: "w-3.5 h-3.5 mr-1"
                            })}
                            {MESSAGE_TYPE_CONFIG[selectedThread.type].label}
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${PRIORITY_CONFIG[selectedThread.priority].bgColor} ${PRIORITY_CONFIG[selectedThread.priority].color}`}>
                            {PRIORITY_CONFIG[selectedThread.priority].label}
                          </div>
                          {selectedThread.status === 'open' ? (
                            <Button
                              variant="outline"
                              onClick={() => handleResolveThread(selectedThread.id)}
                              disabled={isLoading}
                              className="ml-auto px-4 py-1.5 text-sm"
                            >
                              <FiCheckCircle className="w-4 h-4 mr-1.5" />
                              Mark as Resolved
                            </Button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-auto">
                              <FiCheckCircle className="w-3.5 h-3.5 mr-1" />
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex-1 overflow-y-auto px-4">
                  <div className="space-y-3 py-4">
                    {messages.map((message) => (
                      <Card key={message.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            {message.sender.avatar || (userProfiles[message.sender.id]?.avatar) ? (
                              <img 
                                src={message.sender.avatar || userProfiles[message.sender.id]?.avatar || userProfiles[message.sender.id]?.profileImage || userProfiles[message.sender.id]?.photoURL}
                                alt={message.sender.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    target.remove();
                                    parent.classList.add('bg-primary-100', 'flex', 'items-center', 'justify-center');
                                    const span = document.createElement('span');
                                    span.className = 'text-lg font-medium text-primary-700';
                                    span.textContent = message.sender.name.charAt(0).toUpperCase();
                                    parent.appendChild(span);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-lg font-medium text-primary-700">
                                  {message.sender.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{message.sender.name}</span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            
                            {message.replyTo && (
                              <div className="mt-1 pl-3 border-l-2 border-gray-200">
                                <div className="text-sm text-gray-500">
                                  Replying to {message.replyTo.sender.name}
                                </div>
                                <div className="text-sm text-gray-600 line-clamp-1">
                                  {message.replyTo.content}
                                </div>
                              </div>
                            )}

                            <div className="mt-2 text-gray-700 text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>

                            {message.poll?.options && (
                              <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg">
                                {message.poll.options.map((option) => {
                                  const poll = message.poll;
                                  if (!poll) return null;
                                  
                                  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                                  const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                                  const hasVoted = option.votes.includes(user?.uid || '');
                                  
                                  return (
                                    <button
                                      key={option.id}
                                      onClick={() => handleVote(message.id, option.id)}
                                      disabled={!!poll.endDate && new Date(poll.endDate) < new Date()}
                                      className={`w-full p-2 rounded-lg border text-left group transition-all ${
                                        hasVoted ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{option.text}</span>
                                        <span className="text-sm text-gray-500">{option.votes.length} votes</span>
                                      </div>
                                      <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary-500 transition-all"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </button>
                                  );
                                })}
                                {message.poll.endDate && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    Poll ends at {format(new Date(message.poll.endDate), 'MMM d, h:mm a')}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyTo({
                                    id: message.id,
                                    content: message.content,
                                    threadId: message.threadId,
                                    projectId: message.projectId,
                                    createdAt: message.createdAt,
                                    sender: {
                                      id: message.sender.id,
                                      name: message.sender.name,
                                      avatar: message.sender.avatar
                                    }
                                  });
                                }}
                                className="text-xs text-gray-500 hover:text-primary-500 transition-colors"
                              >
                                Reply
                              </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
                </div>

                <div className="px-4 py-4 border-t border-gray-200 bg-white shadow-sm">
                  <Card className="p-4">
                    {replyTo && (
                      <div className="mb-3 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary-500 rounded-full" />
                          <span className="text-sm text-gray-600">
                            Replying to <span className="font-medium">{replyTo.sender.name}</span>
                          </span>
                        </div>
                        <button 
                          onClick={() => setReplyTo(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {user?.photoURL ? (
                          <img 
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary-700">
                              {(user?.displayName || 'A').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-gray-50 text-sm"
                          placeholder="Type your reply... (Press Enter to send, Shift + Enter for new line)"
                  rows={3}
                />

                        {selectedThread?.type === 'decision' && (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Poll Options</span>
                              <button
                                onClick={() => setPollOptions([...pollOptions, ''])}
                                className="text-xs text-primary-500 hover:text-primary-600"
                              >
                                + Add Option
                              </button>
                            </div>
                            {pollOptions.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...pollOptions];
                                    newOptions[index] = e.target.value;
                                    setPollOptions(newOptions);
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                                {index > 1 && (
                                  <button
                                    onClick={() => {
                                      const newOptions = pollOptions.filter((_, i) => i !== index);
                                      setPollOptions(newOptions);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <input
                              type="datetime-local"
                              value={pollEndDate}
                              onChange={(e) => setPollEndDate(e.target.value)}
                              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-500">
                            Press Enter to send, Shift + Enter for new line
                          </div>
                          <Button
                            variant="primary"
                            onClick={handleSendMessage}
                            disabled={isLoading || !newMessage.trim()}
                            className="px-4 py-1.5 text-sm"
                          >
                            {selectedThread?.type === 'decision' && pollOptions.filter(Boolean).length >= 2
                              ? 'Create Poll'
                              : 'Reply'}
                  </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    📝
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a discussion</h3>
                  <p className="text-base text-gray-500">
                    Choose a discussion from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

      {/* New Thread Modal - Using Portal */}
      {showNewThreadModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl bg-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">New Discussion</h2>
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User info and input */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {user && (userProfiles[user.uid]?.avatar || user.photoURL) ? (
                    <img 
                      src={user && (userProfiles[user.uid]?.avatar || userProfiles[user.uid]?.profileImage || user.photoURL)}
                      alt={user?.displayName || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const parent = target.parentElement;
                        if (parent) {
                          target.remove();
                          parent.classList.add('bg-primary-100', 'flex', 'items-center', 'justify-center');
                          const span = document.createElement('span');
                          span.className = 'text-lg font-medium text-primary-700';
                          span.textContent = user && (userProfiles[user.uid]?.fullName || user.displayName || 'A').charAt(0).toUpperCase();
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary-700">
                        {user && (userProfiles[user.uid]?.fullName || user.displayName || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    placeholder="What's on your mind?"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-gray-50"
                    rows={4}
                  />
                </div>
              </div>

              {/* Type selection */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-700">Type</span>
                  <div className="flex gap-1.5">
                    {Object.entries(MESSAGE_TYPE_CONFIG).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewThread({ ...newThread, type: type as Thread['type'] })}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${
                            newThread.type === type
                              ? `${config.bgColor} ${config.color}`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Priority selection */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                  <div className="flex gap-1.5">
                    {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setNewThread({ ...newThread, priority: priority as Thread['priority'] })}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs transition-colors ${
                          newThread.priority === priority
                            ? `${config.bgColor} ${config.color}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPollSection(!showPollSection)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${
                    showPollSection ? 'bg-primary-50 text-primary-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiBarChart2 className="w-3.5 h-3.5" />
                  Add Poll
                </button>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
                  <FiPaperclip className="w-3.5 h-3.5" />
                  Add Attachment
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    accept={FILE_LIMITS.allowedTypes}
                  />
                </label>
              </div>

              {/* Poll section */}
              {showPollSection && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poll Question</label>
                    <input
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="Ask a question..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                    <div className="space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...pollOptions];
                              newOptions[index] = e.target.value;
                              setPollOptions(newOptions);
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                          />
                          {index > 1 && (
                            <button
                              onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={pollEndDate}
                      onChange={(e) => setPollEndDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Attachments</div>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FiPaperclip className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-700 truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setShowNewThreadModal(false)}
                  className="px-4 py-2 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateThread}
                  disabled={isLoading || !newThread.content.trim()}
                  className="px-4 py-2 text-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </div>
  );
} 