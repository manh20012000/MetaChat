import Conversation from "../home_type/Converstation_type";

export type RootStackParamList = {
  ChatScreen: {
    conversationId: string;
    userId: string
  };
  CameraChat: undefined;
  CallerScreen: any,
  ReciverScreen: {
    data?: any;
    caller: any;
    isOnpenCamera: boolean; // xem có đúng là trạng thái mở camera hay không 
    converstationVideocall: any,
    isCaller: boolean,
    status: string,
  };
};
