import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    // Header
    header: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 10,
    },
    // Scroll Content
    scrollContent: {
        padding: 16,
    },
    // Friend Card
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,

        // Shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow (Android)
        elevation: 2,
    },
    friendPfp: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    flatList: {
        flex: 1, // Make FlatList fill the available space
    },
    flatListContent: {
        flexGrow: 1, // Allow content to grow and fill the FlatList
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    // Separator between items
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginLeft: 80, // Align separator with the text content
    },
    friendInfo: {
        flex: 1,
    },
    friendUsername: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        color: '#333',
    },
    friendStatus: {
        fontSize: 12,
        color: '#888',
    },
    noFriendsContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    noFriendsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2196F3',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    // Modal Overlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Container
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,

        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    // Friend Modal
    modalPfp: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 12,
    },
    modalUsername: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    modalStatus: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    // Add Friend
    addFriendTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    addFriendInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
        color: '#333',
    },
});

export default styles;