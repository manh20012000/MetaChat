import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageItemAI = ({ message }: { message: { sender: string; text: string } }) => {
    const isMe = message.sender === 'user';
    const user = useSelector((state: any) => state.auth.value);

    return (
        <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
            {/* Nếu là bot thì avatar nằm cuối bên trái */}
            {!isMe && (
                <MaterialCommunityIcons name="robot-dead" size={20} color={'red'} style={styles.icon} />
            )}
            
            {/* Nội dung tin nhắn */}
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{message.text}</Text>
            </View>

            {/* Nếu là user thì avatar nằm cuối bên phải */}
            {isMe && <Image source={{ uri: user.avatar }} style={styles.avatar} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end', // Đưa avatar hoặc icon xuống cuối
        marginVertical: 5,
        marginHorizontal: 10,
    },
    myContainer: {
        justifyContent: 'flex-end',
    },
    otherContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginLeft: 5, // Cách một chút với tin nhắn
        alignSelf: 'flex-end', // Đưa xuống cuối dòng
    },
    icon: {
        marginRight: 5, // Cách một chút với tin nhắn
        alignSelf: 'flex-end', // Đưa xuống cuối dòng
    },
    messageContainer: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
    },
    myMessage: {
        backgroundColor: 'blue',
        
    },
    otherMessage: {
        backgroundColor: 'black',
    },
    messageText: {
        fontSize: 16,
        color: 'white',
    },
});

export default MessageItemAI;
