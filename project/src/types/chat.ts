export interface Message {
  id: string;
  senderId: string;
  content: string;
  participants: string[];
  createdAt: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface Chat {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: Message;
  updatedAt: string;
}