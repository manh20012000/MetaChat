import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import Video,{VideoRef} from "react-native-video";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SwipePreview: React.FC<{
  attachments: any;
  initialIndex: number;
  onClose: () => void;
}> = ({ attachments, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRef = useRef<VideoRef>(null);

  const renderItem = ({ item }: { item: any }) => {
    const type=  item.type.startsWith('image/') ? 'image' :
     item.type.startsWith('video/') ? 'video' : 'file';
    return (
      <View style={styles.mediaContainer}>
        {type === "image" ? (
          <Image
          source={{ uri:item.url }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : type === "video" ? (
          <Video
            ref={videoRef}
            source={{ uri: item.url }}
            style={styles.media}
            resizeMode="contain"
            paused={true} // Tạm dừng video khi không active
            controls={true} // Hiển thị điều khiển
            onEnd={() => videoRef.current?.seek(0)} // Quay lại đầu khi kết thúc
          />
        ) : null}
      </View>
    );
  };

  const onScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  return (
    <Modal visible={true} transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
        <FlatList
          data={attachments}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          horizontal={true}
          pagingEnabled={true}
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={onScrollEnd}
          showsHorizontalScrollIndicator={false}
        />
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>
            {currentIndex + 1}/{attachments.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  closeText: {
    color: "white",
    fontSize: 18,
  },
  indexContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  indexText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
});

export default SwipePreview;