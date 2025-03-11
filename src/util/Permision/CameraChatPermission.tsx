import { PermissionsAndroid } from "react-native";

const PermissionCamera = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: 'Cool Photo App Camera Permission',
                message:
                    'Cool Photo App needs access to your camera ' +
                    'so you can take awesome pictures.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true; // Quyền được cấp
        } else {
            console.log('Camera permission denied');
            return false; // Quyền bị từ chối
        }
    } catch (err) {
        console.warn(err, 'Lỗi khi yêu cầu quyền camera');
        return false; // Xảy ra lỗi
    }
};

export default PermissionCamera;

