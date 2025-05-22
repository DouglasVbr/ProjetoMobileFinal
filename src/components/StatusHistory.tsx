import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

interface StatusHistoryProps {
  history: Array<{
    status: string;
    timestamp: Date;
  }>;
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({history}) => {
  return (
    <ScrollView style={styles.container}>
      {history.map((item, index) => (
        <View key={index} style={styles.historyItem}>
          <Text style={styles.status}>{item.status}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
});