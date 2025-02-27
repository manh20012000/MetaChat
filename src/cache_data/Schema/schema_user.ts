 const friendSchema = {
   name: 'friend',
   properties: {
     _id: 'string?',
     name: 'string?',
     user_id: 'string?',
     avatar: 'string?',
     role: 'string?',
     action_notifi: 'bool?', 
     status_read: 'bool?', 
     
   },
 };
export default friendSchema;