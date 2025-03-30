import Conversation from '../../type/Home/Converstation_type';
import {Message_type} from '../../type/Home/Chat_type';
import {realm} from '../Schema/schema_realm_model';
import {itemuser} from '../../type/Home/search_type';
import {BSON, EJSON, ObjectId} from 'bson';

import {deleteData, postData} from '../../service/resfull_api';
import {API_ROUTE} from '../../service/api_enpoint';
import {converstation} from '../../util/util_chat/converstation';
import userMessage from '../../type/Home/useMessage_type';
const createConversation = async (Conversation: Conversation) => {
  try {
    // Kiểm tra xem cuộc hội thoại có tồn tại không
    const existingConversation = realm.objectForPrimaryKey(
      'Conversation',
      Conversation._id,
    );

    if (existingConversation) {
      return; // Dừng lại nếu đã tồn tại
    }

    // Nếu không tồn tại, thêm vào Realm
    realm.write(() => {
      realm.create('Conversation', {
        _id: Conversation._id, // Sử dụng ID của cuộc hội thoại
        roomName: Conversation.roomName,
        avatar: Conversation.avatar,
        color: Conversation.color,
        icon: Conversation.icon,
        background: Conversation.background,
        participants: Conversation.participants,
        participantIds: Conversation.participantIds,
        messages: Conversation.messages,
        permission: Conversation.permission,
        isDeleted: Conversation.isDeleted,
        createdAt: Conversation.createdAt,
        lastSync:Conversation.lastSync,
      });
    });
  } catch (error) {
    console.error('Lỗi khi tạo cuộc hội thoại:', error);
  }
};

const getConversations = async () => {
  try {
    const conversations = realm
      .objects('Conversation')
      .sorted('updatedAt', true)
      .slice(0, 20);
    const formattedConversations = conversations.map((conversation: any) => {
      return {
        ...conversation,
        messages: conversation.messages?.sorted('createdAt', true).slice(0, 20),
      };
    });

    return formattedConversations;
  } catch (error: any) {
    console.error(
      'Lỗi khi lấy danh sách cuộc hội thoại:',
      error.message,
      error.stack,
    );
    return [];
  }
};
//
const update_Converstation = async (
  message: Message_type,
  participantIds: string[],
) => {
  try {
    const conditions = participantIds
      .map((id, index) => `ANY participants.user._id == $${index}`)
      .join(' AND ');

    const matchingConversation: any = realm
      .objects('Conversation')
      .filtered(conditions, ...participantIds)[0];

    if (!matchingConversation) {
      throw new Error('Không tìm thấy cuộc hội thoại phù hợp.');
    }
    realm.write(() => {
      // Cập nhật `lastMessage` và thêm tin nhắn mới
      matchingConversation.lastMessage = message;
      matchingConversation.messages.unshift(message); // Thêm vào đầu danh sách
      matchingConversation.updatedAt = new Date().toISOString(); // Cập nhật thời gian sửa đổi
      matchingConversation.lastSync=message.lastSync;
    });
  } catch (error: any) {
    console.error('Lỗi khi cập nhật cuộc hội thoại:', error.message);
    throw error;
  }
};

//
let isProcessing = false;
const findAndconvertConversation = async (
  participants: any,
  participantIds: string[],
  checking: any,
) => {
  try {
    // Tạo query lọc các cuộc hội thoại có đủ participantIds
    const conditions = participantIds
      .map((id, index) => `participantIds CONTAINS $${index}`)
      .join(' AND ');

    const conversations = realm
      .objects('Conversation')
      .filtered(
        `participantIds.@size == ${participantIds.length} AND ${conditions}`,
        ...participantIds,
      );

    let existingConversation = conversations[0] || null; // Lấy cuộc hội thoại đầu tiên nếu có

    if (existingConversation) {
      
      // Nếu đã có, cập nhật updatedAt và trả về ngay
      realm.write(() => {
        existingConversation.updatedAt = new Date().toISOString();
        existingConversation.isDeleted = [];

      });
      return existingConversation;
    } else {
      const newConversation = {
        _id: new ObjectId().toString(),
        roomName: null,
        avatar: null,
        color: 'black',
        icon: '👍',
        background: 'blue',
        createAt: new Date().toISOString(), // Chuyển Date thành chuỗi
        participants: participants,
        participantIds: participantIds,
        messages: [],
        permission: 'lock',
        isDeleted: null,
        messageError: [],
        lastSync:new Date().toISOString(),
      };
      return newConversation;
    }
  } catch (error) {
    console.error('Lỗi khi tìm hoặc tạo mới cuộc hội thoại:', error);
    throw error;
  }
};

const update_permission = async (conversation: Conversation) => {
  const oldConversation = realm.objectForPrimaryKey(
    'Conversation',
    conversation._id,
  );
  if (oldConversation) {
    realm.write(() => {
      oldConversation.permission = conversation.permission;
    });
  }
};
const delete_converStation = async (
  converstation: Conversation,
  checking: any,
  // setConversations: (data: Conversation[]) => void // Hàm cập nhật state
) => {
  try {
    const oldConversation = realm.objectForPrimaryKey(
      'Conversation',
      converstation._id,
    );
    if (!oldConversation) {
      console.warn('Cuộc hội thoại không tồn tại trong Realm');
      return;
    }
    realm.write(() => {
      realm.delete(oldConversation.messages);
      realm.delete(oldConversation.messageError);
      if (!oldConversation.isDeleted) {
        oldConversation.isDeleted = [];
      }
      oldConversation.isDeleted = [
        ...converstation.isDeleted,
        checking.user._id,
      ];

     
    });
    const response = await deleteData(
      API_ROUTE.DELETE_CONVERSTATION,
      checking,
      converstation._id,
      converstation._id,
    );

    if (response.status !== 200) {
      throw new Error('Xóa cuộc hội thoại trên server thất bại.');
    }
  } catch (error: any) {
    console.error('Lỗi khi xóa cuộc hội thoại:', error.message, error.stack);
    throw error;
  }
};

const Converstation_Message = async (
  message: Message_type,
  conversation: Conversation,
  send_id: string,
) => {
  try {
    const conditions = conversation.participantIds
      .map((id: any, index: any) => `participantIds CONTAINS $${index}`)
      .join(' AND ');

    const conversations = realm
      .objects('Conversation')
      .filtered(
        `participantIds.@size == ${conversation.participantIds.length} AND ${conditions}`,
        ...conversation.participantIds,
      );

    let existingConversation = conversations[0] || null;

    realm.write(() => {
      if (existingConversation) {
        (existingConversation.messages as Message_type[]).unshift(message);
        existingConversation.updatedAt = message.createdAt;
        existingConversation.lastSync=message.createdAt;
      } else {
        realm.create('Conversation', converstation(conversation, message));
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const MessageError = async (
  message: Message_type,
  conversation: Conversation,
  send_id: string,
) => {
  try {
    const conditions = conversation.participantIds
      .map((id: any, index: any) => `participantIds CONTAINS $${index}`)
      .join(' AND ');

    const conversations = realm
      .objects('Conversation')
      .filtered(
        `participantIds.@size == ${conversation.participantIds.length} AND ${conditions}`,
        ...conversation.participantIds,
      );

    let existingConversation = conversations[0] || null;

    realm.write(() => {
      if (existingConversation) {
        (existingConversation.messageError as Message_type[]).unshift(message);
        existingConversation.updatedAt = message.createdAt;
      } else {
        realm.create('Conversation', converstation(conversation, message));
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const updateMessage = (message: Message_type, conversation: Conversation) => {
  realm.write(() => {
    let existingConversation = realm
      .objects<Conversation>('Conversation')
      .filtered('_id == $0', message.conversation_id)[0];

    if (!existingConversation) return;

    // 🔍 Tìm tin nhắn trong Realm
    let existingMessage = realm
      .objects<Message_type>('Message')
      .filtered('_id == $0', message._id)[0];

    if (existingMessage) {
      // ✅ Cập nhật từng trường một cách thủ công
      if (message.text !== undefined) existingMessage.text = message.text;
    
      if (message.messageType !== undefined)
        existingMessage.messageType = message.messageType;
      if (message.attachments !== undefined)
        existingMessage.attachments = message.attachments;
      if (message.callDetails !== undefined)
        existingMessage.callDetails = message.callDetails;
      if (message.reactions !== undefined)
        existingMessage.reactions = message.reactions;
      if (message.recall !== undefined) existingMessage.recall = message.recall;
      if (message.isRead !== undefined) existingMessage.isRead = message.isRead;
      if (message.replyTo !== undefined)
        existingMessage.replyTo = message.replyTo;
      if (message.statusSendding !== undefined)
        existingMessage.statusSendding = message.statusSendding;
      if (message.status !== undefined) existingMessage.status = message.status;
      if (message.other !== undefined) existingMessage.other = message.other;

      // ✅ Cập nhật `reciver` (xóa hết phần tử cũ và thêm mới)
      if (message.receiver !== undefined) {
        existingMessage.receiver.splice(
          0,
          existingMessage.receiver.length,
          ...message.receiver,
        );
      }
    } else {
      // ✅ Nếu chưa có tin nhắn, thêm mới
      existingConversation.lastSync=message.lastSync
      existingConversation.messages.push(realm.create('Message', message));
    }

    // 🔄 Cập nhật `updatedAnpnp
    existingConversation.createdAt = new Date();
  });
};
const recallMessage = (conversation_id: string, message_id: string) => {
  realm.write(() => {
    const conversation = realm
      .objects<Conversation>('Conversation')
      .filtered('_id == $0', conversation_id)[0];

    if (!conversation) {
      return;
    }
    const messages = conversation.messages as unknown as Message_type[];

    const messageIndex = messages.findIndex(msg => msg._id === message_id);
    if (messageIndex === -1) {
      return;
    }
    messages[messageIndex].recall = true; // Thêm cờ nhận diện
    messages[messageIndex].messageType = 'recall';
    (messages[messageIndex].attachments = []),
      (messages[messageIndex].text = null),
      (messages[messageIndex].isRead = []);
    messages[messageIndex].receiver = [];
    conversation.createdAt = new Date();
    conversation.otherContent = 'tin nhắn đã được gỡ';
    conversation.lastSync= new Date().toISOString();
    
  
  });
};

const deleteMessage = (conversation_id: string, message_id: string) => {
  realm.write(() => {
    const conversation = realm
      .objects<Conversation>('Conversation')
      .filtered('_id == $0', conversation_id)[0];

    if (!conversation) {
      return;
    }
    const messages = conversation.messages as unknown as Message_type[];

    const messageIndex = messages.findIndex(msg => msg._id === message_id);
    if (messageIndex === -1) {
      return;
    }
    messages.splice(messageIndex, 1);
  });
};
const deleteMessageError = (conversation_id: string, message_id: string) => {
  realm.write(() => {
    const conversation = realm
      .objects<Conversation>('Conversation')
      .filtered('_id == $0', conversation_id)[0];

    if (!conversation) {
      return;
    }
    const messageError = conversation.messageError as unknown as Message_type[];
    const messageIndex = messageError.findIndex(msg => msg._id === message_id);
    if (messageIndex === -1) {
      return;
    }
    messageError.splice(messageIndex, 1);
  });
};
// const handlerUpdateMessage = async ({
//   converstation_id,
//   updatedMessage,
// }: {
//   converstation_id: string;
//   updatedMessage: Message_type;
// }) => {
//   if (!realm) return;
//   realm.write(async () => {
//     const conversation: Conversation = (await realm
//       .objects<Conversation>('Conversation')
//       .filtered(
//         '_id == $0',
//         converstation_id,
//       )[0]) as unknown as Conversation;
//     if (conversation) {
//       if (!conversation.messages) {
//         conversation.messages = [];
//       }
//       let messageIndex = await conversation.messages.findIndex(
//         msg => msg._id === updatedMessage._id,
//       );
//       if (messageIndex !== -1) {
//         conversation.messages[messageIndex] = updatedMessage;
//       } else {
//         conversation.messages = [...conversation.messages, updatedMessage];
//       }
//     }
//   });
// };
export {
  Converstation_Message,
  createConversation,
  delete_converStation,
  deleteMessageError,
  update_Converstation,
  getConversations,
  findAndconvertConversation,
  updateMessage,
  deleteMessage,
  recallMessage,
  MessageError,
};

//const update_Messages_Converstation = async (converstation:Conversation) => {
//     const updateMessage = realm.objects('Conversation');
//     try {
//         updateMessage.forEach((converstation_item) => {
//             if (converstation_item._id === converstation._id) {
//                 realm.write(() => {
//                     converstation_item.lastMessage = converstation.lastMessage;
//                     converstation_item.roomName = converstation.roomName;
//                     converstation_item.avatar = converstation.avatar;
//                     converstation_item.participants = converstation.participants;
//                     converstation_item.color = converstation.color;
//                     converstation_item.icon = converstation.icon;
//                     converstation_item.background = converstation.background;
//                    
//                 });
//             }
//         })
//         return converstation;
//     } catch (error: any) {
//         console.log(error,'error with update converstation')
//       }

// }
//const convertConverstation = async (conversation: Conversation) => {
//   try {
//     const existingConversation = realm.objectForPrimaryKey(
//       'Conversation',
//       conversation._id,
//     );

//     if (existingConversation) {
//       // Nếu đã tồn tại, chuyển cuộc hội thoại lên đầu danh sách
//       realm.write(() => {
//         const updatedConversation = {
//           ...existingConversation,
//         };
//         realm.delete(existingConversation); // Xóa bản ghi cũ
//         realm.create('Conversation', updatedConversation); // Tạo lại để đưa lên đầu
//       });

//       console.log(
//         `Cuộc hội thoại với ID ${conversation._id} đã được chuyển lên đầu.`,
//       );
//     }
//   } catch (error) {
//     console.error('Lỗi khi chuyển cuộc hội thoại lên đầu:', error);
//     throw error;
//   }
// }
// matchingConversation.messages.forEach(message => {
//   realm.delete(message.reactions); // Xóa cảm xúc liên quan
//   realm.delete(message.attachments); // Xóa file đính kèm
//   if (message.replyTo) {
//     realm.delete(message.replyTo); // Xóa tin nhắn được trả lời
//   }
// });
// Sau đó xóa tất cả tin nhắn
// realm.delete(matchingConversation.messages)c;
//const update_Converstation = async(
//   message: Message_type,
//   participantIds: string[],
// ) => {
//   try {
//     // Tạo điều kiện tìm kiếm
//     const conditions = participantIds
//       .map((id, index) => `ANY participants.user._id == $${index}`)
//       .join(' AND '); // Sử dụng "AND" để đảm bảo tất cả đều khớp

//     // Thực hiện truy vấn với tham số
//     const matchingConversation: any = realm
//       .objects('Conversation')
//       .filtered(conditions, ...participantIds)[0];

//     if (!matchingConversation) {
//       throw new Error('Không tìm thấy cuộc hội thoại phù hợp.');
//     }

//     // Sao chép dữ liệu cần thiết từ matchingConversation vào tempConversation
//     const tempConversation = {
//       _id: matchingConversation._id,
//       roomName: matchingConversation.roomName,
//       avatar: matchingConversation.avatar,
//       color: matchingConversation.color,
//       icon: matchingConversation.icon,
//       background: matchingConversation.background,
//       participants: matchingConversation.participants.map((p:any) => ({...p})), // Deep copy
//       messages: matchingConversation.messages.map((m:any) => ({...m})), // Deep copy

//     };

//     // Ghi vào Realm trong một giao dịch
//     realm.write(() => {
//       // Xóa bản ghi cũ sau khi đã sao chép dữ liệu vào tempConversation
//       realm.delete(matchingConversation);
//       console.log('Bản ghi này được xóa');

//       // Tạo bản ghi mới
//        const newConversation = realm.create('Conversation', {
//          ...tempConversation,
//          lastMessage: message,
//          messages: [message,...tempConversation.messages ],
//         });
//         // Realm.UpdateMode.Modified,
//       console.log('Bản ghi mới đã được tạo:111->>>>>  ');

//     });
//   } catch (error: any) {
//     console.error('Lỗi khi thay thế cuộc hội thoại:', error.message);
//     throw error;
//   }
// };
