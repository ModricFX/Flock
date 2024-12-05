import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AppWriteService from '../services/appwriteservice';

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false); // Track if any input is focused
  const appwriteService = new AppWriteService();

  // Validate if the input is an email
  const isEmail = (input: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input);
  };

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Both fields are required.');
      return;
    }

    try {
      console.log('Attempting login with email:', emailOrUsername);

      // Log in using email and password
      const session = await appwriteService.login(emailOrUsername, password);
      console.log('Login successful:', session);
      router.replace("/tabs/home");
      
    } catch (error) {
      console.error('Login failed:', error);
      // @ts-ignore
      Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* FLOCK App Branding */}
      {!isFocused && ( // Only show when not focused on input fields
        <View style={styles.header}>
          <Text style={styles.appName}>FLOCK</Text>
          <Text style={styles.tagline}>A new way to make plans</Text>
        </View>
      )}

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          onFocus={() => setIsFocused(true)} // Set focused to true when the field is clicked
          onBlur={() => setIsFocused(false)} // Set focused to false when the field is blurred
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setIsFocused(true)} // Set focused to true when the field is clicked
          onBlur={() => setIsFocused(false)} // Set focused to false when the field is blurred
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => router.push('/auth/register')}
          >
            Register Now
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  header: {
    position: 'absolute',
    top: 70, // Adjust top position based on your preference
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
  },
  tagline: {
    fontSize: 20,
    textAlign: 'center',
    color: '#666',
  },
  innerContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f7f7f7',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
