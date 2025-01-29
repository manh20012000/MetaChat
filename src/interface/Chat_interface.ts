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
    reactions: [
      {
        user: {
          _id: string;
          name: string;
          avatar: string;
        };
        type: string;
      },
    ];
    isRead: [{_id: string; avatar: string; name: string}];
    replyMessage: {
      _id: string;
      content: string; // Nội dung của tin nhắn reply
    };
  
}