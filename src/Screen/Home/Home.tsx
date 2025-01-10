import { View, Text, StatusBar, FlatList, Image, TouchableOpacity, Pressable, Dimensions, useWindowDimensions } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HeaderHome from "./homeComponent/HeaderHome";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UseDispatch, useSelector, useDispatch } from "react-redux";
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import Statusbar from "../Component/StatusBar";
import { Pen } from "../../assets/svg/svgfile";
import BottonsheetHome from "./homeComponent/BottomsheetHome";
import Conversation from "../../interface/Converstation";
import { getData } from "../../service/resfull_api";
import { API_ROUTE } from "../../service/api_enpoint";

import { getConversations,createConversation } from "../../cache_data/exportdata.ts/chat_convert_datacache";
export default function Home({ navigation }: { navigation: any }) {
    const { width, height } = useWindowDimensions()
    const [color] = useState(useSelector((state: any) => state.colorApp.value))
    const [user] = useState(useSelector((state: any) => state.auth.value));
   const dispatch = useDispatch();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const isPortrait = height > width;
    const insets = useSafeAreaInsets();
    

    // const conversation: Conversation = {
    //     _id: "123456789",
    //     account: null,
    //     avatar: null,
    //     type: "group",
    //     admin: "admin_id",
    //     color: "#FFFFFF",
    //     background: "#000000",
    //     participants: [
    //         { _id: "user1", account: "Alice", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
    //         { _id: "user2", account: "Bob", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
    //     ],
    //     lastMessage: {
    //         _id: "msg1",
    //         sender: "user1",
    //         name_send: 'user1',
    //         createdAt: new Date(),
    //         content: {
    //             type: "text",
    //             content: "Hello, everyone!"
    //         }
    //     },
    //     read_user: [
    //         { _id: "user1", avatar: "https://example.com/avatar1.png", account: "Alice" },
    //         { _id: "user2", avatar: "https://example.com/avatar2.png", account: "Bob" }
    //     ]
    // };
    // const conversation2: Conversation = {
    //     _id: "123456789",
    //     account: 'example',
    //     avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
    //     type: "group",
    //     admin: "admin_id",
    //     color: "#FFFFFF",
    //     background: "#000000",
    //     participants: [
    //         { _id: "user1", account: "Alice", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
    //         { _id: "user2", account: "Bob", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
    //     ],
    //     lastMessage: {
    //         _id: "msg1",
    //         sender: "user1",
    //         createdAt: new Date(),
    //         name_send: 'user',
    //         content: {
    //             type: "text",
    //             content: "Hello, everyone!"
    //         }
    //     },
    //     read_user: [
    //         { _id: "user1", avatar: "https://example.com/avatar1.png", account: "Alice" },
    //         { _id: "user2", avatar: "https://example.com/avatar2.png", account: "Bob" }
    //     ]
    // };
    const [data_convertstation, setData_convertStation] = useState()
    const [skip,setSkiped]=useState(0)
    const [orientation, setOrientation] = useState(
        Dimensions.get('window').height > Dimensions.get('window').width ? 'portrait' : 'landscape'
    );
    const snapPoints = useMemo(() => ['60%'], []);
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);
    const get_data = async (skip: number) => {
         console.log(API_ROUTE.GET_CONVERTSTATION_CHAT)
        const data_api = await getData(API_ROUTE.GET_CONVERTSTATION_CHAT, null, skip,{dispatch,user})
        console.log(data_api.data)
        setData_convertStation(data_api.data)
        setSkiped(data_api.data.length); 
        if (data_api.data.length > 0) {
           data_api.data.array.forEach(async (element:Conversation) => {
            await createConversation(element)
           });
       }
    }
    useEffect(() => { 
        const getChatuser = async () => {
            try {
                let data_converstation = await getConversations();
                const skip_convert=data_converstation.length
                if (data_converstation) {
                //   await get_data(skip_convert)
                } else {
                    setData_convertStation(data_converstation)
               }
           
            } catch (error: any) {
                console.log(error,'error convert api GET_CONVERTSTATION_CHAT ')
                throw new Error;
                
            }
       }
       getChatuser()
    },[])

    return (
        <BottomSheetModalProvider >
            <View style={{ flex: 1, backgroundColor: color.white, paddingTop: insets.top }}>
                <Statusbar bgrstatus={color.dark} bgrcolor={color.light} />
                <View style={{ flex: 1, backgroundColor: color.dark }}>
                    <View style={{ flex: isPortrait ? 0.1 : 0.4, backgroundColor: color.dark, flexDirection: 'row' }}>
                        <View style={{ flex: isPortrait ? 0.4 : 0.2, padding: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Image
                                style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: color.gray }}
                                source={{ uri: user.avatar }}
                            />
                            <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 25 }}>Chats</Text>
                        </View>
                        <View style={{ flex: isPortrait ? 0.5 : 0.8, }}></View>
                        <View style={{ flex: isPortrait ? 0.2 : 0.1, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: "center", borderRadius: 100, height: 50, width: 50, backgroundColor: color.light }}>
                                <Pen
                                    width={30}
                                    color={'pink'}
                                    stroke={'#ffffff'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                   
                   <FlatList
                          refreshing
                           ListHeaderComponent={<HeaderHome navigation={navigation} />}
                            initialNumToRender={10}
                            data={data_convertstation}
                            // Sử dụng _id làm khóa duy nhất
                            renderItem={({ item }: { item: Conversation }) => (
                                <Pressable
                                    onPress={() => navigation.navigate('ChatScreen', { item })}
                                    onLongPress={handlePresentModalPress}
                                    style={({ pressed }) => [
                                        {
                                            width: '100%',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingLeft: 10,
                                            padding: 5,
                                            marginVertical: 8,
                                            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.black,
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 2 },

                                        },
                                    ]}
                                >
                                    {/* Hiển thị avatar */}
                                    {item.avatar ? (
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 25,
                                                marginRight: 15,
                                                backgroundColor: color.gray,
                                            }}
                                            source={{ uri: item.avatar }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 50,
                                                height: 50,
                                                marginRight: 15,
                                                position: 'relative',
                                                backgroundColor: color.gray
                                                , borderRadius: 100
                                            }}
                                        >
                                            {/* Ảnh thành viên 1 */}
                                            {item.participants[0]?.avatar && (
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
                                                    source={{ uri: item.participants[0].avatar }}
                                                />
                                            )}
                                            {/* Ảnh thành viên 2 */}
                                            {item.participants[1]?.avatar && (
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
                                                    source={{ uri: item.participants[1].avatar }}
                                                />
                                            )}
                                        </View>
                                    )}

                                    {/* Nội dung tin nhắn */}
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{ fontWeight: 'bold', fontSize: 16, color: color.white }}
                                            numberOfLines={1} // Giới hạn chỉ hiển thị 1 dòng
                                            ellipsizeMode="tail" // Hiển thị "..." khi vượt quá kích thước
                                        >
                                            {item.roomName
                                                ? item.roomName // Hiển thị tên nhóm nếu có
                                                : item.participants
                                                    .map((participant) => participant.account)
                                                    .join(', ')} {/* Ghép tên các thành viên */}
                                        </Text>
                                        {/* <Text style={{ fontSize: 14, color: 'gray' }}>
                                            {item.lastMessage[item.lastMessage.length]?.content.content}
                                        </Text> */}
                                    </View>
                                </Pressable>
                            )}

                     />

                </View>
            </View>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                onChange={handleSheetChanges}
                snapPoints={snapPoints}
            >
                <BottomSheetView style={{ flex: 1, backgroundColor: color.gray }}>
                    <View style={{ alignContent: 'center', alignItems: 'center' }}>
                        <BottonsheetHome />
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    );
}
