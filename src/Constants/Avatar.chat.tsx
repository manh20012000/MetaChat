import React from 'react';
import { Image, View } from 'react-native';

import { useSelector } from 'react-redux';

const AvatarChat = ({ item }:any) => {
    const color = useSelector(
        (value: {colorApp: {value: any}}) => value.colorApp.value,
      );
    return (
                      
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
export default AvatarChat;
