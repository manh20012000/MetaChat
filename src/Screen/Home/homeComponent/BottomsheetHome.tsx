import react from 'react';
import { Text, View, Pressable, useWindowDimensions } from 'react-native';
import { color } from '../../../assets/color/color';

const BottonsheetHome = () => {
    const { width, height } = useWindowDimensions()
    const isPortrait = height > width
    return (
        <>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                  
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Archive
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                 
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Mute
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                   
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Create Group chat with
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
               
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Open chat head
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                    
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Mark un read
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                   
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Retrict
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                   
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Block
                </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                {
                    width: '100%',
                    height: 60,
                    backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
                    paddingLeft: '2%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }


            ]}>

                <Text style={{ color: color.white, fontWeight: 'bold', fontSize: 18 }}>
                    Delete
                </Text>
            </Pressable>
        </>
    )
}
export default BottonsheetHome