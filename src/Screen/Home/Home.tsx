import { View, Text } from "react-native";
import React from 'react'
import { color } from "../../assets/color/color";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function Home() {
    const insets = useSafeAreaInsets();
    return (
        <View style={{ flex: 1, backgroundColor: color.white, paddingTop: insets.top }}>
            <Text style={{ color: 'white' }}>Home</Text>
        </View>
    );
}
