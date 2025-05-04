import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Video, {VideoRef} from 'react-native-video';

interface MediaGridProps {
  mediaList: {
    type: string;
    uri: string;
  }[];
  onViewMore: () => void;
}

const MediaGrid = ({mediaList, onViewMore}: MediaGridProps) => {
  const displayLimit = 2; // Hiển thị tối đa 3 ảnh
  const remainingCount = mediaList.length - displayLimit;
  const color = useSelector((state: {colorApp: {value: string}}) => state.colorApp.value);
  const {width, height} = useWindowDimensions();
  const renderImage = (media:any, index:any) => {
    if (index === displayLimit - 1 && remainingCount > 0) {
      return (
        <TouchableOpacity
          key={index}
          style={[styles.gridItem]}
          onPress={onViewMore}>
          {media.type === 'image/jpeg' ? (
            <Image
              source={{uri: media.uri}}
              style={styles.imageStyle}
              resizeMode="contain"
            />
          ) : (
            <Video
              source={{uri: media.uri}}
              style={styles.imageStyle}
              resizeMode="contain"
              paused
              repeat
            />
          )}

          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{remainingCount}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <>
        {media.type === 'image/jpeg' ? (
          <Image
            source={{uri: media.uri}}
            style={styles.imageStyle2}
            resizeMode="contain"
          />
        ) : (
          <Video
            source={{uri: media.uri}}
            style={styles.imageStyle2}
            resizeMode="contain"
            paused
            repeat
          />
        )}
      </>
    );
  };

  return (
    <View style={[styles.gridContainer, ]}>
      {mediaList.slice(0, displayLimit).map((media:any, index:number) => (
        <View key={index} style={[styles.gridItem]}>
          {renderImage(media, index)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  gridItem: {
    flex: 1,
    gap: 4,
    position: 'relative',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageStyle2: {
    flex: 1,
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'rbga(255, 255, 255,0.3)',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MediaGrid;
