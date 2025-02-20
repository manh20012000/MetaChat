import Realm from "realm";
import { UserSchema } from "./searchUser_schema";
import { ConversationSchema, AttachmentSchema, CallDetailSchema, MessageSchema, ParticipantSchema, ReactionSchema, ReplyToSchema, LastMessageSchema, userSchema, IsReadSchema, ReactionDetailSchema } from "./chat_convertstation_schema";
import friendSchema from "./user_schema";
const schemas = [
  UserSchema,
  ConversationSchema,
  AttachmentSchema,
  CallDetailSchema,
  MessageSchema,
  ParticipantSchema,
  ReactionSchema,
  LastMessageSchema,
  ReplyToSchema,
  userSchema,
  friendSchema,
  IsReadSchema, ReactionDetailSchema
];
export const realm = new Realm({
    schema: schemas,
   // deleteRealmIfMigrationNeeded: true, // Delete old data if schema is updated
  
});