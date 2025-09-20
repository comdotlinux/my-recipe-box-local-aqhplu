
import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/commonStyles';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius: radius = borderRadius.sm,
  style 
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: colors.surfaceVariant,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function RecipeCardSkeleton({ viewMode = 'list' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <View style={{
        flex: 1,
        margin: spacing.xs,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        elevation: 2,
      }}>
        <SkeletonLoader height={120} borderRadius={0} />
        <View style={{ padding: spacing.md }}>
          <SkeletonLoader height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader height={16} width="60%" style={{ marginBottom: spacing.sm }} />
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <SkeletonLoader height={24} width={60} borderRadius={borderRadius.full} />
            <SkeletonLoader height={24} width={50} borderRadius={borderRadius.full} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.md,
      elevation: 2,
    }}>
      <View style={{ flexDirection: 'row' }}>
        <SkeletonLoader 
          width={80} 
          height={80} 
          borderRadius={borderRadius.lg}
          style={{ marginRight: spacing.md }}
        />
        <View style={{ flex: 1 }}>
          <SkeletonLoader height={20} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader height={16} width="80%" style={{ marginBottom: spacing.xs }} />
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs }}>
            <SkeletonLoader height={12} width={40} />
            <SkeletonLoader height={12} width={50} />
            <SkeletonLoader height={12} width={30} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <SkeletonLoader height={20} width={60} borderRadius={borderRadius.full} />
            <SkeletonLoader height={20} width={50} borderRadius={borderRadius.full} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default SkeletonLoader;
