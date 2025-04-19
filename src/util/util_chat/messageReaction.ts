import { Message_type, reactions } from "../../type/Home/Chat_type";
const handlerMessage = (
  messageCurrent: Message_type | null,
  reaction: reactions[] = [], // ✅ Định nghĩa kiểu dữ liệu đúng
): Message_type | null => {
  if (!messageCurrent) return null; // ✅ Kiểm tra null trước khi truy cập thuộc tính

  const message: Message_type = {
    _id: messageCurrent._id || '', // ✅ Gán giá trị mặc định nếu cần
    conversation_id: messageCurrent.conversation_id || '',
    user: messageCurrent.user,
    messageType: messageCurrent.messageType || 'text',
    text: messageCurrent.text || '',
    createdAt: messageCurrent.createdAt || new Date().toISOString(),
    replyTo: messageCurrent.replyTo || null,
    statusSendding: false, // ✅ Giữ nguyên
    callDetails: messageCurrent.callDetails || null,
    attachments: messageCurrent.attachments || [],
    reactions: reaction.length > 0 ? reaction:messageCurrent.reactions || [], // ✅ Sử dụng reaction nếu có, nếu không thì sử dụng reactions hiện tại
    other: messageCurrent.other || 'bày tỏ cảm xúc', // ✅ Thêm vào thuộc tính mới nếu cần
    recall: messageCurrent.recall,
    receiver:messageCurrent.receiver,
  };

  return message;
};

export default handlerMessage;
