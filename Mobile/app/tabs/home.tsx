import { Platform } from 'react-native';
import HomeAndroid from './homeAndroid';
import HomeIOS from './homeIOS';

const HomeScreen = Platform.OS === 'ios' ? HomeIOS : HomeAndroid;

export default HomeScreen;
