import React, { useEffect, useRef } from "react";
import { View, Image, Text, Animated, Easing } from "react-native";

interface TypingIndicatorProps {
  typingUsers: {
    userChat: { _id: string; avatar: string },
    isTyping:boolean
  };
  size?: number;
  dotSize?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  size = 25,
  dotSize = 14,
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const animRefs = [dot1, dot2, dot3];

  useEffect(() => {
    if (!typingUsers) return;

    const startAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animRefs.forEach((dot, index) => {
      setTimeout(() => startAnimation(dot, index * 150), index * 150);
    });

    return () => {
      animRefs.forEach((dot) => dot.setValue(0)); // Reset animation khi unmount
    };
  }, [typingUsers]);

  if (!typingUsers) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 5,}}>
      {/* Avatar */}
      <Image
        key={typingUsers.userChat._id}
        source={{ uri: typingUsers.userChat.avatar }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          marginRight: 5,
        }}
      />

      {/* Hiệu ứng typing */}
      <View style={{ flexDirection: "row", alignItems: "center" ,backgroundColor:'gray',borderWidth:1,borderRadius:20}}>
        {animRefs.map((dot, index) => (
          <Animated.View key={index} style={{ opacity: dot, marginRight: 3 }}>
            <Text style={{ fontSize: dotSize,fontWeight:'bold'}}>•</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default TypingIndicator;
