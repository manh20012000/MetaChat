import {Message_interface} from '../../interface/Chat_interface';
import { reactions } from '../../interface/Chat_interface';
const handlerMessage = (
  messageCurrent: Message_interface | null,
  reaction: reactions[] = [], // ✅ Định nghĩa kiểu dữ liệu đúng
): Message_interface | null => {
  if (!messageCurrent) return null; // ✅ Kiểm tra null trước khi truy cập thuộc tính

  const message: Message_interface = {
    _id: messageCurrent._id || '', // ✅ Gán giá trị mặc định nếu cần
    conversation_id: messageCurrent.conversation_id || '',
    user: messageCurrent.user,
    messageType: messageCurrent.messageType || 'text',
    text: messageCurrent.text || '',
    createdAt: messageCurrent.createdAt || new Date().toISOString(),
    isRead: messageCurrent.isRead || [],
    replyTo: messageCurrent.replyTo || null,
    statusSendding: false, // ✅ Giữ nguyên
    callDetails: messageCurrent.callDetails || null,
    voice: messageCurrent.voice || '',
    attachments: messageCurrent.attachments || [],
    reactions: reaction.length > 0 ? reaction:messageCurrent.reactions ,
    other: messageCurrent.other || 'bày tỏ cảm xúc', // ✅ Thêm vào thuộc tính mới nếu cần
  };

  return message;
};

export default handlerMessage;
