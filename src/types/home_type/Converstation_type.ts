import {Message_type} from './Chat_type';

export type TUser=
  {
    _id: string;
    action_notifi: boolean;
    avatar: string;
    name: string;
    role: string;
    status_read: boolean;
    user_id: string;
  };

export type participants = {
  user: TUser;
  message_readed_id: string;
  readAt: string;
};
type Conversation = {
  _id: string; // ID của cuộc trò chuyện
  roomName: string | null; // Tên của nhóm hoặc tên động được tạo từ các thành viên
  avatar: string | null; // Ảnh đại diện nhóm hoặc danh sách ảnh đại diện
  type: string; // Loại cuộc trò chuyện (vd: "group" hoặc "direct")
  color: string; // Màu sắc của nhóm (nếu có)
  icon: string; //
  background: string; // Background của nhóm (nếu có)
  messages: Message_type[];
  participants: participants[]; // Danh sách người tham gia cuộc trò chuyện];
  isDeleted: string;
  createdAt: Date;
  participantIds: string[];
  firstMessageTime?: string;
  permission: string;
  messageError: Message_type[];
  otherContent: string;
  totalMessage: number;
  lastSync: string;
};
export default Conversation;
