// Định nghĩa `Participant` Model
const userSchema = {
  name: 'user',
  properties: {
    _id: 'string?', // ID người gửi
    user_id: 'string?',
    name: 'string?',
    avatar: 'string?',
    role: 'string?',
    action_notifi: 'bool?', // Cho phép null
    status_read: 'bool?', // Cho phép null
  },
};

const ParticipantSchema = {
  name: 'Participant',
  properties: {
    user: 'user?', // Người đọc tin nhắn 
    message_readed_id:'string?',
    readAt: 'string?'
  },
};
const ReplyToSchema = {
  name: 'ReplyTo',
  properties: {
    _id: 'string?', // ID tin nhắn gốc
    user: 'user?', // Người gửi tin nhắn gốc
    messageType: 'string?', // Loại tin nhắn
    text: 'string?', // Nội dung tin nhắn gốc
  },
};


const MessageSchema = {
  name: 'Message',
  properties: {
    _id: 'string?', // ID của tin nhắn
    conversation_id: 'string', // ID cuộc hội thoại
    user: 'user?', // Người gửi
    messageType: 'string?', // Loại tin nhắn ("text", "attachment", ...)
    text: 'string?', // Nội dung tin nhắn văn bản
    attachments: 'Attachment[]', // File đính kèm
    callDetails: 'CallDetail?', // Chi tiết cuộc gọi
    createdAt: 'string?', // Thời gian tạo
    reactions: 'Reaction[]', // Danh sách cảm xúc
    replyTo: 'ReplyTo?', // ✅ Đổi từ `replyTo` thành `replyTo`
    statusSendding:'bool?',
    receiver: 'string[]',
    recall: "bool?",
  },

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
    user: 'user?', // ✅ Giữ nguyên
    reaction: 'int?', 
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
    messages: 'Message[]',
    updatedAt: 'string?', // Thời gian sửa đổi gần nhất
    permission: 'string?',
    participantIds: 'string[]',
    isDeleted: 'string[]',
    messageError: 'Message[]',
    otherContent:'string?',
    lastSync:'string?'

  },
};

export {
  ParticipantSchema,
  MessageSchema,
  ConversationSchema,
  AttachmentSchema,
  CallDetailSchema,
  ReactionSchema,
  userSchema,
  ReplyToSchema,
 
};
