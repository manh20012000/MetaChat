import AsyncStorage from '@react-native-async-storage/async-storage';
import {CallStatus} from '../constants/type_constants/type_notifi';

export const getCallStatus = async (): Promise<CallStatus> => {
  try {
    const status = await AsyncStorage.getItem('call_status');
    if (status) {
      return status as CallStatus; // ép kiểu về enum CallStatus
    }
    return CallStatus.WAITING; // nếu chưa có thì mặc định đang chờ
  } catch (error) {
    console.error('Error getting call status:', error);
    return CallStatus.WAITING;
  }
};

export const setCallStatus = async (status: CallStatus) => {
  try {
    await AsyncStorage.setItem('call_status', status);
  } catch (error) {
    console.error('Error setting call status:', error);
  }
};
