import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import AppwriteService from '../services/appwriteservice';
import { useRouter } from 'expo-router';
import { Models } from 'appwrite'; // Import Models namespace

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Models.User<{}> | null>(null); // Use Appwrite's User type
    const router = useRouter();
    const appwriteService = new AppwriteService();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await appwriteService.getCurrentUser();
                setUser(currentUser); // Set the user with Appwrite's type
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/auth/login'); // Redirect to login on error
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await appwriteService.logout();
            router.push('/auth/login'); // Redirect to login after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>
                Hi {user?.name || 'User'}!
            </Text>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
