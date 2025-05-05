import {realm} from '../schema/schema_realm_model';

const createListfriend = async (friend: any) => {
  try {
    // Kiểm tra xem user đã tồn tại trong Realm chưa
    const existingFriend = realm
      .objects('friend')
      .filtered(`_id == "${friend._id}"`)[0];

    if (!existingFriend) {
      // Nếu user chưa tồn tại, thêm vào Realm
      realm.write(() => {
        realm.create('friend', friend);
      });
    }
  } catch (error) {
    console.error('Lỗi khi thêm bạn bè vào danh sách:', error);
  }
};

const getListfriend = async () => {
  const friend: any = await realm.objects('friend');
  return friend;
};
export {createListfriend, getListfriend};
