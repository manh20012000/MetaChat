import Conversation from '../../interface/Converstation.interface';
import {Message_interface} from '../../interface/Chat_interface';
import {realm} from '../Schema/schemaModel';
import {itemuser} from '../../interface/search_user.interface';
import { BSON, EJSON, ObjectId } from 'bson';

import { deleteData, postData } from '../../service/resfull_api';
import { API_ROUTE } from '../../service/api_enpoint';
const createConversation = async (Conversation: Conversation) => {
  try {
    // Kiểm tra xem cuộc hội thoại có tồn tại không
    const existingConversation = realm.objectForPrimaryKey(
      'Conversation',
      Conversation._id,
    );

    if (existingConversation) {
      console.log('Cuộc hội thoại đã tồn tại, không thêm mới.');
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
        
      });
    });

    console.log('Cuộc hội thoại đã được thêm vào Realm.');
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
  participants:any,
  participantIds:string[],
  checking:any,
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
      });
      return existingConversation;
    }
   
    // Nếu không có, gọi API tạo mới
    const response = await postData(
      API_ROUTE.CREATE_CONVERSTATION,
      participants,
      checking,
    );

    if (response.status === 200) {
      let newConversation;
      realm.write(() => {
        newConversation = realm.create(
          'Conversation',
          response.data,
        );
      });
      return newConversation;
    } else {
      throw new Error('Tạo cuộc hội thoại mới thất bại.');
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
}
const delete_converStation = async (
  converstation: Conversation,
  checking: any,
  // setConversations: (data: Conversation[]) => void // Hàm cập nhật state
) => {
  try {
    console.log('Bắt đầu delete');

    const oldConversation = realm.objectForPrimaryKey(
      'Conversation',
      converstation._id
    );

    if (!oldConversation) {
      console.warn('Cuộc hội thoại không tồn tại trong Realm');
      return;
    }

    // Xóa khỏi Realm trước
    realm.write(() => {
      realm.delete(oldConversation);
    });

    // Gọi API xóa trên server
    // const respon = await deleteData(
    //   API_ROUTE.DELETE_CONVERSTATION,
    //   checking,
    //   converstation._id
    // );

    // if (respon.status !== 200) {
    //   throw new Error('Xóa cuộc hội thoại trên server thất bại.');
    // }

    console.log('Xóa thành công!');

    // Cập nhật danh sách cuộc hội thoại sau khi xóa
    // const updatedConversations = realm.objects<Conversation>('Conversation');
    // setConversations([...updatedConversations]); // Cập nhật lại state của UI

  } catch (error: any) {
    console.error('Lỗi khi xóa cuộc hội thoại:', error.message, error.stack);
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
