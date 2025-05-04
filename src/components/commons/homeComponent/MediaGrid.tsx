import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';

const screenWidth = Dimensions.get('window').width;

const MediaGrid = (mediaData: {
    uri: string;
    type: string,
 
}[]) => {
 
  // Kiểm tra loại nội dung (image hoặc video)
  const renderItem = ({item}: any) => {
    const isVideo = item.uri.endsWith('.mp4'); // Xác định file video (có thể thay đổi tùy backend)

    return (
      <View style={{flex: 1, margin: 5}}>
        {item.type === 'video' ? (
          <>
            <Video
              source={{uri: item.uri}}
              style={{
                width: '100%',
                height: 150,
                borderRadius: 10,
              }}
              resizeMode="cover"
              paused={true}
              onLoad={data => {
                item.playableDuration = Math.floor(data.duration); // Cập nhật thời gian video
              }}
            />
            <Text
              style={{
                position: 'absolute',
                top: 5,
                left: 5,
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                paddingHorizontal: 5,
                borderRadius: 3,
              }}>
              {item.playableDuration
                ? `${Math.floor(item.playableDuration / 60)}:${(
                    item.playableDuration % 60
                  )
                    .toString()
                    .padStart(2, '0')}`
                : '00:00'}
            </Text>
          </>
        ) : (
          <Image
            source={{uri: item.uri}}
            style={{
              width: '100%',
              height: 150,
              borderRadius: 10,
            }}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={mediaData}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      numColumns={2} // Hiển thị dạng lưới với 2 cột
      contentContainerStyle={{padding: 5}}
    />
  );
};

export default MediaGrid;
// Ví dụ sử dụng

