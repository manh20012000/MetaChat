import { View, Text, StatusBar, FlatList, Image, TouchableOpacity } from "react-native";
import React, { useState } from 'react'
import HeaderHome from "../Component/HeaderHome";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UseDispatch, useSelector, useDispatch } from "react-redux";

import { Pen } from "../../assets/svg/svgfile";
export default function Home() {
    const [color] = useState(useSelector((state: any) => state.colorApp.value))
    const [user] = useState(useSelector((state: any) => state.auth.value));

    const insets = useSafeAreaInsets();
    const [data, setData] = useState([{
        key: '1',
        name: 'User 1',
        avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
        message: 'Hello, how are you?'

    }, {
        key: '2',
        name: 'User 2',
        avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
        message: 'I am fine, thank you!'
    }])
    return (
        <View style={{ flex: 1, backgroundColor: color.white, paddingTop: insets.top }}>
            <StatusBar
                animated={true}
                barStyle={color.light === "black" ? 'dark-content' : 'light-content'}
                backgroundColor={color.dark}
            />

            <View style={{ flex: 1, backgroundColor: color.dark }}>
                <View style={{ flex: 0.1, backgroundColor: color.dark, flexDirection: 'row' }}>
                    <View style={{ flex: 0.4, padding: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Image
                            style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: color.gray }}
                            source={{ uri: user.avatar }}
                        />
                        <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 25 }}>Chats</Text>
                    </View>
                    <View style={{ flex: 0.5, }}></View>
                    <View style={{ flex: 0.2, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: "center", borderRadius: 100, height: '50%', width: "50%", backgroundColor: color.light }}>
                            <Pen
                                width={30}
                                color={'pink'}
                                stroke={'white'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <FlatList
                        style={{ flex: 1, backgroundColor: color.dark }}
                        ListHeaderComponent={HeaderHome}
                        data={data}
                        renderItem={({ item }) =>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 10,
                                    marginVertical: 8, // Khoảng cách giữa các item
                                    marginHorizontal: 15, // Lề hai bên
                                    backgroundColor: 'white',
                                    borderRadius: 10, // Bo góc cho item
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 4 // Đổ bóng trên Android
                                }}
                            >
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        marginRight: 15, // Khoảng cách giữa avatar và text
                                        backgroundColor: color.gray
                                    }}
                                    source={{ uri: item.avatar }}
                                />
                                <View>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                                    <Text style={{ color: color.gray }}>{item.message}</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>

            </View>
        </View>
    );
}
