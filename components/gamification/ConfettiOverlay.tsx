import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = ['#FF5DA3', '#FF9D5C', '#FFD166', '#4CAF50', '#4DA6FF', '#C42B76'];
const PIECE_COUNT = 26;

type Piece = {
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotateStart: number;
  drift: number;
};

/**
 * Prikazuje kratku eksploziju konfeta preko cele trake (overlay), pa se sama
 * "gasi" — ne prima nikakve props osim `active`, koja pokreće novi krug
 * animacije svaki put kad postane true (npr. kad modal postane vidljiv).
 */
export function ConfettiOverlay({ active }: { active: boolean }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }).map(() => ({
        x: Math.random() * SCREEN_WIDTH,
        size: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 200,
        duration: 1400 + Math.random() * 900,
        rotateStart: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
      })),
    [active] // eslint-disable-line react-hooks/exhaustive-deps -- namerno: nov set parčića na svaki 'active' okidač
  );

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, index) => (
        <ConfettiPiece key={index} piece={piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [piece]); // eslint-disable-line react-hooks/exhaustive-deps

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 640],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, piece.drift],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${piece.rotateStart}deg`, `${piece.rotateStart + 540}deg`],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: piece.x,
        top: 0,
        width: piece.size,
        height: piece.size * 1.6,
        backgroundColor: piece.color,
        borderRadius: 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}