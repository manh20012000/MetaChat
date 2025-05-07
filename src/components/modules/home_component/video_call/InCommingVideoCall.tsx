import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { participants } from '../../../../types/home_type/Converstation_type';

interface Props {
    handleAccept: () => void;
    handleDecline: () => void;
    paticipant: participants[]
    caller: participants
}
const IncommingVideoCall = ({ handleAccept, handleDecline, paticipant }: Props) => {
    // console.log(paticipant[0], paticipant[1])
    return (
        <>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={handleAccept}>
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.declineButton]}
                    onPress={handleDecline}>
                    <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

export default IncommingVideoCall;
const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 40,
        position: 'absolute',
        bottom: 30,
    },
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButton: {
        backgroundColor: 'green',
    },
    declineButton: {
        backgroundColor: 'red',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
