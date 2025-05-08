import { navigationRef } from "../../navigation/navigation"


const HandlerReciverVideoCall = (data: any, isCaller: boolean, status: string) => {
  try {
    const navigationData = {
      caller: JSON.parse(data.caller),
      converstationVideocall: JSON.parse(data.converstationVideocall),
      isOnpenCamera: false,
      isCaller: isCaller,
      status: status, // xem là video được chấp nhận hay chỉ là video thương thôi
    };

    navigationRef.navigate('ReciverScreen', navigationData);
  } catch (err) {
    console.log('lỗi điều hướng', err);
  }

}
export default HandlerReciverVideoCall