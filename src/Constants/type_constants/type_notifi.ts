export const VIDEO_CALL_TYPE = 'video_call';
export const MESSAGE_TYPE = 'message';
export enum CallStatus {
  WAITING = 'waiting', // chưa ai nhận
  CALLING = 'calling', // đang gọi
  ENDED = 'ended', // đã kết thúc
}
export enum CallNotifiButton {
  ACCEPT = 'accept_call', // nhận
  REJECT = 'reject_call', // chối
  COMMING = 'comming_call', // chờ cuộc gọi
}

// Định nghĩa các hằng số cho tên sự kiện
export const CALL_UPDATE = 'call_update';
export const RECEIVE_SIGNAL = 'receiveSignal';
export const NEW_PARTICIPANT = 'new_participant';
export const CALL_ENDED = 'call_ended';
export const CALL_CANCELLED = 'call_cancelled';
export const FORCE_END_CALL = 'force_end_call';
export const CLEAR_CALL_NOTIFICATION = 'clear_call_notification';
export const SEND_SIGNAL='sendSignal';
export const ROOM_JOINED = 'room_joined';
export const ROOM_LEFT = 'room_left';
export const CALL_ACCEPTED='call_accepted';
export const CALL_DECLINED='call_declined'

export const CONNECT = 'connect';
export const CON_NECTING='connecting'
export const DISCONNECT = 'disconnect';
export const DIS_CONNECTED='disconnected'
export const CONNECT_ERROR = 'connect_error';
export const PARTICIPANT_JOIN='participant_joined'

export const OFFER='offer'
export const ANSWER='answer'
export const ICE_CAN_DIDATE='iceCandidate'
export const STABLE='stable'
export const CLOSED='closed';
export const FAILED='failed'
export const CON_NECT_TED='connected'