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
import AppwriteService from '../services/appwriteservice';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false); // Track focus on input fields
  
    const appwriteService = new AppwriteService();

  const handleRegister = async () => {
    if (
        !name ||
        !surname ||
        !username ||
        !email ||
        !password ||
        !confirmPassword
    ) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', "Passwords don't match.");
      return;
    }

    try {
      await appwriteService.register(email, password, name, username);
      Alert.alert(
          'Success',
          `Account created for ${name} ${surname} with username "${username}".`
      );
      router.push('/auth/login');
    } catch (error) {
      // @ts-ignore
      Alert.alert('Registration Error', error.message || 'An error occurred during registration.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* FLOCK App Branding */}
      {!isFocused && ( // Only show FLOCK branding if no input is focused
        <View style={styles.header}>
          <Text style={styles.appName}>FLOCK</Text>
          <Text style={styles.tagline}>A new way to make plans</Text>
        </View>
      )}

      {/* Form Container */}
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Create an Account</Text>

        {/* Name and Surname in a Row */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
            onFocus={() => setIsFocused(true)} // Set focused to true when field is clicked
            onBlur={() => setIsFocused(false)} // Set focused to false when field is blurred
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Surname"
            value={surname}
            onChangeText={setSurname}
            placeholderTextColor="#aaa"
            onFocus={() => setIsFocused(true)} // Set focused to true when field is clicked
            onBlur={() => setIsFocused(false)} // Set focused to false when field is blurred
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#aaa"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#aaa"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Register Button */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Footer Link */}
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/auth/login')}>
            Login here
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
    top: 70, // Position 10px from the top
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%', // Half width for input fields in a row
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
