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
} from 'react-native';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useHomeLogic} from './useHome/use-home.tsx';
import HeaderHome from '../../Screen/Home/homeComponent/HeaderHome.tsx';
import Statusbar from '../../Constants/StatusBar.tsx';
import BottonsheetHome from '../../Screen/Home/homeComponent/BottomsheetHome.tsx';
import dayjs from 'dayjs';
import Conversation from '../../type/Home/Converstation_type.ts';
export const HomeView = ({navigation}: {navigation: any}) => {
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
    selectConverstion,
    setModalVisible,
    snapPoints,
    modalVisible,
    handleDelete,
    handlerShowmodal,
    handlePresentModalPress,
    handleSheetChanges,
  } = useHomeLogic(navigation);

  return (
    <BottomSheetModalProvider>
      <View style={{flex: 1, backgroundColor: color.white}}>
        <Statusbar
          bgrstatus={color.dark}
          bgrcolor={color.light}
          translucent={true}
        />
        {onloading === true ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <View style={{flex: 1, backgroundColor: color.dark}}>
            <FlatList
              refreshing
              ListHeaderComponent={
                <HeaderHome navigation={navigation} data_friend={data_friend} />
              }
              keyExtractor={(item, index) => item._id}
              initialNumToRender={10}
              data={data_convertstation}
                renderItem={({ item }: { item: Conversation }) => {
                  
                const statusUser: boolean = item.participantIds.some(
                  (participantIds: string) => {
                    if (participantIds !== user._id) {
                      return user_Status.includes(participantIds);
                    }
                  },
                );
                return (
                  <Pressable
                    onPress={() => {
                      if (item.participantIds.length <= 2) {
                        const recipientIds = item.participantIds.filter(
                          (id: string) => id !== user._id,
                        );
                        socket?.emit('invite_to_room', {
                          conversationId: item._id,
                          recipientIds: recipientIds,
                        });
                      }
                      navigation.navigate('HomeChatPersion', {
                        conversation: item,
                      });
                    }}
                    onLongPress={() => handlePresentModalPress(item)}
                    style={({pressed}) => [
                      {
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                        padding: 5,
                        marginVertical: 8,
                        backgroundColor: pressed
                          ? 'rgb(210, 230, 255)'
                          : color.black,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                      },
                    ]}>
                    {statusUser && (
                      <View
                        style={{
                          backgroundColor: 'green',
                          width: 15,
                          height: 15,
                          borderRadius: 100,
                          position: 'absolute',
                          zIndex: 1,
                          bottom: 5,
                          left: '12%',
                        }}></View>
                    )}
                    {item.avatar ? (
                      <Image
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          marginRight: 15,
                          backgroundColor: color.gray,
                        }}
                        source={{uri: item.avatar}}
                      />
                    ) : (
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          marginRight: 15,
                          position: 'relative',
                          backgroundColor: color.gray,
                          borderRadius: 100,
                        }}>
                        {(() => {
                          const filteredParticipants: any =
                            item.participants.filter(
                              (participant: any) =>
                                participant.user_id !== user._id,
                            );
                          const count = filteredParticipants.length;
                          if (count === 1) {
                            return (
                              <Image
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 25,
                                  backgroundColor: color.gray,
                                }}
                                source={{
                                  uri: filteredParticipants[0].avatar,
                                }}
                              />
                            );
                          } else if (count === 2) {
                            return (
                              <>
                                <Image
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    borderWidth: 2,
                                    borderColor: 'white',
                                    backgroundColor: color.gray,
                                  }}
                                  source={{
                                    uri: filteredParticipants[0]?.avatar,
                                  }}
                                />
                                <Image
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    borderWidth: 2,
                                    borderColor: 'white',
                                    backgroundColor: color.gray,
                                  }}
                                  source={{
                                    uri: filteredParticipants[1]?.avatar,
                                  }}
                                />
                              </>
                            );
                          } else {
                            return filteredParticipants
                              .slice(0, 4)
                              .map((participant: any, index: number) => {
                                const positions = [
                                  {top: 0, left: 0},
                                  {top: 0, right: 0},
                                  {bottom: 0, left: 0},
                                  {bottom: 0, right: 0},
                                ];
                                return (
                                  <Image
                                    key={participant._id}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: 10,
                                      position: 'absolute',
                                      ...positions[index],
                                      borderWidth: 1,
                                      borderColor: 'white',
                                      backgroundColor: color.gray,
                                    }}
                                    source={{uri: participant.avatar}}
                                  />
                                );
                              });
                          }
                        })()}
                      </View>
                    )}
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: color.white,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.roomName
                          ? item.roomName
                          : item.participants
                              .filter(
                                (participant: any) =>
                                  participant.name !== user.name,
                              )
                              .map((participant: any) => participant.name)
                              .filter((name: string) => !!name)
                              .join(', ')}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '80%',
                          gap: 10,
                        }}>
                        <Text
                          ellipsizeMode="tail"
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: color.white,
                            width: 100,
                          }}>
                          {item.messages[0].user.user_id === user._id?"You ":item.messages[0].user.name}:{" "}
                          {item.messages[0]?.text ||
                            'Bắt đầu cuộc thoại'}
                        </Text>
                        <Text ellipsizeMode="tail" numberOfLines={1}>
                          {dayjs(
                            item.messages[0]?.createdAt,
                          ).from(new Date())}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        )}
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        enableContentPanningGesture={false}
        snapPoints={snapPoints}>
        <BottomSheetView style={{flex: 1, backgroundColor: color.gray}}>
          <View style={{alignContent: 'center', alignItems: 'center'}}>
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
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Ionicons name="alert-circle-outline" size={40} color="red" />
            <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10}}>
              Xác nhận xóa?
            </Text>
            <Text style={{marginTop: 10, textAlign: 'center'}}>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?
            </Text>
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Pressable
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: 'gray',
                  marginRight: 10,
                }}
                onPress={() => setModalVisible(false)}>
                <Text style={{color: 'white'}}>Hủy</Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: 'red',
                }}
                onPress={handleDelete}>
                <Text style={{color: 'white'}}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </BottomSheetModalProvider>
  );
};
