import React, { useState } from "react";
import { View, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Video from "react-native-video";
import { Message_type } from "../../../../type/Home/Chat_type";
import SwipePreview from "./SwipePreview";

type PreviewMediaProps = {
  isMyMessage: boolean;
  currentMessage: Message_type;
  getPosition:()=>void
};

const PreviewMedia: React.FC<PreviewMediaProps> = ({ isMyMessage, currentMessage,getPosition }) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Kiểm tra nếu không có attachments
  if (!currentMessage.attachments || currentMessage.attachments.length === 0) {
    return null;
  }

  // Kích thước mỗi item trong grid (tính toán dựa trên chiều rộng màn hình)
  const screenWidth = Dimensions.get("window").width;
  const numColumns = 3; // Số cột trong grid
  const itemWidth = (screenWidth - 40) / numColumns; // 40 là padding tổng

  const renderItem = ({ item, index }: { item: any; index: number }) => {
     const type=  item.type.startsWith('image/') ? 'image' :
     item.type.startsWith('video/') ? 'video' : 'file';
    return (
      <TouchableOpacity
      onLongPress={getPosition}
        style={[styles.itemContainer, { width: itemWidth, height: itemWidth }]}
        onPress={() => {
          setSelectedIndex(index);
          setIsPreviewVisible(true);
        }}
      >
        {type === "image" ? (
          <Image
          source={{ uri:item.url }}
            style={styles.media}
            resizeMode="cover"
          />
        ) : type === "video" ? (
          <Video
            source={{ uri: item.url }}
            style={styles.media}
            resizeMode="cover"
            paused={true} // Tạm dừng video
            controls={true} // Hiển thị thanh điều khiển
          />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        alignSelf: isMyMessage ? "flex-end" : "flex-start",
        marginVertical: 5,
        alignContent: "center",
        justifyContent: "space-around",
        backgroundColor: "green",
      }}
    >
      <FlatList
        data={currentMessage.attachments}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        numColumns={numColumns}
        scrollEnabled={false} // Tắt cuộn nếu cần
      />
      {isPreviewVisible && (
        <SwipePreview
          attachments={currentMessage.attachments}
          initialIndex={selectedIndex}
          onClose={() => setIsPreviewVisible(false)}
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  itemContainer: {
    margin: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});

export default PreviewMedia;