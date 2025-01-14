import Conversation from '../../interface/Converstation.interface';
import {Message_interface} from '../../interface/Chat_interface';
import {realm} from '../Schema/schemaModel';
import {itemuser} from '../../interface/search_user.interface';
import {BSON, EJSON, ObjectId} from 'bson';
const createConversation = async (Conversation: Conversation) => {
  try {
    realm.write(() => {
      // Tạo cuộc hội thoại mới dùng này để tạo ra id nha new Realm.BSON.ObjectId(),
      const newConversation = realm.create('Conversation', {
        _id: Conversation._id, // Tạo ID mới cho cuộc hội thoại
        roomName: Conversation.roomName,
        avatar: Conversation.avatar,
        color: Conversation.color,
        icon: Conversation.icon,
        background: Conversation.background,
        participants: Conversation.participants,
        lastMessage: Conversation.lastMessage,
        messages: Conversation.messages,
      });

      console.log('Cuộc hội thoại đã được tạo thành công.', newConversation);
    });
  } catch (error) {
    console.error('Lỗi khi tạo cuộc hội thoại:', error);
  }
};

const getConversations = async () => {
  try {
    const conversations = realm.objects('Conversation');
    return Array.from(conversations);
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
  message: Message_interface,
  participantIds: string[],
) => {
  try {
    // Tạo điều kiện tìm kiếm
    const conditions = participantIds
      .map((id, index) => `ANY participants.user._id == $${index}`)
      .join(' AND '); // Sử dụng "AND" để đảm bảo tất cả đều khớp

    // Thực hiện truy vấn với tham số
    const matchingConversation: any = realm
      .objects('Conversation')
      .filtered(conditions, ...participantIds)[0];

    if (!matchingConversation) {
      throw new Error('Không tìm thấy cuộc hội thoại phù hợp.');
    }

    // Sao chép dữ liệu cần thiết từ matchingConversation vào tempConversation
    const tempConversation = {
      _id: matchingConversation._id,
      roomName: matchingConversation.roomName,
      avatar: matchingConversation.avatar,
      color: matchingConversation.color,
      icon: matchingConversation.icon,
      background: matchingConversation.background,
      participants: matchingConversation.participants.slice(),
      messages: matchingConversation.messages.slice(),
    };

    // Ghi vào Realm trong một giao dịch
    realm.write(() => {
      // Xóa bản ghi cũ sau khi đã sao chép dữ liệu vào tempConversation
      realm.delete(matchingConversation);
      console.log('Bản ghi này được xóa');

      // Tạo bản ghi mới
      const newConversation = realm.create('Conversation', {
        _id: tempConversation._id,
        roomName: tempConversation.roomName,
        avatar: tempConversation.avatar,
        color: tempConversation.color,
        icon: tempConversation.icon,
        background: tempConversation.background,
        participants: tempConversation.participants,
        lastMessage: message,
        messages: [...tempConversation.messages, message],
      });

      console.log('Bản ghi mới đã được tạo:111->>>>>  ');
      return newConversation;
    });
  } catch (error: any) {
    console.error('Lỗi khi thay thế cuộc hội thoại:', error.message);
    throw error;
  }
};


const delete_converStation = async (converstation: Conversation) => {
  const oldConversation = realm.objectForPrimaryKey(
    'Conversation',
    converstation._id,
  );
  try {
    realm.write(() => {
      if (oldConversation) {
        // Xóa bản ghi cũ nếu tồn tại
        realm.delete(oldConversation);
        console.log(`Đã xóa cuộc hội thoại cũ với _id: ${converstation._id}`);
      }
    });
  } catch (error: any) {
    console.error(
      'Lỗi khi thay thế cuộc hội thoại:',
      error.message,
      error.stack,
    );
    throw error;
  }
};
//
let isProcessing = false;
const findAndconvertConversation = async (
  userId: itemuser,

  participantIds: string[],
  participants: any,
) => {
  // Chuyển danh sách _id thành chuỗi JSON để dùng trong bộ lọc
  const participantIdsString = JSON.stringify(participantIds);

  try {
    isProcessing = true;

    const conditions = participantIds
      .map((id, index) => `ANY participants.user._id == $${index}`)
      .join(' AND '); // Sử dụng "AND" để đảm bảo tất cả đều khớp

    // Thực hiện truy vấn với tham số
    const matchingConversation: any = realm
      .objects('Conversation')
      .filtered(conditions, ...participantIds)[0];
    let updatedConversation = null;

    await realm.write(() => {
      if (matchingConversation) {
        // Logic xử lý khi tìm thấy cuộc hội thoại
        const conversationData = {
          _id: matchingConversation._id,
          roomName: matchingConversation.roomName,
          avatar: matchingConversation.avatar,
          color: matchingConversation.color,
          icon: matchingConversation.icon,
          background: matchingConversation.background,
          lastMessage: matchingConversation.lastMessage,
          participants: matchingConversation.participants.slice(),
          messages: matchingConversation.messages.slice(),
        };

        
        // matchingConversation.messages.forEach(message => {
        //   realm.delete(message.reactions); // Xóa cảm xúc liên quan
        //   realm.delete(message.attachments); // Xóa file đính kèm
        //   if (message.replyMessage) {
        //     realm.delete(message.replyMessage); // Xóa tin nhắn được trả lời
        //   }
        // });
        // Sau đó xóa tất cả tin nhắn
        // realm.delete(matchingConversation.messages);
        realm.delete(matchingConversation);
        updatedConversation = realm.create('Conversation', conversationData);
      } else {
        // Tạo cuộc hội thoại mới
        const newConversation = {
          _id: new BSON.ObjectId().toString(),
          roomName: null,
          avatar: null,
          participants: participants,
          color: 'red',
          icon: '😁',
          background: 'black',
          lastMessage: null,
          messages: [],
        };

        updatedConversation = realm.create('Conversation', newConversation);
        console.log(`Đã tạo cuộc hội thoại mới với userId ${userId._id}.`);
      }
    });
    console.log(updatedConversation, 'updatedConversation');
    return updatedConversation;
  } catch (error) {
    console.error('Lỗi khi tìm và chuyển hoặc tạo mới cuộc hội thoại:', error);
    throw error;
  }
};

export {
  createConversation,
  delete_converStation,
  update_Converstation,
  getConversations,
  findAndconvertConversation,
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
//                     console.log('Cuộc hội thoại đã được cập nhật thành công.');
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
