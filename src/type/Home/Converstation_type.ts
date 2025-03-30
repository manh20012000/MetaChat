import {Message_type} from './Chat_type';

type Conversation = {
  _id: string; // ID của cuộc trò chuyện
  roomName: string | null; // Tên của nhóm hoặc tên động được tạo từ các thành viên
  avatar: string | null; // Ảnh đại diện nhóm hoặc danh sách ảnh đại diện
  type: string; // Loại cuộc trò chuyện (vd: "group" hoặc "direct")
  color: string; // Màu sắc của nhóm (nếu có)
  icon: string; //
  background: string; // Background của nhóm (nếu có)
  messages: Message_type[];
  participants: [
    {
      _id: string;
      action_notifi: boolean;
      avatar: string;
      name: string;
      role: string;
      status_read: boolean;
      user_id: string;
    },
  ];
  isDeleted: string;
  createdAt: Date;
  participantIds: string[];
  firstMessageTime?: string;
  permission: string;
  messageError: Message_type[];
  otherContent: string;
  isRead: [
    {
      user: { _id: string; name: string; avatar: string }, // Người đã đọc tin nhắn
      messageId: string, // ID tin nhắn đã đọc
      readAt: string, // Thời gian đọc tin nhắn
    }
  ];
  lastSync:string
};
export default Conversation;
