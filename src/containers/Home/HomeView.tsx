import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useHomeLogic } from './use_home/use-home.tsx';
import HeaderHome from '../../components/commons/home_components/HeaderHome.tsx';
import Statusbar from '../../components/commons/share_components/StatusBar.tsx';
import BottonsheetHome from '../../components/commons/home_components/BottomsheetHome.tsx';
import dayjs from 'dayjs';
import Conversation from '../../types/home_type/Converstation_type.ts';
import MessageItem from '../../components/modules/home_component/converstation/ItemConversation.tsx';

export const HomeView = ({ navigation }: { navigation: any }) => {

  const {
    color,
    user,
    user_Status,
    bottomSheetModalRef,
    isPortrait,
    insets,
    socket,
    data_convertstation,
    onloading,
    data_friend,
    setModalVisible,
    snapPoints,
    modalVisible,
    handleDeleteConverStation,
    handlerShowmodal,
    handlePresentModalPress,
    handleSheetChanges, onRefresh, refreshing,
    typingUsers
  } = useHomeLogic(navigation);

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1, backgroundColor: color.dark }}>
        <Statusbar
          bgrstatus={color.dark}
          bgrcolor={color.light}
          translucent={true}
        />
        {onloading === true ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <View style={{ flex: 1, backgroundColor: color.dark }}>
            <FlatList
              refreshing
              ListHeaderComponent={
                <HeaderHome navigation={navigation} data_friend={data_friend} />
              }
              keyExtractor={(item, index) => item._id}
              initialNumToRender={10}
              data={data_convertstation}
              renderItem={({ item }) => (
                <MessageItem
                  key={item._id}
                  typingUsers={typingUsers}
                  user_Status={user_Status}
                  item={item}
                  user={user}
                  color={color}
                  navigation={navigation}
                  socket={socket}
                  handlePresentModalPress={handlePresentModalPress}
                />
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        )}
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        enableContentPanningGesture={false}
        snapPoints={snapPoints}>
        <BottomSheetView style={{ flex: 1, backgroundColor: color.gray }}>
          <View style={{ alignContent: 'center', alignItems: 'center' }}>
            <BottonsheetHome
              handlerShowmodal={handlerShowmodal}
              bottomSheetModalRef={bottomSheetModalRef}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View
            style={{
              width: '80%',
              backgroundColor: color.gray,
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Ionicons name="alert-circle-outline" size={40} color="red" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
              Xác nhận xóa?
            </Text>
            <Text
              style={{
                marginTop: 10,
                textAlign: 'center',
                color: color.white,
                fontWeight: 'bold',
              }}>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: 'gray',
                  marginRight: 10,
                }}
                onPress={() => setModalVisible(false)}>
                <Text style={{ color: 'white' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: 'red',
                }}
                onPress={handleDeleteConverStation}>
                <Text style={{ color: 'white' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </BottomSheetModalProvider>
  );
};
