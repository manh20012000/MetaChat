import React from 'react';
import {BSON} from 'realm';
type UseButtonMessageProps= {
  selected: File[];
  onSend:any,
  userChat: any; // Replace 'any' with the appropriate type
  conversation: any; // Replace 'any' with the appropriate type
  setSelectedItemsMedia: (items: any[]) => void; // Replace 'any' with the appropriate type
  handleSheetChanges:(index:number)=>void
}

const UseButtonMessage = ({
  selected,
  onSend,
  userChat,
  conversation,
  setSelectedItemsMedia,
  handleSheetChanges
}: UseButtonMessageProps) => {
  const hanlderMessSend = () => {
    let filesOrder = selected.map((file: any, index: number) => {
      return {
        index,
        type: file.type,
      };
    });
    handleSheetChanges(-1)

    if (selected.length > 0) {
      const message = {
        _id: new BSON.ObjectId().toString(),
        conversation_id: conversation._id,
        user: userChat,
        messageType: 'attachment',
        text: null,
        attachments: selected,
        callDetails: null,
        createdAt: new Date(),
        reactions: [],
        receiver: conversation.participantIds,
   
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
