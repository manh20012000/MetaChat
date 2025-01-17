/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import React, {useEffect, useReducer, useState} from 'react';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import hasAndroidPermission from '../../../util/Permision/PhotoPermision';
import {
  BottomSheetFlashList,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
const GetAllMedia_Bottomsheet = (props: any) => {
  const {width, height} = useWindowDimensions();
  const [photos, setPhotos] = useState<any[]>([]);
  const [page, setPage] = useState(1); // State quản lý pagination (số lượng đã tải)
  const isPortrait = height > width;
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );

  const fetchPhotos = async () => {

    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    const Photos = await CameraRoll.getPhotos({
      assetType: 'All',
      first: 12 * page, // Số lượng tải tùy thuộc vào số trang hiện tại
      after: 1 * page + '',
    });

    if (Photos.edges && Photos.edges.length > 0) {
      setPhotos(prevPhotos => [ ...Photos.edges,...prevPhotos]);
      setPage(prevPage => prevPage + 1);
    } else {
      console.log('No photos found');
    }
  };
  useEffect(() => {
    fetchPhotos();
  }, []);

const handleSelectItem = (item: any) => {
  props.handleSelect(item);
  setSelectedItems(prevSelectedItems => {
    const isSelected = prevSelectedItems.some(
      (selected: any) => selected.id === item.node.id,
    );
    return isSelected
      ? prevSelectedItems.filter(
          (selected: any) => selected.id !== item.node.id,
        )
      : [...prevSelectedItems, item.node];
  });
};


  const getSelectedIndex = (id: string) => {
    return selectedItems.findIndex((item: any) => item.id === id) + 1;
  };
 
  return (
    <View style={{flex: 1, backgroundColor: 'pink'}}>
      <Text style={{textAlign: 'center', color: 'white', marginVertical: 10}}>
        All Image
      </Text>
      <FlashList
        data={photos}
        keyExtractor={(item, index) => `${item.node.id}-${index}`}
        renderItem={({item}) => {
          const isSelected = selectedItems.some(
            (selected: any) => selected.id === item.node.id,
          );
          const selectedIndex = getSelectedIndex(item.node.id);

          return (
            <TouchableOpacity
              style={{
                width: width / 3,
                height: width / 3,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
              onPress={() => handleSelectItem(item)}>
              {item.node.type !== 'image/jpeg' ? (
                <>
                  <Video
                    source={{uri: item.node.image.uri}}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                    }}
                    resizeMode="cover"
                    paused={true}
                    onLoad={data => {
                      // Cập nhật thời gian video từ data.duration
                      item.node.image.playableDuration = Math.floor(
                        data.duration,
                      ); // Lưu lại thời gian (nếu chưa có)
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
                    {item.node.image.playableDuration
                      ? `${Math.floor(
                          item.node.image.playableDuration / 60,
                        )}:${(item.node.image.playableDuration % 60)
                          .toString()
                          .padStart(2, '0')}`
                      : '00:00'}
                  </Text>
                </>
              ) : (
                <Image
                  source={{uri: item.node.image.uri}}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              )}
              {isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'green',
                    borderRadius: 50,
                    padding: 5,
                  }}>
                  <Text style={{color: 'white'}}>{selectedIndex}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        onEndReached={fetchPhotos}
        onEndReachedThreshold={0.01} // Ngưỡng 10% từ cuối danh sách
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true} // Kích hoạt cuộn lồng nhau
        numColumns={3}
      />
    </View>
  );
}
export default GetAllMedia_Bottomsheet;
  // const selectTed = async (item: any) => {
  //   try {
  //     const uri = item.node.image.uri;
  //     let result = {};
  //     if (item.node.type === 'image/jpeg') {
  //       result = await Image.getSize(uri);
  //     }
  //     setArrayselectImage((prevSelectedItems: any) => {
  //       const isSelected = prevSelectedItems.some(
  //         (selected: any) => selected?.id === item.node.id,
  //       );
  //       if (isSelected) {
  //         // If item is already selected, remove it
  //         return prevSelectedItems.filter(
  //           (selected: any) => selected?.id !== item.node.id,
  //         );
  //       } else {
  //         if (item.node.type === 'image/jpeg') {
  //           // Sử dụng VideoProcessor để lấy thông tin vide
  //           console.log(result, 'hahah');
  //           const imagepicker = {
  //             id: item.node.id,
  //             uri: item.node.image.uri,
  //             //   width: result.width,
  //             //   height: result.height,
  //             name: item.node.image.filename,
  //             type: item.node.type,
  //             fileSize: item.node.image.fileSize,
  //           };
  //           return [...prevSelectedItems, imagepicker];
  //         } else {
  //           const imagepicker = {
  //             id: item.node.id,
  //             uri: item.node.image.uri,
  //             width: item.node.image.width,
  //             height: item.node.image.height,
  //             name: item.node.image.filename,
  //             type: item.node.type,
  //             fileSize: item.node.image.fileSize,
  //           };
  //           return [...prevSelectedItems, imagepicker];
  //         }
  //       }
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };