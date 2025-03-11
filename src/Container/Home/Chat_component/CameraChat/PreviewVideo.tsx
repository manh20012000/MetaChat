import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import formatSeconds from '../../../../util/TimerLaft/formatTime';

type PreviewVideoProps = {
  video: any;
};

const PreviewVideo: React.FC<PreviewVideoProps> = ({ video }) => {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Hàm xử lý khi bấm phát hoặc tạm dừng
  const togglePlayPause = () => {
    setPaused((prev) => !prev);
  };

  // Khi video chạy, cập nhật thời gian hiện tại
  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  // Khi video load xong, cập nhật tổng thời gian
  const onLoad = (data: any) => {
    setDuration(data.duration);
  };

  // Khi video kết thúc, đặt lại trạng thái ban đầu
  const onEnd = () => {
    setPaused(true);
    setCurrentTime(0);
    videoRef.current?.seek(0); // Reset về đầu video
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatSeconds(currentTime)} / {formatSeconds(duration)}
        </Text>
      </View>

      {/* Video Player */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)} // Nhấn để hiển thị / ẩn điều khiển
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: video?.path || 'https://www.w3schools.com/html/mov_bbb.mp4' }}
          style={styles.video}
          paused={paused}
          resizeMode="contain"
          onEnd={onEnd}
          onProgress={onProgress}
          onLoad={onLoad}
          controls={false} // Tắt điều khiển mặc định
        />

        {/* Hiển thị nút phát/tạm dừng */}
        {showControls && (
          <View style={styles.controls}>
            <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
              <Ionicons name={paused ? 'play-circle' : 'pause-circle'} size={40} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  videoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    marginHorizontal: 10,
  },
  timeContainer: {
    marginTop: 10,
    position: 'absolute',
    top: 30,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PreviewVideo;
