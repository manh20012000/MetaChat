import React, { useState } from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
} from 'react-native';

interface DraggableVideoViewProps {
  children: React.ReactNode;
}

const DraggableVideoView: React.FC<DraggableVideoViewProps> = ({ children }) => {
  const [position] = useState(new Animated.ValueXY({ x: 250, y: 50 })); 

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: position.x, dy: position.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      position.flattenOffset();
    },
  });

  return (
    <Animated.View
      style={[styles.container, position.getLayout()]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
});

export default DraggableVideoView;
