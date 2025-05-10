import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraProps,
  useCameraDevice,
  useCameraFormat,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCameraView from './useCameraView';
import Reanimated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Statusbar from '../../../../commons/share_components/StatusBar';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import formatSeconds from '../../../../../utils/time_app/formatTime';
import PreviewVideo from './PreviewVideo';
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

const CameraChat: React.FC = () => {
  const cameraRef = useRef<Camera | null>(null);
  const microphones = useMicrophonePermission()
  const { width, height } = useWindowDimensions();
  const color = useSelector(
    (value: { colorApp: { value: any } }) => value.colorApp.value,
  );
  const {
    handlerCameraPickture,
    handleSuccess,
    capturedVideo,
    isRecording,
    handlerGoback,
    setIsCameraInitialized,
    microphone,
    takePicture,
    location,
    regime,
    switchCamera,
    toggleFlash,
    flash,
    capturedPhoto,
    recordingTime,
    cameraOptions,
    handlerMicOn_Off,
    isCameraActive,
    handlerCancel,
    handleStopVideo, handlePauseVideo,
    handleStartVideo
  } = useCameraView(cameraRef);
  const [isPaused, setIsPaused] = useState(false);
  const device = useCameraDevice('front');
  const isFocused = useIsFocused();
  const zoom = useSharedValue<number>(device?.neutralZoom || 1);
  const zoomOffset = useSharedValue<number>(0);
  const [enableHdr, setEnableHdr] = useState(false);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value; // Bỏ dấu '?' không cần thiết
    })
    .onUpdate(event => {
      const z = zoomOffset.value * event.scale;

      // Kiểm tra device trước khi truy cập minZoom và maxZoom
      if (device) {
        zoom.value = interpolate(
          z,
          [1, 10], // Giá trị đầu vào
          [device.minZoom, device.maxZoom], // Giới hạn của camera
          Extrapolation.CLAMP,
        );
      }
    });
  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom],
  );
  const [targetFps, setTargetFps] = useState(30);
  const screenAspectRatio = height / width;
  const format = useCameraFormat(device, [
    { fps: targetFps },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: { width: 720, height: 1080 } },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: { width: 720, height: 1080 } },
  ]);
  // const videoHdr = format?.supportsVideoHdr && enableHdr;
  // const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr;
  // const frameProcessor = useFrameProcessor((frame) => {
  //   'worklet'

  //   runAtTargetFps(10, () => {
  //     'worklet'
  //     console.log(`${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`)
  //     examplePlugin(frame)
  //     exampleKotlinSwiftPlugin(frame)
  //   })
  // }, [])

  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Hiệu ứng hiển thị 2 nút khi quay video
  const showButtons = () => {
    Animated.timing(buttonAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hiệu ứng ẩn 2 nút khi dừng quay video
  const hideButtons = () => {
    Animated.timing(buttonAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  const handleStartRecording = () => {
    handleStartVideo();
    showButtons();
  };

  // Tạm dừng quay video
  const handlePauseRecording = () => {
    handlePauseVideo();
  };

  // Dừng hẳn quay video
  const handleStopRecording = () => {
    handleStopVideo();
    hideButtons();
  };
  return (
    <View style={styles.container}>
      {/* <Statusbar
        bgrstatus={color.dark}
        bgrcolor={color.light}
        translucent={true}
      /> */}
      {isRecording && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatSeconds(recordingTime)}</Text>
        </View>
      )}
      <View style={styles.headerView}>
        <TouchableOpacity onPress={handlerGoback}>
          <Ionicons name="arrow-back-sharp" size={30} color="white" />
        </TouchableOpacity>
      </View>
      {capturedPhoto == null && capturedVideo == null ? (
        <View style={[styles.controlesOption]}>
          <TouchableOpacity onPress={toggleFlash}>
            <Ionicons
              name={flash == 'on' ? 'flash' : 'flash-off'}
              size={30}
              color={color.white}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={switchCamera}>
            <MaterialCommunityIcons
              name="camera-flip"
              size={30}
              color={color.white}
            />
          </TouchableOpacity>
          {regime === 'video' && (
            <TouchableOpacity onPress={handlerMicOn_Off}>
              <Ionicons
                name={microphone ? 'mic-off' : 'mic'}
                size={30}
                color={color.white}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[styles.controlesOption, { marginTop: 50 }]}>
          <TouchableOpacity>
            <MaterialIcons name="font-download" size={30} color={color.white} />
          </TouchableOpacity>

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="cookie-edit-outline"
              size={30}
              color={color.white}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <AntDesign name="edit" size={30} color={color.white} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="sticker-emoji"
              size={30}
              color={color.white}
            />
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1, backgroundColor: 'pink' }}>
        {capturedPhoto || capturedVideo ? (
          capturedPhoto
            ? (<Image
              source={{ uri: capturedPhoto.url }}
              style={StyleSheet.absoluteFill}
            />) : (<PreviewVideo video={capturedVideo} />)

        ) : device ? (
          <GestureDetector gesture={gesture}>
            <ReanimatedCamera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isCameraActive}
              format={format}
              // photoQualityBalance="quality"
              enableZoomGesture={true}
              onInitialized={() => {
                setIsCameraInitialized(true);
              }}
              audio={microphones.hasPermission}
              videoHdr={false} // Tắt HDR để tiết kiệm hiệu suất
              // enableLocation={location.hasPermission}
              photo={true}
              video={true}
              animatedProps={animatedProps}
            />
          </GestureDetector>
        ) : (
          <Text>Không tìm thấy camera</Text>
        )}
      </View>

      <View style={styles.bottomControls}>
        {capturedPhoto == null && capturedVideo == null && (
          <View style={styles.TouchControls}>
            <TouchableOpacity onPress={() => cameraOptions('photo')}>
              <Text style={styles.options}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => cameraOptions('video')}>
              <Text style={styles.options}>Video</Text>
            </TouchableOpacity>
          </View>
        )}

        {capturedPhoto || capturedVideo ? (
          <View style={styles.StatusPickture}>
            <TouchableOpacity
              style={[isRecording && { backgroundColor: 'red' }]}
              onPress={handlerCancel}>
              <Text style={styles.buttonSave_Cancel}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSuccess}
              style={[isRecording && { backgroundColor: 'red' }]}>
              <Text style={styles.buttonSave_Cancel}>Lưu</Text>
            </TouchableOpacity>
          </View>
        ) : regime === 'video' ? (
          <>
            {/* Nút quay video */}
            {!isRecording ? (
              <TouchableOpacity
                style={[styles.captureButton, isRecording && { backgroundColor: 'red' }]}
                onPress={handleStartRecording}>
                <Ionicons name="videocam-outline" size={40} color="white" />
              </TouchableOpacity>
            ) : (
              <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim }]}>
                {/* Nút tạm dừng */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isPaused ? 'blue' : 'orange' }]}
                  onPress={handlePauseRecording}>
                  <Ionicons name={isPaused ? 'play-circle' : 'pause-circle'} size={40} color="white" />
                </TouchableOpacity>

                {/* Nút dừng hẳn */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'red' }]}
                  onPress={handleStopRecording}>
                  <Ionicons name="stop-circle" size={40} color="white" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={[styles.captureButton, isRecording && { backgroundColor: 'red' }]}
            onPress={takePicture}>
            <Ionicons name="camera-outline" size={40} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
export default CameraChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerView: {
    width: '100%',
    height: 50,
    paddingLeft: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  controlesOption: {
    justifyContent: 'space-between',
    padding: 10,
    gap: 20,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 20,
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',

    gap: 30,
  },

  timerContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'red',
    borderRadius: 8,
    width: 'auto',
    zIndex: 1,
    paddingHorizontal: 5,
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  TouchControls: {
    flexDirection: 'row',
    top: 20,
    gap: 20,
  },
  options: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    borderRadius: 20,
    borderWidth: 1,
    padding: 5,
    borderColor: 'white',
  },
  StatusPickture: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonSave_Cancel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    fontSize: 25,
    fontWeight: 'bold',
  }, captureButton: {
    backgroundColor: 'red',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    width: 'auto'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
// isFocussed={isFocussed}
// audio={hasPermission.hasPermission}
// frameProcessor={frameProcessor}
// frameProcessor={frameProcessor}
// onStarted={() => console.log('Camera started!')}
// onStopped={() => console.log('Camera stopped!')}
// onPreviewStarted={() => console.log('Preview started!')}
// onPreviewStopped={() => console.log('Preview stopped!')}
// onOutputOrientationChanged={o =>
//   console.log(`Output orientation changed to ${o}!`)
// }
// onPreviewOrientationChanged={o =>
//   console.log(`Preview orientation changed to ${o}!`)
// }
