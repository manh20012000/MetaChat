import React, { useEffect, useState } from "react";
import { View, Text, useWindowDimensions, TouchableOpacity, ActivityIndicator, Platform, FlatList, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Statusbar from "../StatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";
import { Backsvg, Send, WhiteBack } from "../../../assets/svg/svgfile";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { postData, getResearch } from "../../../service/resfull_api";
import User_interface from "../../../interface/user.Interface";
import { API_ROUTE } from "../../../service/api_enpoint";
import { clearUserSearch, create_userSearch, get_userSearch } from "../../../cache_data/exportdata.ts/userSearch_data";
import { User_search } from "../../../interface/search_User";
import Skeleton from "../Skeleton";
import { itemuser } from "../../../interface/search_User";
import SearchItemUser from "./Search_item_user";
const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const color = useSelector((state: any) => state.colorApp.value)
    const user_Status = useSelector((state: any) => state.statusUser.value)
    const { width, height } = useWindowDimensions()
    const isPortrait = height > width
    const insets = useSafeAreaInsets();
    const [keywordSearch, setSearchKey_word] = useState('')
    const [userSearch, setUserSearch] = useState<User_search[]>([])
    const [animatedload, setAnimatedload] = useState(false)
    const user: User_interface = useSelector(((state: any) => state.colorApp.value))

    const handler_getuser_search_localdata = async () => {
        try {
            const data = await get_userSearch();
         
            if (data) {
                const formattedData: User_search[] = data.map((item: any) => ({
                    _id: item._id,
                    account: item.account,
                    avatar: item.avatar,
                }));

                setUserSearch(formattedData);
            } else {
                setUserSearch([]);
            }


        } catch (error) {
            console.log(error, 'hhah');
            throw error;
        }
    }
    useEffect(() => {
        handler_getuser_search_localdata();
    }, [])
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {

            if (userSearch.length > 0) {

                clearUserSearch()
                create_userSearch(userSearch); // Lưu kết quả tìm kiếm vào Realm
            }
        });

        return unsubscribe; // Cleanup listener khi component bị unmount
    }, [navigation, userSearch]);
    const handlerSearchData = async (keysearch: string) => {
        try {
            setAnimatedload(true)
            if (keysearch) {
                // const filteredData = userSearch.filter((user: User_search) =>
                //     user.name.toLowerCase().includes(keysearch.toLowerCase())
                // );
                // setUserSearch(filteredData)
                let data = null;
                // setTimeout(async () => {
                data = await getResearch(API_ROUTE.GET_USER_BY_SEARCH, keysearch);
                console.log(data.data, 'sf')
                setUserSearch(data.data);
                // }, 500)
            } else {
                handler_getuser_search_localdata()
            }
            setAnimatedload(false)
        } catch (error) {
            console.log(error, 'hhah11');
            setAnimatedload(false)
            throw error;

        }

    }
    return (
        // <KeyboardAwareScrollView

        //     contentContainerStyle={{ width: width, height: height, backgroundColor: color.dark, }}
        // >


        <View style={{ width: width, height: height, backgroundColor: color.dark }}>
            <Statusbar bgrstatus="transparent" bgrcolor={color.light} />
            <View style={{ backgroundColor: color.dark, flex: 1, paddingTop: insets.top, }}>
                <View style={{ paddingHorizontal: '2%', backgroundColor: color.dark, width: '100%', height: isPortrait ? '10%' : '20%', flexDirection: 'row', justifyContent: "space-between", alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        navigation.goBack();
                    }}>
                        {color.dark == 'black' ? <WhiteBack color={'#fff'}
                            stroke={'#ffffff'}
                            fill={'#000000'} /> : <Backsvg
                            color={'#ffffff'}
                            stroke={'#ffffff'}
                            fill={'#000000'}
                        />}
                    </TouchableOpacity>
                    <TextInput
                        value={keywordSearch}
                        onChangeText={(e) => {
                            setSearchKey_word(e);
                            handlerSearchData(e)
                        }}
                        style={{ paddingHorizontal: '4%', width: '80%', height: 50, backgroundColor: color.gray, borderRadius: 20 }}
                        placeholder="Nhập bạn bè tìm kiếm "
                    >
                    </TextInput>
                    <TouchableOpacity

                        style={{ justifyContent: "center" }}>
                        <Send
                            stroke={'#0033FF'}
                            fill={'#0033FF'} />
                    </TouchableOpacity>
                </View>
                <View style={{ backgroundColor: color.dark, height: '95%', width: '100%' }}>
                    {animatedload && <ActivityIndicator size="large" color="blue" animating={animatedload} />}
                    <FlatList
                        data={userSearch}
                        keyExtractor={(item: any) => item._id}
                        renderItem={({ item, index }) => {
                            const statusUser = user_Status.includes(item._id);
                            return (
                            <SearchItemUser item={{ ...item,statusUser }} navigation={navigation} /> // Ensure item structure is correct
                            )
                        }}
                    />
                </View>
            </View>

        </View>
        // </KeyboardAwareScrollView>
    )
}
export default SearchScreen