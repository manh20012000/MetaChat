
import { User_search } from '../../type/Home/search_type.ts';
import { realm } from '../Schema/schema_realm_model.tsx';

const create_userSearch = async(users: User_search[]) => {
    try {
             
        realm.write(() => {
            users.forEach((user) => {
                
                realm.create('UserSearch', user);
            });
        });
    } catch (error) {
        console.error('Error adding user:', error);

    };
}
const get_userSearch = async() => {
    try {
        const user = await realm.objects('UserSearch').map(user => ({
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          roomName: user.roomName ?? null, // Nếu `roomName` là `null` hoặc `undefined`, trả về null
        }));
    
        return user
      
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