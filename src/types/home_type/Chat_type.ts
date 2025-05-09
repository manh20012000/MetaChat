export type reactions ={
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
export type Message_type = {
  _id: string;
  conversation_id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    user_id: string;
  };
  messageType: string;

  text: string|null;
  attachments: [
    {
      type: string;
      url: string;
    },
  ]|[];
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
    },
    reaction:number,
  }[];
  receiver: string[];
  recall: boolean;
  
  replyTo: {
    _id: string;
    text: string; // Nội dung của tin nhắn reply
    messageType: string;
    user:{_id: string,
      name: string,
      avatar: string,
      user_id: string,}
  };
  other: string;
  status: string;
  statusSendding:boolean,
  lastSync:string

};

