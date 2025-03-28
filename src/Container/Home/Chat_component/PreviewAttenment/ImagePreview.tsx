import React, { useState } from "react";
import { View, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, Pressable } from "react-native";
import Video from "react-native-video";
import { Message_type } from "../../../../type/Home/Chat_type";
import SwipePreview from "./SwipePreview";

type PreviewMediaProps = {
  isMyMessage: boolean;
  currentMessage: Message_type;
  getPosition: () => void;
  highlightedMessageId:any,
};

const PreviewMedia: React.FC<PreviewMediaProps> = ({ isMyMessage, currentMessage, getPosition,highlightedMessageId }) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!currentMessage.attachments || currentMessage.attachments.length === 0) {
    return null;
  }

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const numAttachments = currentMessage.attachments.length;
  // console.log(highlightedMessageId)
  const highlighted=(currentMessage._id===highlightedMessageId)
  // Nếu chỉ có 1 ảnh -> hiển thị đúng tỉ lệ ảnh
  const isSingleMedia = numAttachments === 1;
  const singleMediaWidth = screenWidth / 2; // 70% width màn hình
  const singleMediaHeight = screenHeight / 3; // 1/3 chiều cao màn hình

  // Nếu có nhiều hơn 1 ảnh, hiển thị dạng grid
  const numColumns = numAttachments === 1 ? 1 : 2;
  const gridItemSize = 120;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const type = item.type.startsWith("image") ? "image" :
                 item.type.startsWith("video") ? "video" : "file";

    const mediaStyle = isSingleMedia
      ? { width: singleMediaWidth, height: singleMediaHeight }
      : { width: gridItemSize, height: gridItemSize };
  // console.log('highlighted',highlighted)
    return (
      <Pressable
        onLongPress={getPosition}
        delayLongPress={250}
        style={[styles.itemContainer, mediaStyle,highlighted?{borderWidth:3,borderColor:'white'}:{}]}
        onPress={() => {
          setSelectedIndex(index);
          setIsPreviewVisible(true);
        }}
      >
        {type === "image" ? (
          <Image source={{ uri: item.url }} style={styles.media} resizeMode="cover" />
        ) : type === "video" ? (
          <Video 
            source={{ uri: item.url }} 
            style={styles.media} 
            resizeMode="cover" 
            paused={true} 
            controls={true} 
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { alignSelf: isMyMessage ? "flex-end" : "flex-start" }
      ]}
    >
      <FlatList
        data={currentMessage.attachments}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        numColumns={numColumns}
        scrollEnabled={false}
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
  container: {
    marginVertical: 5,
    alignContent: "center",
    justifyContent: "center",
  },
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
