export type IMessage ={
  _id: string | number;
  text: string;
  createdAt: string | null;
  user: {
    _id: string;
    name: string;
    avatar: string;
    user_id: string;
  };

  conversationId: string; // ID cuộc hội thoại
  sent?: boolean;
  pending?: boolean;
  quickReplies?: QuickReplies;
}
type Reply ={
  title: string;
  value: string;
  messageId?: number | string;
}

type QuickReplies = {
  type: 'radio' | 'checkbox';
  values: Reply[];
  keepIt?: boolean;
}

