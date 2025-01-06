import { useState, useRef, useEffect } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { sendMessage } from '../../../../../services/chatService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../../config/firebase';
import { addFileFromChat } from '../../../../../services/fileService';
import { FiPaperclip } from 'react-icons/fi';
import { toast } from 'sonner';
import { FILE_LIMITS, validateFileUpload, formatFileSize } from '@/types/file';

interface ChatWindowProps {
  chatId: string | null;
  currentUserId: string;
  projectId: string;
  userName: string;
  userAvatar?: string;
}

export function ChatWindow({ chatId, currentUserId, projectId, userName, userAvatar }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatId]);

  if (!chatId) {
    return (
      <Card className="h-full flex items-center justify-center text-gray-500">
        Select a conversation to start messaging
      </Card>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    setAttachments([...attachments, ...files]);
  };

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || !chatId) return;

    setIsLoading(true);
    try {
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
          const fileItem = await addFileFromChat(
            {
              name: file.name,
              url,
              type: file.type,
              size: file.size
            },
            projectId,
            currentUserId,
            userName,
            userAvatar
          );
          
          console.log('File added to system:', fileItem);

          return {
            name: file.name,
            url,
            type: file.type
          };
        })
      );

      await sendMessage({
        content: message,
        senderId: currentUserId,
        participants: [currentUserId, chatId],
        attachments: uploadedAttachments
      });

      setMessage('');
      setAttachments([]);
      scrollToBottom();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

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

    // Continue with upload...
    try {
      setIsUploading(true);
      // ... rest of the upload code ...
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages will be rendered here */}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex flex-col gap-4">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              variant="ghost"
              className="relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiPaperclip className="w-5 h-5" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 hidden group-hover:block">
                <div className="text-center space-y-1">
                  <div>Max file size: {formatFileSize(FILE_LIMITS.maxFileSize)}</div>
                  <div>Max files: {FILE_LIMITS.maxFileCount} files</div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              accept={FILE_LIMITS.allowedTypes}
            />
            <Button
              onClick={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || isLoading}
              loading={isLoading}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}