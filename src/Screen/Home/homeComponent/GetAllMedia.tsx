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
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import hasAndroidPermission from '../../../util/Permision/PhotoPermision';
import RNFS from 'react-native-fs';
import {
  BottomSheetFlashList,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
const getFileExtension = (filename: string) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1); // Lấy phần mở rộng từ dấu `.`
};
const getRealPath = async (uri: string, type: string) => {
  let ext = ".file"; // Mặc định nếu không xác định được
  if (type.startsWith("image/")) ext = ".jpg";
  else if (type.startsWith("video/")) ext = ".mp4";
  else if (type.startsWith("application/pdf")) ext = ".pdf";
  else if (type.startsWith("application/msword")) ext = ".docx";

  const realPath = `${RNFS.TemporaryDirectoryPath}/temp_${Date.now()}${ext}`; // ✅ Đặt tên duy nhất theo loại file
  await RNFS.copyFile(uri, realPath);
  return `file://${realPath}`;
};
const GetAllMedia_Bottomsheet = (props: any) => {
  const {width, height} = useWindowDimensions();
  const [photos, setPhotos] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);  // Cursor cho phân trang
  const [hasNextPage, setHasNextPage] = useState(true); // Còn dữ liệu để tải không
  const isPortrait = height > width;
  const [loading, setLoading] = useState(false); // Trạng thái đang tải
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );

  const fetchPhotos = useCallback(async () => {
    if (!hasNextPage || loading) return; // Dừng nếu hết dữ liệu hoặc đang tải

    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }

    setLoading(true);
    try {
      const result = await CameraRoll.getPhotos({
        first: 30, // Lấy 30 mục mỗi lần (có thể điều chỉnh)
        // after: cursor, // Dùng cursor từ lần trước
        after: cursor || undefined,
        assetType: 'All', // Lấy cả ảnh và video
      });

      const newPhotos = result.edges;
      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]); // Thêm dữ liệu mới vào cuối
      setCursor(result.page_info.end_cursor ?? null);
      setHasNextPage(result.page_info.has_next_page);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasNextPage, loading]);

  // Tải dữ liệu lần đầu khi component mount
  useEffect(() => {
    fetchPhotos();
  }, []);
  
  
  // Khi chọn media
  const handlerSelectMediaItem = async (item: any) => {
    let mediaUrl = await getRealPath(item.node.image.uri, item.node.type);
    let ext = getFileExtension(mediaUrl);
    if (!ext) {
      if (item.node.type.startsWith("image/")) ext = ".jpg";
      else if (item.node.type.startsWith("video/")) ext = ".mp4";
      else ext = ".file"; // Mặc định nếu không xác định được
    }

    const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const result = {
      id: item.node.id,
      type: item.node.type,
      name: fileName,
      url: mediaUrl,
      playableDuration: item.node.image.playableDuration,
    };
  
    props.handlerSelectMedia(result);
  
    setSelectedItems(prevSelectedItems => {
      const isSelected = prevSelectedItems.some(
        (selected: any) => selected.id === result.id,
      );
      return isSelected
        ? prevSelectedItems.filter(
            (selected: any) => selected.id !== result.id,
          )
        : [...prevSelectedItems, result];
    });
  };
//  console.log(selectedItems)
  const getSelectedIndex = (id: string) => {
    return selectedItems.findIndex((item: any) => item.id === id) + 1;
  };

  return (
    <View style={{flex: 1}}>
      <Text style={{textAlign: 'center', color: 'white', marginVertical: 10}}>
        All Image
      </Text>
      <BottomSheetFlashList
        data={photos}
        extraData={selectedItems}
        keyExtractor={(item, index) => `${item.node.id}-${index}`}
        renderItem={({ item,index }) => {
          const isSelected = selectedItems.some(
            (selected) => selected.id === item.node.id,
          );
          // console.log(selectedItems) 
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
              onPress={() => handlerSelectMediaItem(item)}
            >
              {item.node.type.includes('video') ? (
                <>
                  <Video
                    source={{ uri: item.node.image.uri }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                    }}
                    resizeMode="cover"
                    paused={true}
                    onLoad={(data) => {
                      item.node.image.playableDuration = Math.floor(data.duration);
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
                    }}
                  >
                    
                    {item.node.image.playableDuration
                      ? `${Math.floor(item.node.image.playableDuration / 60)}:${(
                          item.node.image.playableDuration % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : '00:00'}
                  </Text>
                </>
              ) : (
                <Image
                  source={{ uri: item.node.image.uri }}
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
                  }}
                >
                  <Text style={{ color: 'white' }}>{selectedIndex}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        onEndReached={fetchPhotos} // Gọi khi cuộn tới gần cuối
        onEndReachedThreshold={0.1} // Ngưỡng 10% từ cuối danh sách
        numColumns={3}
        estimatedItemSize={width / 3} // Tối ưu hiệu suất FlashList
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
};
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
