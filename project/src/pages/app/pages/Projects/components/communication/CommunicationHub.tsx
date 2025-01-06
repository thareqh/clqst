import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { db } from '@/config/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { FiMessageCircle, FiStar, FiAlertCircle, FiCheckCircle, FiClock, FiTag, FiUsers, FiLink, FiCornerDownRight, FiMessageSquare, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: 'update' | 'question' | 'decision' | 'idea';
  status: 'open' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  messageCount: number;
}

interface Message {
  id: string;
  content: string;
  threadId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  projectId: string;
  createdAt: string;
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  isReply?: boolean;
}

const REACTION_EMOJIS = ['👍', '👎', '❤️', '🎉', '🤔', '👀', '🚀', '💯'];

const MESSAGE_TYPE_CONFIG = {
  update: { icon: FiMessageCircle, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'Update' },
  question: { icon: FiAlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-50', label: 'Question' },
  decision: { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-50', label: 'Decision' },
  idea: { icon: FiStar, color: 'text-purple-500', bgColor: 'bg-purple-50', label: 'Idea' }
};

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', color: 'text-red-500', bgColor: 'bg-red-50' },
  medium: { label: 'Medium Priority', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  low: { label: 'Low Priority', color: 'text-gray-500', bgColor: 'bg-gray-50' }
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onClick?: () => void;
}

export function CommunicationHub({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'updates' | 'discussions' | 'decisions'>('updates');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [selectedType, setSelectedType] = useState<Thread['type']>('update');
  const [selectedPriority, setSelectedPriority] = useState<Thread['priority']>('medium');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!projectId || !user) return;

    const threadsQuery = query(
      collection(db, 'threads'),
      where('projectId', '==', projectId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribeThreads = onSnapshot(threadsQuery, (snapshot) => {
      const newThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Thread[];
      setThreads(newThreads);
    }, (error) => {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load threads');
    });

    let unsubscribeMessages = () => {};
    if (activeThread) {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('threadId', '==', activeThread),
        orderBy('createdAt', 'asc')
      );

      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(newMessages);
      }, (error) => {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      });
    }

    return () => {
      unsubscribeThreads();
      unsubscribeMessages();
    };
  }, [projectId, user, activeThread]);

  const handleCreateThread = async () => {
    if (!user || !newThreadTitle.trim() || !newMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      const threadData = {
        title: newThreadTitle.trim(),
        type: selectedType,
        priority: selectedPriority,
        status: 'open',
        createdBy: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL
        },
        projectId,
        createdAt: Timestamp.now().toDate().toISOString(),
        lastMessageAt: Timestamp.now().toDate().toISOString(),
        messageCount: 1
      };

      const threadRef = await addDoc(collection(db, 'threads'), threadData);

      const messageData = {
        content: newMessage.trim(),
        threadId: threadRef.id,
        sender: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL
        },
        projectId,
        createdAt: Timestamp.now().toDate().toISOString(),
        reactions: []
      };

      await addDoc(collection(db, 'messages'), messageData);
      
      setNewThreadTitle('');
      setNewMessage('');
      setIsCreatingThread(false);
      setActiveThread(threadRef.id);
      toast.success('Thread created successfully');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create thread');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !activeThread || isLoading) return;

    try {
      setIsLoading(true);
      
      const messageData = {
        content: newMessage.trim(),
        threadId: activeThread,
        sender: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL
        },
        projectId,
        createdAt: Timestamp.now().toDate().toISOString(),
        reactions: []
      };

      await addDoc(collection(db, 'messages'), messageData);
      
      const threadRef = doc(db, 'threads', activeThread);
      await updateDoc(threadRef, {
        lastMessageAt: Timestamp.now().toDate().toISOString(),
        messageCount: (messages.length || 0) + 1
      });

      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);

      let updatedReactions;
      if (existingReaction) {
        if (existingReaction.users.includes(user.uid)) {
          updatedReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, users: r.users.filter(u => u !== user.uid) }
              : r
          ).filter(r => r.users.length > 0);
        } else {
          updatedReactions = reactions.map(r =>
            r.emoji === emoji
              ? { ...r, users: [...r.users, user.uid] }
              : r
          );
        }
      } else {
        updatedReactions = [...reactions, { emoji, users: [user.uid] }];
      }

      await updateDoc(doc(db, 'messages', messageId), {
        reactions: updatedReactions
      });
    } catch (error) {
      console.error('Error updating reactions:', error);
      toast.error('Failed to update reaction');
    }
  };

  return (
    <div className="flex h-full">
      {/* Thread List */}
      <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Threads</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingThread(true)}
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            New Thread
          </Button>
        </div>

        <div className="space-y-3">
          {threads.map(thread => {
            const TypeIcon = MESSAGE_TYPE_CONFIG[thread.type].icon;
            return (
              <Card
                key={thread.id}
                onClick={() => setActiveThread(thread.id)}
                className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                  activeThread === thread.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${MESSAGE_TYPE_CONFIG[thread.type].bgColor}`}>
                    <TypeIcon className={`w-4 h-4 ${MESSAGE_TYPE_CONFIG[thread.type].color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{thread.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{format(new Date(thread.lastMessageAt), 'MMM d, h:mm a')}</span>
                      <span>•</span>
                      <span>{thread.messageCount} messages</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${PRIORITY_CONFIG[thread.priority].bgColor} ${PRIORITY_CONFIG[thread.priority].color}`}>
                    {thread.priority}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col h-full">
        {activeThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200">
              {threads.find(t => t.id === activeThread)?.title}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender.id === user?.uid ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar 
                    src={message.sender.avatar} 
                    alt={message.sender.name}
                    fallback={message.sender.name[0]}
                  />
                  <div className={`flex flex-col ${
                    message.sender.id === user?.uid ? 'items-end' : 'items-start'
                  }`}>
                    <div className={`px-4 py-2 rounded-lg max-w-md ${
                      message.sender.id === user?.uid
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </span>
                      {message.reactions?.map(reaction => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            reaction.users.includes(user?.uid || '')
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {reaction.emoji} {reaction.users.length}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowEmojiPicker(message.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiStar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a thread to view messages
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      <AnimatePresence>
        {isCreatingThread && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create New Thread</h3>
                <button
                  onClick={() => setIsCreatingThread(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thread Title
                  </label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter thread title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(MESSAGE_TYPE_CONFIG).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type as Thread['type'])}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            selectedType === type
                              ? `${config.bgColor} ${config.color}`
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                      <button
                        key={priority}
                        onClick={() => setSelectedPriority(priority as Thread['priority'])}
                        className={`px-3 py-2 rounded-lg ${
                          selectedPriority === priority
                            ? `${config.bgColor} ${config.color}`
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your message..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingThread(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateThread}
                    disabled={!newThreadTitle.trim() || !newMessage.trim() || isLoading}
                  >
                    Create Thread
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 