import { postFormData,putData } from './resfull_api';
import { API_ROUTE } from './api_enpoint';
import { Message_type } from '../type/Home/Chat_type';
import Conversation from '../type/Home/Converstation_type';
import { GiftedChat } from 'react-native-gifted-chat';
import useCheckingService from './Checking_service';

export const updateMessageReaction = async (
    message: Message_type,
    userChat: any,
) => {
    const { user, dispatch } = useCheckingService();
    try {
        const response = await putData(
            API_ROUTE.UPDATE_MESSAGE,
            {
                conversation_id: message.conversation_id,
                user: userChat,
                message: message,
            },
            { dispatch, user },
        );

        if (response.status === 200) {
            console.log('Cập nhật phản ứng thành công');
        } else {
            throw new Error('Cập nhật phản ứng thất bại');
        }
    } catch (error) {
        console.error('Cập nhật phản ứng thất bại:', error);
    }
};