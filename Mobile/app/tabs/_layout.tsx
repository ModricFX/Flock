import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from '@expo/vector-icons';
import Home from './home';
import Notifications from './notifications';
import Profile from './profile';
import Friends from './friends';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type TabParamList = {
    Home: undefined;
    Notifications: undefined;
    Friends: undefined;
    Profile: undefined;
};


const Tab = createBottomTabNavigator();

export default function TabsLayout() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={Notifications}
                options={{
                    title: "Notifications",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="bell" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Friends"
                component={Friends}
                options={{
                    title: "Friends",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="users" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: "You",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="user" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}