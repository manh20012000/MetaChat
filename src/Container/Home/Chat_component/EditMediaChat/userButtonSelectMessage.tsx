import React from 'react';
import {BSON} from 'realm';
type UseButtonMessageProps= {
  selected: File[];
  onSend:any,
  userChat: any; // Replace 'any' with the appropriate type
  conversation: any; // Replace 'any' with the appropriate type
  setSelectedItemsMedia: (items: any[]) => void; // Replace 'any' with the appropriate type
}

const UseButtonMessage = ({
  selected,
  onSend,
  userChat,
  conversation,
  setSelectedItemsMedia,
}: UseButtonMessageProps) => {
  const hanlderMessSend = () => {
    let filesOrder = selected.map((file: any, index: number) => {
      return {
        index,
        type: file.type,
      };
    });
   

    if (selected.length > 0) {
      const message = {
        _id: new BSON.ObjectId().toString(),
        conversation_id: conversation._id,
        user: userChat,
        messageType: 'attachment',
        text: null,
        voice: null,
        attachments: selected,
        callDetails: null,
        createdAt: new Date(),
        reactions: [],
        receiver: conversation.participantIds,
        isRead: [],
        replyTo: null,
        recall: false,
      };

     onSend(message, filesOrder, true);
      setSelectedItemsMedia([]);
    }
  };

  return { hanlderMessSend };
};
export default UseButtonMessage;
