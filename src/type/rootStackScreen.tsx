import Conversation from "./Home/Converstation_type";

export type RootStackParamList = {
  CameraChat: undefined;
  VideoCallHome:any,
  CommingVideoCall: {
    data?: any;
    caller: any;
    userCall: any;
    roomId: string;
    camera?: boolean;
    nameCall:string,
    conversation:Conversation,
    isFromNotification:boolean
  };
};
