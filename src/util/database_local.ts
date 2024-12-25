import Realm from 'realm';
import { UserSchema } from '../cache_data/Schema/searchUser_schema';

// Khởi tạo Realm với schema
const realm = new Realm({ schema: [UserSchema] });


export { realm };