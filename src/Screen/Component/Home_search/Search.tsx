import React, { useState } from "react";
import { View, Text, useWindowDimensions, TouchableOpacity, KeyboardAvoidingView, Platform, } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Statusbar from "../StatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";
import { Backsvg, Send, WhiteBack } from "../../../assets/svg/svgfile";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { postData, getResearch } from "../../../service/resfull_api";
import User_interface from "../../../interface/user.Interface";
import { API_ROUTE } from "../../../service/api_enpoint";


const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const color = useSelector((state: any) => state.colorApp.value)
    const { width, height } = useWindowDimensions()
    const isPortrait = height > width
    const insets = useSafeAreaInsets();
    const [keywordSearch, setSearchKey_word] = useState('')
    const [userSearch, setUserSearch] = useState<{}[]>([])
    const user: User_interface = useSelector(((state: any) => state.colorApp.value))
    const handlerSearchData = async (keysearch: string) => {
        try {
             let data=null;
             
            setTimeout(async () => {

              data = await getResearch(API_ROUTE.GET_USER_BY_SEARCH, keysearch);
                setUserSearch(data);
            }, 1000)

        } catch (error) {
            console.log(error, 'hhah');
            throw error;
        }

    }
    return (
        // <KeyboardAwareScrollView

        //     contentContainerStyle={{ width: width, height: height, backgroundColor: color.dark, }}
        // >


        <View style={{ width: width, height: height, backgroundColor: color.dark }}>
            <Statusbar bgrstatus="transparent" bgrcolor={color.dark} />
            <View style={{ backgroundColor: color.white, flex: 1, paddingTop: insets.top, }}>
                <View style={{ paddingHorizontal: '2%', backgroundColor: color.white, width: '100%', height: isPortrait ? '10%' : '20%', flexDirection: 'row', justifyContent: "space-between", alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {

                        navigation.goBack();
                    }}>
                        {color.dark == 'white' ? <WhiteBack color={'#ffffff'}
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
            </View>
        </View>
        // </KeyboardAwareScrollView>
    )
}
export default SearchScreen