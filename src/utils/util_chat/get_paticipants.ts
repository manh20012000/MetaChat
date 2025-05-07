import {participants} from '../../types/home_type/Converstation_type';
import userMessage from '../../types/home_type/useMessage_type';

const filterParticipants = (
  participantsList: participants[],
  user: userMessage,
)=> {
  return participantsList
    .filter(
      (paticipant: participants) => paticipant.user.user_id !== user.user_id,
    )
    .map((paticipant: participants) => paticipant.user)
    
};


export {filterParticipants};
