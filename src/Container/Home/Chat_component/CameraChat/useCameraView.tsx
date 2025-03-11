import {launchCamera, CameraOptions} from 'react-native-image-picker';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useIsFocused,
} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import PermissionCamera from '../../../../util/Permision/CameraChatPermission';

import {RootStackParamList} from '../../../../type/rootStackScreen';
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useCameraDevices,
  useCameraFormat,
  useFrameProcessor,
  useLocationPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import {useSharedValue} from 'react-native-reanimated';
import {eventEmitter} from '../../../../eventEmitter/EventEmitter';
type Photo = {
  url: string
  name: string,
  type: string
 
};

const useCameraView = (cameraRef: React.RefObject<Camera>) => {
  const navigation = useNavigation();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const {hasPermission, requestPermission} = useMicrophonePermission();
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocationPermission();
  const zoom = useSharedValue(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Lưu trữ ID của setInterval

  const isPressingButton = useSharedValue(false);
  const [regime, setRegime] = useState<'photo' | 'video'>('photo');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );

  const [capturedPhoto, setCapturedPhoto] = useState<Photo | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<any | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);  
  const [recordingTime, setRecordingTime] = useState(0);
  const [microphone, setMicrophone] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const isFocussed = useIsFocused();
  const handlerMicOn_Off = async () => {
    setMicrophone(!microphone);
  };
  const handlerCameraPickture = async () => {
    {
    }
  };
  const toggleFlash = () => {
    setFlash(prev => (prev === 'off' ? 'on' : 'off'));
  };
  const switchCamera = () => {
    setCameraPosition(!cameraPosition ? 'front' : 'back');
  };

  const handlerGoback = () => {
    clearInterval(intervalRef.current!);
    navigation.goBack();
  };
 
  const takePicture = async () => {
    if (!cameraRef.current) return;
  
    const photo = await cameraRef.current.takePhoto();
    if (!photo?.path) return;      
    // Lấy phần mở rộng file (jpg, jpeg, png)
    const fileType = photo.path.split('.').pop()?.toLowerCase() ?? 'jpg';
  
    // Xác định MIME type
    const mimeTypeMap: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
  
    const mimeType = mimeTypeMap[fileType] || 'image/jpeg';
  
    setCapturedPhoto({
      url: `file://${photo.path}`,
      name: `photo_${Date.now()}.${fileType}`,
      type: mimeType,
    });
  };
  
  const handleSuccess = () => {
    if (capturedPhoto) {
      eventEmitter.emit('onCapture', [capturedPhoto]);
    } else if (capturedVideo?.path) {
      // Lấy phần mở rộng file video (mov, mp4)
      const fileType = capturedVideo.path.split('.').pop()?.toLowerCase() ?? 'mp4';
  
      // Xác định MIME type video
      const mimeTypeMap: { [key: string]: string } = {
        mov: 'video/quicktime',
        mp4: 'video/mp4',
      };
  
      const mimeType = mimeTypeMap[fileType] || 'video/mp4';
  
      const videoCapture = {
        url: `file://${capturedVideo.path}`,
        name: `video_${Date.now()}.${fileType}`,
        type: mimeType,
      };
  
      eventEmitter.emit('onCapture', [videoCapture]);
    }
  
    navigation.goBack();
  };
  const handlerCancel = () => {
    setCapturedPhoto(null);
    setIsCameraActive(true);
    setCapturedVideo(null);
    clearInterval(intervalRef.current!);  
  };
  
  const cameraOptions = (regime: 'photo' | 'video') => {
    setRegime(regime);
    if (regime === 'photo') {
      setRegime('photo');
    } else if (!hasPermission) {
      requestPermission();
    }
  };
  const handleStartVideo = async () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);

      intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    try {
      await cameraRef.current?.startRecording({
       
        onRecordingFinished: (video) => {
          setCapturedVideo(video)
          setIsRecording(false);
           setIsPaused(false);
          clearInterval(intervalRef.current!);
          setRecordingTime(0);
        },
        onRecordingError: (error) => {
          console.error('Lỗi quay video:', error);
          clearInterval(intervalRef.current!);
        },
      });
    } catch (error) {
      console.error('Lỗi quay video:', error);
    }
  };

  const handlePauseVideo = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      // Tiếp tục đếm thời gian nếu đang tạm dừng
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      // Tạm dừng đếm thời gian
      clearInterval(intervalRef.current!);
    }
  };
  const handleStopVideo = async () => {
    setIsRecording(false);
    setIsPaused(false);
    clearInterval(intervalRef.current!);

    try {
      await cameraRef.current?.stopRecording();
    } catch (error) {
      console.error('Lỗi dừng video:', error);
    }
  };


  return {
   
    handlerCameraPickture,
    handleSuccess,
    handlerGoback,
    isCameraInitialized,
    setIsCameraInitialized,
    microphone,
    takePicture,
    hasPermission,
    location,
    zoom,
    isPressingButton,
    isRecording,
    isFocussed,
    switchCamera,
    cameraPosition,
    toggleFlash,
    flash,
    recordingTime,capturedVideo,
    regime,
    setRegime,
    handlerCancel,
    cameraOptions,
    handlerMicOn_Off,
    capturedPhoto,
    setCapturedPhoto,
    isCameraActive,
    setIsCameraActive,
    handleStopVideo, handlePauseVideo,
    handleStartVideo
  };
};

export default useCameraView;
