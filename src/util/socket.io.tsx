import React, { useEffect, useRef, useState } from 'react';
import socketIOClient, { io, Socket } from 'socket.io-client';
import { API_URL } from '../service/resfull_api.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';

export const SocketContext = React.createContext<Socket | null>(null);

export const useSocket = (): Socket | null => {
  return React.useContext(SocketContext);
};

interface HomeProviderProps {
  children?: React.ReactNode;
}

import { Status } from '../Redux_Toolkit/Reducer/status.User';

export const SocketProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useSelector((state: any) => state.auth.value);
  console.log(API_URL)
  useEffect(() => {
    const connectToSocketServer = async () => {
      if (user) {
        try {
          const userToken: string | null = await AsyncStorage.getItem('user');

          const parsedToken = userToken ? JSON.parse(userToken) : null;
          const accessToken = parsedToken?.access_token;
          const iduser = parsedToken?._id;

          if (!accessToken) {
            throw new Error('JWT token not found');
          }

          const newSocket: Socket = socketIOClient(`${API_URL}`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            auth: {
              token: accessToken,
              userId: iduser,
            },
          });

          newSocket.on('connect', () =>
            console.log('Connected to Socket.IO server'),
          );
          newSocket.on('connect_error', (error: Error) => {
            console.error('Socket.IO connection error:', error);
          });
          newSocket.on('UserOnline', (userId: string) => {
            dispatch(Status(userId));
          });
          newSocket.on('server-send-when-has-user-online', (userId: string) => {
            dispatch(Status(userId));
          });

          setSocket(newSocket);
        } catch (error) {
          console.error('Error connecting to Socket.IO server:', error);
        }
      }
    };

    connectToSocketServer();

    return () => {
      socket?.disconnect();
      socket?.removeAllListeners();
      socket?.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};