/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TextInput, Text, View, TextInputProps} from 'react-native';
import {globalStyles} from '../styles/globalStyles';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <View style={{marginBottom: 16}}>
      <Text style={globalStyles.label}>{label}</Text>
      <TextInput
        style={[globalStyles.input, error && {borderColor: '#FF3B30'}]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={globalStyles.errorText}>{error}</Text>}
    </View>
  );
};
