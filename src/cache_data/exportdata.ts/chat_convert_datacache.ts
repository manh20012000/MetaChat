
import Conversation from '../../interface/Converstation';
import {Message_interface} from '../../interface/Chat_interface';
import {realm} from '../Schema/schemaModel';
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
        lastMessages: Conversation.lastMessage,
      });

      console.log('Cuộc hội thoại đã được tạo thành công.', newConversation);
    });
  } catch (error) {
    console.error('Lỗi khi tạo cuộc hội thoại:', error);
  }
};

const getConversations = async() => {
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
const update_Converstation = async(conversation: Conversation) => {
    try {
        const last30Records = conversation.lastMessage?.slice(-30) || [];
        // Tìm bản ghi cũ dựa trên _id
        const oldConversation = realm.objectForPrimaryKey(
            'Conversation',
            conversation._id,
    );

    realm.write(() => {
      if (oldConversation) {
        // Xóa bản ghi cũ nếu tồn tại
        realm.delete(oldConversation);
        console.log(`Đã xóa cuộc hội thoại cũ với _id: ${conversation._id}`);
      }

      // Tạo bản ghi mới
      const newConversation = realm.create('Conversation', {
        _id: conversation._id,
        roomName: conversation.roomName,
        avatar: conversation.avatar,
        color: conversation.color,
        icon: conversation.icon,
        background: conversation.background,
        participants: conversation.participants,
        lastMessage: last30Records,
      });

      console.log('Bản ghi mới đã được tạo:', newConversation);
    });

    return conversation;
  } catch (error: any) {
    console.error(
      'Lỗi khi thay thế cuộc hội thoại:',
      error.message,
      error.stack,
    );
    throw error;
  }
};

const delete_converStation = async (converstation: Conversation) => {
   const oldConversation = realm.objectForPrimaryKey(
     'Conversation',
     converstation._id,
   );
try{
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
export {
  createConversation,
  delete_converStation,
  update_Converstation,
  getConversations,
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
