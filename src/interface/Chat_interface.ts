export interface Message_interface {
    _id: string;
    conversation_id: string;
    senderID: string;
    messageType: string;
    textContent: string;
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
    reactions: [
      {
        user: string;
        type: string;
      },
    ];
    isRead: [{_id: string; avatar: string; account: string}];
    replyMessage: {
      _id: string;
      content: string; // Nội dung của tin nhắn reply
    };
  
}