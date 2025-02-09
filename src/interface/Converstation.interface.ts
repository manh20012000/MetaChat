import { Message_interface } from "./Chat_interface";

interface Conversation {
  _id: string; // ID của cuộc trò chuyện
  roomName: string | null; // Tên của nhóm hoặc tên động được tạo từ các thành viên
  avatar: string | null; // Ảnh đại diện nhóm hoặc danh sách ảnh đại diện
  type: string; // Loại cuộc trò chuyện (vd: "group" hoặc "direct")
  color: string; // Màu sắc của nhóm (nếu có)
  icon: string; //
  background: string; // Background của nhóm (nếu có)
  messages: Message_interface[];
  participants:
  [{
    _id: string; // ID của thành viên
    name: string; // Tên của thành viên
    avatar: string;
    role: string;
  },];
    
  
  lastMessage?: Message_interface;
  firstMessageTime?: string;
  permission: string;
}
export default Conversation;
