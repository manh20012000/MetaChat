import React, { useEffect, useRef } from "react";
import { View, Image, Animated, Easing, StyleSheet } from "react-native";

interface TypingIndicatorProps {
  typingUsers: {
    userChat: { _id: string; avatar: string },
    isTyping: boolean
  };
  size?: number;      // Kích thước avatar
  dotSize?: number;   // Kích thước chấm
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  size = 15,
  dotSize = 5,
}) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const animRefs = [dot1, dot2, dot3];

  useEffect(() => {
    if (!typingUsers?.isTyping) return;

    const createBounce = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animRefs.forEach((dot, index) => {
      createBounce(dot, index * 5);
    });

    return () => {
      animRefs.forEach((dot) => dot.stopAnimation());
    };
  }, [typingUsers]);

  if (!typingUsers?.isTyping) return null;

  return (
    <View style={styles.container}>
      <Image
        key={typingUsers.userChat._id}
        source={{ uri: typingUsers.userChat.avatar }}
        style={{
          width: 20,
          height: 20,
          borderRadius: size / 2,
          marginRight: 5,
        }}
      />
      <View
        style={[
          styles.bubble,
          {
            paddingHorizontal: dotSize / 2,
            paddingVertical: dotSize / 3,
            borderRadius: dotSize * 2,
          },
        ]}
      >
        {animRefs.map((anim, index) => (
          <Animated.View
            key={index}
            style={{
              width: 5,
              height: 5,
              marginHorizontal: 2,
              borderRadius: dotSize / 2,
              backgroundColor: "#7D7D7D",
              transform: [{ scale: anim }],
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10
  },
  bubble: {
    flexDirection: "row",
    backgroundColor: "#E5E5EA",
  },
});

export default TypingIndicator;
