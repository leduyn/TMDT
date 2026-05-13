import { fetchJSON } from "@/lib/fetcher";

export interface ChatMessageDTO {
  id: number;
  content: string;
  senderId: number;
  senderUsername: string;
  senderType: string;
  timestamp: string;
}

export interface ChatRoomDTO {
  id: number;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export const chatApi = {
  getRooms: () => fetchJSON<ChatRoomDTO[]>('/api/chat/rooms'),
  getMessages: (roomId: number) => fetchJSON<ChatMessageDTO[]>(`/api/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: number, content: string) => fetchJSON<ChatMessageDTO>(`/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
};
