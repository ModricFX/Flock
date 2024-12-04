import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AppWriteService from '../services/appwriteservice';

export default function Profile() {
  const router = useRouter();
  const appwriteService = new AppWriteService();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateUsername = async () => {
    if (!username) {
      Alert.alert('Error', 'Username is required.');
      return;
    }

    try {
      // TODO: Add logic to update username
      console.log('Updating username:', username);
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      console.error('Username update failed:', error);
      Alert.alert('Error', 'Failed to update username. Please try again.');
    }
  };

  const handleUpdateEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Email is required.');
      return;
    }

    try {
      // TODO: Add logic to update email
      console.log('Updating email:', email);
      Alert.alert('Success', 'Email updated successfully!');
    } catch (error) {
      console.error('Email update failed:', error);
      Alert.alert('Error', 'Failed to update email. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Both current and new passwords are required.');
      return;
    }

    try {
      // TODO: Add logic to change password
      console.log('Changing password:', { currentPassword, newPassword });
      Alert.alert('Success', 'Password updated successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      // Add logic to log out the user
      console.log('Logging out user...');
      await appwriteService.logout();
      router.replace('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      {/* Update Username Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#555"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
          <Text style={styles.buttonText}>Update Username</Text>
        </TouchableOpacity>
      </View>

      {/* Update Email Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
          <Text style={styles.buttonText}>Update Email</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#555"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#555"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    marginTop: 50,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
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
    paddingVertical: 12,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
