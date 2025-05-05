export const UserSchema = {
  name: 'UserSearch',
  primaryKey: '_id',  // Đặt 'id' làm khóa chính
  properties: {
    _id: 'string',        // ID là số nguyên
    name: 'string',   // Tên là chuỗi
    avatar: 'string', // Avatar là đường dẫn URL hoặc base64 string
  },
};