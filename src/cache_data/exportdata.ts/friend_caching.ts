import { realm } from "../Schema/schemaModel";

const createListfriend = async (friend: any) => {
       realm.write(() => {
        realm.create('friend', friend);
       });
 }

 const getListfriend = async () => {
    const friend = await realm.objects('friend');
    return friend;
 }
 export {createListfriend,getListfriend};