interface Conversation {
    _id: string; // ID của cuộc trò chuyện
    name: string | null; // Tên của nhóm hoặc tên động được tạo từ các thành viên
    avatar: string | null // Ảnh đại diện nhóm hoặc danh sách ảnh đại diện
    type: string; // Loại cuộc trò chuyện (vd: "group" hoặc "direct") 
    admin: string; // ID của admin nếu cần (tuỳ chọn)
    color: string; // Màu sắc của nhóm (nếu có)
    background: string; // Background của nhóm (nếu có)
    participants: { // Danh sách các thành viên
        _id: string; // ID của thành viên
        name: string; // Tên của thành viên
        avatar: string; // Ảnh đại diện
    }[];
    lastMessage?: {
        _id: string; // ID của tin nhắn
        sender: string; // ID của người gửi
        createdAt: Date;
        name_send:string;
        content: {

            type: string;
            content: string

        };
    };
    read_user?: {
        _id: string;
        avatar: string,
        account: string
    }[]
}
export default Conversation