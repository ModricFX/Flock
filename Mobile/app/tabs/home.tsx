import { Platform } from 'react-native';
import HomeAndroid from './homeAndroid';
import HomeIOS from './homeIOS';
import realHome from './realHome';

const HomeScreen = Platform.OS === 'ios' ? HomeIOS : HomeAndroid;

export default realHome;
