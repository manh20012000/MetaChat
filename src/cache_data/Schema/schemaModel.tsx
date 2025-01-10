import Realm from "realm";
import { UserSchema } from "./searchUser_schema";
import { ConversationSchema,AttachmentSchema,CallDetailSchema,MessageSchema,ParticipantSchema,ReactionSchema } from "./chat_convertstation_schema";
const schemas = [
     UserSchema,
    ConversationSchema,
    AttachmentSchema,
    CallDetailSchema,
    MessageSchema,
    ParticipantSchema,
    ReactionSchema,
  ]

export const realm = new Realm({
    schema: schemas,
   // deleteRealmIfMigrationNeeded: true, // Delete old data if schema is updated
  
});