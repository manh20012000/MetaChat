import { realm } from "../Schema/schemaModel";

const createListfriend = async (friend: any) => {
   try {
   console.log(friend,'giá trị friend')
    // Kiểm tra xem user đã tồn tại trong Realm chưa
    const existingFriend = realm
      .objects('friend')
      .filtered(`_id == "${friend._id}"`)[0];

    if (!existingFriend) {
      // Nếu user chưa tồn tại, thêm vào Realm
      realm.write(() => {
        realm.create('friend', friend);
      });
      console.log(`Đã thêm user: ${friend._id}`);
    } else {
      console.log(`User với _id: ${friend._id} đã tồn tại, không thêm.`);
    }
  } catch (error) {
    console.error('Lỗi khi thêm bạn bè vào danh sách:', error);
  }
};

 const getListfriend = async () => {
    const friend:any = await realm.objects('friend');
    return friend;
 }
 export {createListfriend,getListfriend};