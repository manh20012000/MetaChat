// Định nghĩa `Participant` Model
const ParticipantSchema = {
  name: 'Participant',
  properties: {
    _id: 'objectId', // ID của người dùng
    account: 'string?',
    avatar: 'string', // Biệt danh
    role: 'string?', // Vai trò ("admin", "member")
  },
};

const MessageSchema = {
  name: 'Message',
  primaryKey: '_id',
  properties: {
    _id: 'objectId', // ID của tin nhắn
    conversationId: 'objectId', // ID cuộc hội thoại
    senderId: 'objectId', // Người gửi
    messageType: 'string', // Loại tin nhắn ("text", "attachment", ...)
    textContent: 'string?', // Nội dung tin nhắn văn bản
    attachments: 'Attachment[]', // File đính kèm
    callDetails: 'CallDetail?', // Chi tiết cuộc gọi
    createdAt: 'date', // Thời gian tạo
    reactions: 'Reaction[]', // Danh sách cảm xúc
    isRead: 'objectId[]', // Danh sách người đã đọc
    replyMessage: 'Message?', // Tin nhắn được trả lời
    },
    // Đánh chỉ mục cho các trường thường xuyên truy vấn
};
const AttachmentSchema = {
  name: 'Attachment',
  properties: {
    type: 'string', // Loại file ("image", "video", "voice", ...)
    url: 'string', // URL file
  },
};
const CallDetailSchema = {
  name: 'CallDetail',
  properties: {
    duration: 'int?', // Thời lượng cuộc gọi
    status: 'string?', // Trạng thái ("missed", "answered", "rejected")
  },
};
const ReactionSchema = {
  name: 'Reaction',
  properties: {
    _id: 'objectId', // ID người dùng
    type: 'string', // Loại cảm xúc (e.g., "heart", "thumbs_up")
  },
};

// Định nghĩa `Message` Model

// Định nghĩa `ConversationChat` Model
const ConversationSchema = {
  name: 'Conversation',
  primaryKey: '_id',
  properties: {
    _id: 'objectId', // ID của cuộc hội thoại
    roomName: 'string?', // Tên phòng (có thể null)
    avatar: 'string?', // Ảnh đại diện
    participants: 'Participant[]', // Danh sách người tham gia
    color: 'string?', // Màu sắc tùy chỉnh
    icon: 'string?', // Icon đại diện
    background: 'string?', // Hình nền hoặc màu nền
    lastMessage: 'objectId[]',
  },
};

export {
  ParticipantSchema,
  MessageSchema,
  ConversationSchema,
  AttachmentSchema,
  CallDetailSchema,
  ReactionSchema,
};
