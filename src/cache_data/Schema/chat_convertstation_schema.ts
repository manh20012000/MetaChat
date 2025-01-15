// Định nghĩa `Participant` Model
const ParticipantSchema = {
  name: 'Participant',
  properties: {
    user: 'user?',
    role: 'string?', // Vai trò ("admin", "member")
  },
};
const ReplyMessageSchema = {
  name: 'ReplyMessage',
  properties: {
    _id: 'string?', // ID của tin nhắn được reply
    content: 'string?', // Nội dung của tin nhắn được reply
  },
};
const userSchema = {
  name: 'user',
  properties: {
    _id: 'string?', // ID người gửi
    name: 'string?',
    avatar: 'string?',
  },
};

const LastMessageSchema = {
  name: 'LastMessage',
  properties: {
    _id: 'string?',
    conversation_id: 'string',
    user: 'user?',
    messageType: 'string?',
    voice: 'string?',
    text: 'string?',
    attachments: 'Attachment[]',
    callDetails: 'CallDetail?',
    createdAt: 'string?',
    reactions: 'Reaction[]',
    isRead: 'string[]',
    replyMessage: 'ReplyMessage?',
  },
};

const MessageSchema = {
  name: 'Message',
  properties: {
    _id: 'string?', // ID của tin nhắn
    conversation_id: 'string', // ID cuộc hội thoại
    user: 'user?', // Người gửi
    messageType: 'string?', // Loại tin nhắn ("text", "attachment", ...)
    voice: 'string?',
    text: 'string?', // Nội dung tin nhắn văn bản
    attachments: 'Attachment[]', // File đính kèm
    callDetails: 'CallDetail?', // Chi tiết cuộc gọi
    createdAt: 'string?', // Thời gian tạo
    reactions: 'Reaction[]', // Danh sách cảm xúc
    isRead: 'string[]', // Danh sách người đã đọc
    replyMessage: 'ReplyMessage?', // Tin nhắn được reply // Tin nhắn được trả lời
  },
  // Đánh chỉ mục cho các trường thường xuyên truy vấn
};
const AttachmentSchema = {
  name: 'Attachment',
  properties: {
    type: 'string?', // Loại file ("image", "video", "voice", ...)
    url: 'string?', // URL file
  },
};
const CallDetailSchema = {
  name: 'CallDetail',
  properties: {
    duration: 'int?', // Thời lượng cuộc gọi
    status: 'string?', // Trạng thái ("missed", "answered", "rejected")
    callType: 'string?', // Loại cuộc gọi ("audio", "video")
    createdAt: 'string?', // Thời gian tạo
  },
};
const ReactionSchema = {
  name: 'Reaction',
  properties: {
     user: 'user?',
    type: 'string?', // Loại cảm xúc (e.g., "heart", "thumbs_up")
  },
};

// Định nghĩa `Message` Model

const ConversationSchema = {
  name: 'Conversation',
  primaryKey: '_id',
  properties: {
    _id: 'string?',
    roomName: 'string?',
    avatar: 'string?',
    participants: 'Participant[]',
    color: 'string?',
    icon: 'string?',
    background: 'string?',
    lastMessage: 'LastMessage', // Phải đảm bảo `LastMessage` được đăng ký đúng cách
    messages: 'Message[]',
    updatedAt: 'string?', // Thời gian sửa đổi gần nhất
  },
};

export {
  ParticipantSchema,
  MessageSchema,
  LastMessageSchema,
  ConversationSchema,
  AttachmentSchema,
  CallDetailSchema,
  ReactionSchema,userSchema,
  ReplyMessageSchema,
  
};
