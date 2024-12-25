import Realm from 'realm';
import { UserSchema } from '../Schema/searchUser_schema.ts';
import { User_search } from '../../interface/search_User.ts';
// Khởi tạo Realm với schema
const realm = new Realm({ schema: [UserSchema] });

const create_userSearch = (users: User_search[]) => {
    try {

        realm.write(() => {
            users.forEach((user) => {
                console.log(user, 'mỗi kết quá')
                realm.create('UserSearch', user);
            });
        });
    } catch (error) {
        console.error('Error adding user:', error);

    };
}
const get_userSearch = () => {
    try {
        const user = realm.objects('UserSearch').map((user) => ({
            _id: user._id,
            account: user.account,
            avatar: user.avatar,
        }));
        return user
        console.log(user, 'ahah')
    } catch (error) {
        console.error('Error retrieving users:', error);

        throw error

    }
}
const clearUserSearch = () => {
    try {
        realm.write(() => {
            const allSearches = realm.objects('UserSearch');
            realm.delete(allSearches);
        });
    } catch (error) {
        console.error('Error retrieving users:', error);

        throw error

    }
};
export { realm, create_userSearch, get_userSearch, clearUserSearch };