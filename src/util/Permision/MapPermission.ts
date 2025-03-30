import { PermissionsAndroid, Platform } from "react-native";

const requestLocationPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const fineLocationGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const coarseLocationGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    if (fineLocationGranted && coarseLocationGranted) {
   
      return true;
    } else {
      console.log("Người dùng từ chối một hoặc cả hai quyền.");
      return false;
    }
  } catch (err) {
    console.log("Lỗi khi yêu cầu quyền:", err);
    return false;
  }
};

export default requestLocationPermissions;
