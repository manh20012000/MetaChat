import {useCallback, useState} from 'react';
import {Vibration} from 'react-native';

export const useHandleLongPress = () => {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const handleLongPress = useCallback((message: any) => {
    Vibration.vibrate(50);
    setSelectedMessages(prevSelectedMessages =>
      prevSelectedMessages.includes(message._id)
        ? prevSelectedMessages.filter(id => id !== message._id)
        : [...prevSelectedMessages, message._id],
    );
  }, []);

  return { handleLongPress};
};
