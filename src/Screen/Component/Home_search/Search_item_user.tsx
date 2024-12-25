import React from 'react';
import {  Text, Image, Pressable } from 'react-native'
import { itemuser } from '../../../interface/search_User';
import { useSelector } from 'react-redux';
const SearchItemUser: React.FC<{ item: itemuser }> = ({ item }) => {
    const color = useSelector((state: any) => state.colorApp.value)
    return (
        <Pressable style={({ pressed }) => [
            {
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 10,
                padding: 5,
                marginVertical: 8,
                backgroundColor: pressed ? 'rgb(255, 255, 255)' : color.black,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },

            },
        ]}>
            <Image source={{ uri: item.avatar }} style={{ backgroundColor: color.gray, width: 50, height: 50, borderRadius: 100 }} />
            <Text style={{ marginLeft: '5%', color: color.light, fontSize: 18, fontWeight: 'bold' }}>{item.account}</Text>
        </Pressable>
    )

}
export default SearchItemUser