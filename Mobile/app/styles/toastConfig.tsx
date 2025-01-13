import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export const toastConfig = {
  error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={styles.errorToast}>
      {text1 && <Text style={styles.toastTitle}>{text1}</Text>}
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={styles.successToast}>
      {text1 && <Text style={styles.toastTitle}>{text1}</Text>}
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  errorToast: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  successToast: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  toastMessage: {
    fontSize: 14,
    color: '#fff',
  },
});
