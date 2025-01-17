import { View, Text, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import React from "react";
import { Backsvg } from "../../assets/svg/svgfile";
import { useSelector, } from "react-redux";
import Conversation from "../../interface/Converstation.interface";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const ChatScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const color = useSelector((status: any) => status.colorApp.value)
    const user = useSelector((status: any) => status.auth.value)
    const { width, height } = useWindowDimensions()
    const isPortrait = height > width
    const insert = useSafeAreaInsets()
    const { item } = route.params

    return (
        <View style={{ flex: 1, backgroundColor: color.dark, paddingTop: insert.top }}>
            <View style={{ flex: 0.07, backgroundColor: color.white, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-around' }}>
                    <TouchableOpacity style={{ alignSelf: 'center' }}
                        onPress={() => {
                         
                            navigation.goBack()
                        }}
                    >
                        <Backsvg width={25} height={25} fill={color.white} stroke={color.white} />
                    </TouchableOpacity>
                    <Image
                        style={{ width: 60, height: 60, borderRadius: 100, backgroundColor: color.gray }}
                        source={{ uri: item.avatar }}
                    />
                    <Text style={{ color: color.dark }}>{item.groupname}</Text>
                </View>
                <View>
                </View>
            </View>
            <Text>Chat Screen</Text>
        </View>
    );
}
export default ChatScreen