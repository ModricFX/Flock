import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    // Container
    container: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        backgroundColor: '#FAFAFA',
        position: 'relative',
    },
    // Screen Title
    screenTitle: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 10,
    },
    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 15,

        // Shadow for Android
        elevation: 2,

        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    // Card Title
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    // Field Group
    fieldGroup: {
        marginBottom: 16,
    },
    // Label
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    // Text Input
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        height: 44,
        paddingHorizontal: 12,
        fontSize: 15,
    },
    // Dropdown
    dropdown: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E3E3E3',
    },
    dropDownContainer: {
        borderColor: '#E3E3E3',
    },
    // Profile Header (Key Changes Here)
    profileHeader: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    // Profile Image
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#ECECEC',
    },

    changePhotoText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    // Primary Button
    primaryButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Danger Zone
    dangerZoneCard: {
        borderColor: '#FFDAD7',
        borderWidth: 1,
        backgroundColor: '#FFF0F0',
    },
    dangerZoneTitle: {
        color: '#E53935',
    },
    dangerZoneText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    dangerButton: {
        backgroundColor: '#E53935',
        borderRadius: 8,
        paddingVertical: 12,
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Logout Button
    logoutButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 5,
    },
    logoutButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#FFF',
        fontWeight: '600',
    },
});

export default styles;