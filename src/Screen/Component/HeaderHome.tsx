import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View, } from 'react-native'
import { UseDispatch, UseSelector, useSelector } from "react-redux";
import { Search } from "../../assets/svg/svgfile";
const HeaderHome: React.FC<{ navigation: any }> = ({ navigation }) => {
    const user = useSelector((state: any) => state.auth.value)

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
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '7',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '8',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }, {
            _id: '9',
            account: 'User 2',
            avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',

        }])
    useEffect(() => {
        // Fetch user data

    }, [user])


    const hedertop = () => {
        return (
            <View style={{ alignSelf: 'center', justifyContent: "center", alignItems: 'center', flex: 1, paddingLeft: '5%', }}>
                < TouchableOpacity style={{ alignItems: 'center', justifyContent: "center", alignSelf: 'center', flex: 0.5 }}>
                    <Image
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 100,
                            backgroundColor: 'gray'
                        }}
                    // source={{ uri: user.avatar }}
                    />
                    <Text style={{ color: color.light }}>{user.account}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', }}>
            <TouchableOpacity style={{
                paddingLeft: '5%',
                alignItems: 'center',

                backgroundColor: color.gray, flexDirection: "row", borderRadius: 30, width: '90%', height: '30%'
            }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', }}>
                    <Search
                        width={30}
                        color='white'
                        stroke={'white'} />
                    <Text style={{ color: color.light, fontSize: 15, fontWeight: "500" }}> Tìm kiếm </Text>
                </View>
                <View style={{ flex: 0.7, }}>

                </View>

            </TouchableOpacity>
            <View style={{ width: '100%', alignContent: 'center', alignItems: 'center', justifyContent: 'center', flex: 0.2 }}>
                <FlatList
                    style={{
                        alignContent: 'center',
                        backgroundColor: 'green'
                    }}
                    ListHeaderComponent={hedertop}
                    horizontal={true}
                    keyExtractor={(item) => item._id}
                    data={user_data}
                    renderItem={({ item }) =>
                        <View style={{ paddingHorizontal: '1%', justifyContent: 'center', alignItems: 'center' }}>

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
                    }
                />

            </View>
        </View>
    )
}
export default HeaderHome;