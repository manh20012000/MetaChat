import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { UseDispatch, UseSelector, useSelector } from "react-redux";
import { Search } from "../../../assets/svg/svgfile";
const HeaderHome: React.FC<{ navigation: any }> = ({ navigation }) => {
    const user = useSelector((state: any) => state.auth.value)
    const { width, height } = useWindowDimensions()

    const isPortrait = height > width
    const color = useSelector((state: any) => state.colorApp.value)
    const [user_data, setUser_Data] = useState([
        {
            _id: '1',
            account: 'User 1',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '2',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '3',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '4',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '5',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '6',
            account: 'User 6',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '7',
            account: 'User 7',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '8',
            account: 'User 8',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '9',
            account: 'User 9',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }])
    useEffect(() => {
        // Fetch user data

    }, [user])


    const HeaderTop_Chat = () => {
        return (
            <View style={{ alignSelf: 'center', justifyContent: "center", alignItems: 'center', flex: 1, paddingLeft: '5%', }}>
                <Pressable style={{ alignItems: 'center', justifyContent: "center", alignSelf: 'center', flex: 0.5 }}>
                    <Image
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 100,
                            backgroundColor: color.gray
                        }}
                        source={{ uri: user.avatar }}
                    />
                    <Text style={{ color: color.light }}>{user.account}</Text>
                </Pressable>
            </View>
        )
    }
    return (

        <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', }}>
            <Pressable onPress={() => { navigation.navigate('SearchScreen') }}
                style={{

                    paddingLeft: '5%',
                    alignItems: 'center',
                    backgroundColor: color.gray, flexDirection: "row", borderRadius: 30, width: '90%', height: '30%'
                }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', }}>
                    <Search
                        width={30}
                        color={'pink'}
                        stroke={'white'}
                    />
                    <Text style={{ color: color.light, fontSize: 15, fontWeight: "500" }}> Tìm kiếm </Text>
                </View>
            </Pressable>
            <View style={{ width: '100%', }}>
                <FlatList
                    style={{

                    }}
                    // contentContainerStyle={{
                    //     flexGrow: 1,

                    // }}
                    ListHeaderComponent={HeaderTop_Chat}
                    horizontal={true}
                    keyExtractor={(item) => item._id}
                    data={user_data}
                    showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang
                    renderItem={({ item }) => {
                        return (
                            <View style={{ paddingHorizontal: '1%', justifyContent: 'center', alignItems: 'center', }}>

                                < TouchableOpacity style={{

                                }}>
                                    <Image
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 100,
                                            backgroundColor: 'gray',

                                        }}
                                        source={{ uri: item.avatar }}
                                    />
                                    <Text style={{ color: color.white, alignSelf: 'center' }}>{item.account}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                />

            </View>
        </View>

    )
}
export default HeaderHome;