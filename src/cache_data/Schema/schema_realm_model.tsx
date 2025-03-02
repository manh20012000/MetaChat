import Realm from "realm";
import { UserSchema } from "./schema_search_user";
import { ConversationSchema, AttachmentSchema, CallDetailSchema, MessageSchema, ParticipantSchema, ReactionSchema, ReplyToSchema, userSchema, IsReadSchema,  } from "./chat_convertstation_schema";
import friendSchema from "./schema_user";
const schemas = [
  UserSchema,
  ConversationSchema,
  AttachmentSchema,
  CallDetailSchema,
  MessageSchema,
  ParticipantSchema,
  ReactionSchema,
  ReplyToSchema,
  userSchema,
  friendSchema,
  IsReadSchema,
];
export const realm = new Realm({
    schema: schemas,
   deleteRealmIfMigrationNeeded: true, // Delete old data if schema is updated
  
});