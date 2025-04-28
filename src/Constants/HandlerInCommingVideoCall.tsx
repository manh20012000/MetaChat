import { navigationRef } from "../navigation/navigation"


 const  HandlerIncommingVideoCall =(data:any,isCaller:boolean,status:string)=>{
  try {
    const navigationData = {
      caller: JSON.parse(data.caller),
      roomId: data.roomId,
      participants: JSON.parse(data.participants),
      isOnpenCamera: false,
      isCaller: isCaller,
      status: status,
    };

    navigationRef.navigate('CommingVideoCall', navigationData);
  } catch (err) {
    console.log('lỗi điều hướng', err);
  }

}
export default HandlerIncommingVideoCall