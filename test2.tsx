// const handlerMarkMessage = () => {
//   // Kiểm tra điều kiện cơ bản
//   if (!conversation?.messages?.length || !userChat) return;

//   // 1. Lấy thông tin người dùng hiện tại trong cuộc trò chuyện
//   const currentUserParticipant = conversation.participants.find(
//     (p: participants) => p.user._id === userChat._id
//   );
//   if (!currentUserParticipant) return;

//   // 2. Lấy tin nhắn cuối cùng TỪ NGƯỜI KHÁC (không phải mình)
//   const otherUserMessages = conversation.messages.filter(
//     msg => msg.user._id !== userChat._id
//   );
//   const lastMessageFromOthers = otherUserMessages[0]; // [0] vì đã sắp xếp tin mới nhất lên đầu

//   // 3. Kiểm tra nếu có tin nhắn mới chưa đọc
//   if (
//     lastMessageFromOthers &&
//     currentUserParticipant.message_readed_id !== lastMessageFromOthers._id
//   ) {
//     // Gửi sự kiện đánh dấu đã đọc
//     handlerSendMarkReadMessge(lastMessageFromOthers);
    
//     // Cập nhật UI ngay lập tức (tuỳ chọn)
//     // setLastReadMessageId(lastMessageFromOthers._id);
//   }

//   // 4. Xác định vị trí đánh dấu "bắt đầu chưa đọc"
//   const lastReadIndex = conversation.messages.findIndex(
//     msg => msg._id === currentUserParticipant.message_readed_id
//   );

//   // 5. Tìm tin nhắn chưa đọc:
//   // - Sau vị trí đã đọc cuối cùng
//   // - VÀ được gửi từ người khác
//   const firstUnreadMessage = conversation.messages
//     .slice(lastReadIndex + 1)
//     .find(msg => msg.user._id !== userChat._id);

//   // 6. Cập nhật state:
//   // - Nếu có tin nhắn mới chưa đọc => đánh dấu
//   // - Nếu KHÔNG CÓ tin nhắn mới => bỏ đánh dấu (set null)
//   setCheckReadMessage(firstUnreadMessage?._id || null);
// };