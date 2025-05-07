import { navigationRef } from "../../navigation/navigation"


const HandlerReciverVideoCall = (data: any, isCaller: boolean, status: string) => {
  try {
    const navigationData = {
      caller: JSON.parse(data.caller),
      roomId: data.roomId,
      participants: JSON.parse(data.participants),
      isOnpenCamera: false,
      isCaller: isCaller,
      roomName:data.roomName,
      status: status, // xem là video được chấp nhận hay chỉ là video thương thôi
    };

    navigationRef.navigate('ReciverScreen', navigationData);
  } catch (err) {
    console.log('lỗi điều hướng', err);
  }

}
export default HandlerReciverVideoCall