import Conversation from '../../interface/Converstation.interface';
import {Message_interface} from '../../interface/Chat_interface';
import {realm} from '../Schema/schemaModel';
import {itemuser} from '../../interface/search_user.interface';
import { BSON, EJSON, ObjectId } from 'bson';
import { postData } from '../../service/resfull_api';
import { API_ROUTE } from '../../service/api_enpoint';
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
        permission: Conversation.permission,
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
      .sorted('updatedAt', true);
    return conversations;
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
    });

  
  } catch (error: any) {
    console.error('Lỗi khi cập nhật cuộc hội thoại:', error.message);
    throw error;
  }
};



//
 let isProcessing = false;
const findAndconvertConversation = async (
  participants: any[],
  checking:any
) => {
  try {
    let isProcessing = true;

    // Lọc các cuộc hội thoại có số lượng participants bằng nhau
    const conversations = realm
      .objects<{participants: {_id: string}[]}>('Conversation')
      .filtered(`participants.@size == ${participants.length}`);

    let existingConversation: any = null;

    // Kiểm tra danh sách participants có khớp hoàn toàn không
    for (let conv of conversations) {
      const existingParticipantIds = conv.participants.map(p => p._id);
      const serverParticipantIds = participants.map(p => p._id);

      const isMatch =
        serverParticipantIds.every(id => existingParticipantIds.includes(id)) &&
        existingParticipantIds.every(id => serverParticipantIds.includes(id));

      if (isMatch) {
        existingConversation = conv;
        break;
      }
    }

    let updatedConversation = null;

    realm.write(async() => {
      if (existingConversation) {
        // Nếu cuộc hội thoại đã tồn tại, cập nhật dữ liệu mới
        existingConversation.updatedAt = new Date().toISOString();
        updatedConversation = existingConversation;
      } else {
       const response = await postData(
         API_ROUTE.CREATE_CONVERSTATION,
         participants,
         checking,
        );
        if (response.status === 200) {
           updatedConversation = realm.create(
             'Conversation',
             response.data,
           );
        } else {
          throw new Error('Tạo cuộc hội thoại mới thất bại.');
        }
       
        // Nếu không tìm thấy cuộc hội thoại, tạo cuộc hội thoại mới
        // const newConversation = {
        //   _id: new BSON.ObjectId().toString(),
        //   roomName: null,
        //   avatar: null,
        //   participants: participants,
        //   color: 'red',
        //   icon: '😁',
        //   background: 'black',
        //   lastMessage: null,
        //   messages: [],
        //   updatedAt: new Date().toISOString(),
        //   permission: 'lock',
        // };
    
       
      }
    });
    return updatedConversation;
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
}
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
//   message: Message_interface,
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
