import React, { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native'
import { itemuser } from '../../../interface/search_User';
import { useSelector } from 'react-redux';  
const SearchItemUser: React.FC<{ item: itemuser,navigation:any }> = ({ item,navigation }) => {
    const color = useSelector((state: any) => state.colorApp.value)

    return (
        <Pressable
            onPress={() => {
                navigation.navigate('HomeChatPersion', { item: item });
            }}
            style={({ pressed }) => [
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
            {item.statusUser && <View style={{
                backgroundColor: "green", width: 15, height: 15, borderRadius: 100,
                position: 'absolute',
                zIndex: 1,
                bottom: 5,
                left: '12%',
            }}>
            </View>}
            <Image source={{ uri: item.avatar }} style={{ backgroundColor: color.gray, width: 50, height: 50, borderRadius: 100 }} />
            <Text style={{ marginLeft: '5%', color: color.light, fontSize: 18, fontWeight: 'bold' }}>{item.account}</Text>
        </Pressable>
    )

}
export default SearchItemUser