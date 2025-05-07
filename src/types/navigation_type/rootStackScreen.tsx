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
    roomId: string;
    isOnpenCamera: boolean;
    participants: any,
    isCaller: boolean,
    roomName: string,
    status: string,
  };
};
