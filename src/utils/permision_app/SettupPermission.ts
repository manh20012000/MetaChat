import {Permission, PermissionsAndroid, Platform} from 'react-native';

const HandlerPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const permissions: Permission[] = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ];

      const permissionsToRequest: Permission[] = [];
      for (const permission of permissions) {
        const status = await PermissionsAndroid.check(permission);
        if (!status) {
          permissionsToRequest.push(permission);
        }
      }

      if (permissionsToRequest.length > 0) {
        const results = await PermissionsAndroid.requestMultiple(
          permissionsToRequest,
        );
        return permissions.every(
          permission =>
            results[permission] === PermissionsAndroid.RESULTS.GRANTED,
        );
      }
      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  }
  return true;
};

export default HandlerPermission;
