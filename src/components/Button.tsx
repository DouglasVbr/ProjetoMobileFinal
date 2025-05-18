/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {globalStyles} from '../styles/globalStyles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return '#E5E5EA';
      case 'danger':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const getTextColor = () => {
    return variant === 'secondary' ? '#000' : '#fff';
  };

  return (
    <TouchableOpacity
      style={[
        globalStyles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[globalStyles.buttonText, {color: getTextColor()}]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
