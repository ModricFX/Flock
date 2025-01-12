import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const toastConfig = {
    error: ({ text1, text2 }) => (
        <View style={styles.toastContainer}>
            <Text style={styles.toastTitle}>{text1}</Text>
            <Text style={styles.toastMessage}>{text2}</Text>
        </View>
    ),
    success: ({ text1, text2 }) => (
        <View style={[styles.toastContainer, { backgroundColor: '#28a745' }]}>
            <Text style={styles.toastTitle}>{text1}</Text>
            <Text style={styles.toastMessage}>{text2}</Text>
        </View>
    ),
};

const styles = StyleSheet.create({
    toastContainer: {
        width: '90%',
        padding: 15,
        backgroundColor: '#d9534f',
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    toastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    toastMessage: {
        fontSize: 16,
        color: 'white',
    },
});

export default toastConfig;
