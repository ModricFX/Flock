import React, {useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { authService } from '../services/authservice';


/* IMPORT STYLES */

import styles from '../styles/ProfilePageStyles';


export default function Profile() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getUserData();
        setUsername(userData.data.username);
        setEmail(userData.data.email);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        Alert.alert('Error', 'Failed to fetch user data. Please try again.');
      }
    };

    fetchUserData();
  }, []);

  // Dropdown states for Language
  const [openLang, setOpenLang] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default: English
  const [languageItems, setLanguageItems] = useState([
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
  ]);

  // Dropdown states for Theme
  const [openTheme, setOpenTheme] = useState(false);
  const [theme, setTheme] = useState('light'); // Default: Light
  const [themeItems, setThemeItems] = useState([
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ]);

  // -- Update Profile Info (Username, Email) --
  const handleSaveProfileInfo = async () => {
    if (!username && !email) {
      Alert.alert('Error', 'Please fill out at least one field (username or email).');
      return;
    }
    try {
      await authService.updateProfile(username, email);
      Alert.alert('Success', 'Profile information updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  // -- Change Password --
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Both current and new passwords are required.');
      return;
    }
    try {
      console.log('Changing password:', { currentPassword, newPassword });
      await authService.updatePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };

  // -- Logout --
  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await authService.logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // -- Delete Account --
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account?',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting user account...');
              authService.deleteAccount();
              // call your service or function
              Alert.alert('Success', 'Your account has been deleted.');
              router.replace('/auth/login');
            } catch (error) {
              console.error('Account deletion failed:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  // -- Pick or Change Profile Image --
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // Correct value is lowercase 'images'
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };



  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true} // Allows dropdown scrolling
    >
      {/* Screen Title */}
      <Text style={styles.screenTitle}>Profile Settings</Text>

      {/* Profile Image Card */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../../assets/images/default_profile.png')
              }
              style={styles.profileImage}
            />
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfileInfo}>
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Security Settings Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            placeholderTextColor="#888"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#888"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
          <Text style={styles.primaryButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Appearance Settings Card */}
      <View style={[styles.card, { zIndex: 9999, position: 'relative' }]}>
        <Text style={styles.cardTitle}>Appearance</Text>

        {/* LANGUAGE DROPDOWN
        <View style={[styles.fieldGroup, { zIndex: 9999 }]}>
          <Text style={styles.label}>Language</Text>
          <DropDownPicker
            open={openLang}
            value={selectedLanguage}
            items={languageItems}
            setOpen={setOpenLang}
            setValue={setSelectedLanguage}
            setItems={setLanguageItems}
            placeholder="Select a language"
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            zIndex={9999}
            zIndexInverse={4000}
          />
        </View> */}

        {/* THEME DROPDOWN */}
        <View style={[styles.fieldGroup, { zIndex: 9998 }]}>
          <Text style={styles.label}>Theme</Text>
          <DropDownPicker
            open={openTheme}
            value={theme}
            items={themeItems}
            setOpen={setOpenTheme}
            setValue={setTheme}
            setItems={setThemeItems}
            placeholder="Select a theme"
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            zIndex={9999}
            zIndexInverse={4000}
          />
        </View>
      </View>

      {/* Danger Zone Card (lower zIndex) */}
      <View style={[styles.card, styles.dangerZoneCard, { zIndex: 1 }]}>
        <Text style={[styles.cardTitle, styles.dangerZoneTitle]}>Danger Zone</Text>
        <Text style={styles.dangerZoneText}>
          Deleting your account is permanent. All data will be lost.
        </Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Spacing at the bottom */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}