import apiClient from './client';
import type { ApiResponse, Chat, ChatDetail, ChatMessage, ChatMessageList } from './types';

export const chatApi = {
    getChats: async (): Promise<Chat[]> => {
        const response = await apiClient.get<ApiResponse<Chat[]>>('/chats');
        return response.data.data;
    },

    createChat: async (name: string | null, memberIds: number[]): Promise<ChatDetail> => {
        const response = await apiClient.post<ApiResponse<ChatDetail>>('/chats', {
            name: name || null,
            member_ids: memberIds
        });
        return response.data.data;
    },

    getChat: async (chatId: number): Promise<ChatDetail> => {
        const response = await apiClient.get<ApiResponse<ChatDetail>>(`/chats/${chatId}`);
        return response.data.data;
    },

    deleteChat: async (chatId: number): Promise<void> => {
        await apiClient.delete<ApiResponse<null>>(`/chats/${chatId}`);
    },

    addChatMembers: async (chatId: number, userIds: number[]): Promise<ChatDetail> => {
        const response = await apiClient.post<ApiResponse<ChatDetail>>(`/chats/${chatId}/members`, {
            user_ids: userIds
        });
        return response.data.data;
    },

    removeChatMember: async (chatId: number, userId: number): Promise<void> => {
        await apiClient.delete<ApiResponse<null>>(`/chats/${chatId}/members/${userId}`);
    },

    getChatMessages: async (chatId: number, before?: number, limit?: number): Promise<ChatMessageList> => {
        const response = await apiClient.get<ApiResponse<ChatMessageList>>(`/chats/${chatId}/messages`, {
            params: { before, limit }
        });
        return response.data.data;
    },

    sendMessage: async (chatId: number, content: string): Promise<ChatMessage> => {
        const response = await apiClient.post<ApiResponse<ChatMessage>>(`/chats/${chatId}/messages`, {
            content
        });
        return response.data.data;
    },

    sendMediaMessage: async (chatId: number, files: File[] | File, content?: string): Promise<ChatMessage> => {
        const formData = new FormData();
        const fileList = Array.isArray(files) ? files : [files];
        fileList.forEach(f => {
            formData.append('files[]', f);
        });
        if (content) {
            formData.append('content', content);
        }
        const response = await apiClient.post<ApiResponse<ChatMessage>>(`/chats/${chatId}/messages/media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    },

    editMessage: async (chatId: number, messageId: number, content: string): Promise<ChatMessage> => {
        const response = await apiClient.patch<ApiResponse<ChatMessage>>(`/chats/${chatId}/messages/${messageId}`, {
            content
        });
        return response.data.data;
    },

    deleteMessage: async (chatId: number, messageId: number): Promise<void> => {
        await apiClient.delete<ApiResponse<null>>(`/chats/${chatId}/messages/${messageId}`);
    },

    markChatRead: async (chatId: number, lastReadMessageId: number): Promise<void> => {
        await apiClient.post<ApiResponse<null>>(`/chats/${chatId}/read`, {
            last_read_message_id: lastReadMessageId
        });
    }
};
