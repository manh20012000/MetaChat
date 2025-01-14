import Realm from "realm";
import { UserSchema } from "./searchUser_schema";
import { ConversationSchema,AttachmentSchema,CallDetailSchema,MessageSchema,ParticipantSchema,ReactionSchema, ReplyMessageSchema, LastMessageSchema, userSchema } from "./chat_convertstation_schema";
const schemas = [
  UserSchema,
  ConversationSchema,
  AttachmentSchema,
  CallDetailSchema,
  MessageSchema,
  ParticipantSchema,
  ReactionSchema,
  LastMessageSchema,
  ReplyMessageSchema,
  userSchema,
];

export const realm = new Realm({
    schema: schemas,
   // deleteRealmIfMigrationNeeded: true, // Delete old data if schema is updated
  
});