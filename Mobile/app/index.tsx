import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AppwriteService from './services/appwriteservice';
import { useRouter } from 'expo-router';
import { ApiProvider } from './context/ApiContext';

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const appwriteService = new AppwriteService();


    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const user = await appwriteService.getCurrentUser();
                setIsLoggedIn(!!user);
            } catch (error) {
                console.log('Error fetching user xxxxx:', error);
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (!loading) {
            if (isLoggedIn) {
                router.replace("/tabs/home");
            } else {
                router.push('/auth/login'); // Redirect to login page for not-logged-in users
            }
        }
    }, [loading, isLoggedIn]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return null; // No UI needed since redirection happens
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
});
