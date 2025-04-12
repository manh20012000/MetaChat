import Conversation from "./Home/Converstation_type";

export type RootStackParamList = {
  ChatScreen:{
    item: Conversation;
  };
  CameraChat: undefined;
  VideoCallHome:any,
  CommingVideoCall: {
    data?: any;
    caller:any;
    roomId: string;
    isOnpenCamera: boolean;
    participants:any,
    isCaller:boolean,
    status:string,
  };
};
