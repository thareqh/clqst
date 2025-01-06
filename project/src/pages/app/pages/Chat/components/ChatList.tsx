import { useState } from 'react';
import { Card } from '../../../../../components/ui/Card';
import type { Chat } from '../../../../../types/chat';

interface ChatListProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
  const [chats] = useState<Chat[]>([]);

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full px-4 py-2 rounded-lg border border-gray-200"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full p-4 text-left hover:bg-gray-50 ${
              selectedChat === chat.id ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {chat.participants[0].name}
                </div>
                {chat.lastMessage && (
                  <div className="text-sm text-gray-500 truncate">
                    {chat.lastMessage.content}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}