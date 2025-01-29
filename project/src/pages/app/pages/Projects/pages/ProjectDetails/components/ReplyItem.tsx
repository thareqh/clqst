import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ReplyItemProps {
  reply: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name?: string;
      avatar?: string;
    };
    attachments?: {
      name: string;
      url: string;
      size?: number;
    }[];
  };
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

const truncateFileName = (fileName: string, maxLength: number = 25) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split('.').pop();
  const name = fileName.substring(0, fileName.lastIndexOf('.'));
  const truncatedName = name.substring(0, maxLength - 4) + '...';
  return `${truncatedName}.${extension}`;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

export default function ReplyItem({ reply, onDelete, isOwner }: ReplyItemProps) {
  return (
    <div className="flex items-start gap-3 bg-gray-50/50 rounded-lg p-4">
      <div className="flex-shrink-0">
        {reply.author?.avatar ? (
          <img 
            src={reply.author.avatar}
            alt={reply.author.name || 'User'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-white flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {reply.author?.name?.[0].toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {reply.author?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(reply.createdAt).toLocaleDateString()}
            </span>
          </div>
          {isOwner && (
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 rounded-full hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
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
                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onDelete?.(reply.id)}
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                        >
                          <svg className="mr-3 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Reply
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{reply.content}</p>
          
          {/* Attachments */}
          {reply.attachments && reply.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-medium text-gray-500">Attachments:</div>
              <div className="space-y-2">
                {reply.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white/50 rounded-lg p-2 group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="flex-1 truncate">
                      {truncateFileName(file.name)}
                    </span>
                    {file.size && (
                      <span className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 