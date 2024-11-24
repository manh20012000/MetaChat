import React from 'react';
import {View, Animated, StyleSheet} from 'react-native';

const Skeleton = ({width, height, borderRadius, status = true}) => {
  const animatedValue = React.useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    if (status) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();

      return () => animation.stop(); // Dừng animation khi component unmount hoặc status thay đổi
    }
  }, [animatedValue, status]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f5f5f5'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: status ? backgroundColor : '#e0e0e0', // Màu tĩnh khi không hoạt động
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 8,
  },
});

export default Skeleton;
