import { AndroidImportance } from "@notifee/react-native";

export type navigationType = {
  screen: string;
  id_navigation: string;
};

export const notificationType = {
  NOTIFI_VIDEO_CALL: 'video_call',
  NOTIFI_MESSAGE: 'message',
};
export interface NotificationConfig {
    channelId: string;
    channelName: string;
    importance: AndroidImportance;
    sound?: string;
    vibration?: boolean;
    vibrationPattern?: number[];
    actions?: { title: string; pressAction: { id: string; launchActivity?: string } }[];
    iosCategoryId?: string;
  }