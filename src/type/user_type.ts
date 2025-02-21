
type User_type = {
    _id: string;
    access_token: string;
    name: string;
    avatar: string;
    email: string;
    fcmtoken: string[];
    refresh_token: string;
}
//   interface userMessage {
//     _id: string;
//     action_notifi: boolean;
//     avatar: string;
//     name: string;
//     role: string;
//     status_read: boolean;
//     user_id: string;
//   }
// export type { userMessage };
export default User_type; 
