export interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  senderId: {
    _id: string;
    name: string;
    avatar: string;
  };
  voice: string;
  conversationId: string; // ID cuộc hội thoại
  sent?: boolean;
  pending?: boolean;
  quickReplies?: QuickReplies;
}
interface Reply {
  title: string;
  value: string;
  messageId?: number | string;
}

interface QuickReplies {
  type: 'radio' | 'checkbox';
  values: Reply[];
  keepIt?: boolean;
}