export interface Message_interface {
  _id: string;
  conversation_id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  messageType: string;
  voice: string;
  text: string;
  attachments: [
    {
      type: string;
      url: string;
    },
  ];
  callDetails: {
    duration: {
      type: number; // Thời lượng cuộc gọi (giây)
    };
    status: string;
  };
  createdAt: string;
  reactions: {
    user: {
      _id: string;
      name: string;
      avatar: string;
      user_id: string;
    };
    reaction: {
      id: {
        type: Number;
      };
      name: {
        type: String;
      };
      title: {
        type: String;
      };
    };
  }[];
  reciver: string[];
  recall: boolean;
  isRead: [
    {user: {_id: string; avatar: string; name: string}; status: boolean},
  ];
  replyTo: {
    _id: string;
    content: string; // Nội dung của tin nhắn reply
  };
  other: string;
  statusSendding: boolean;
}

export interface reactions {
    user: {
      _id: string;
      name: string;
      avatar: string;
      user_id: string;
    };
    reaction: {
      id: {
        type: Number;
      };
      name: {
        type: String;
      };
      title: {
        type: String;
      };
    };
  
  
}