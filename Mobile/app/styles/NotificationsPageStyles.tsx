import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
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
    filters: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    filterText: {
        fontSize: 16,
        color: "#555",
    },
    activeFilterText: {
        fontWeight: "600",
        color: "#000",
    },
    notification: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    unreadNotification: {
        backgroundColor: "#e6f7ff",
    },
    unreadDot: {
        width: 10,
        height: 10,
        backgroundColor: "#0A84FF",
        borderRadius: 5,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        fontSize: 14,
        color: "#555",
    },
    time: {
        fontSize: 12,
        color: "#888",
        marginTop: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    modalOption: {
        fontSize: 16,
        color: "#333",
        marginVertical: 10,
    },
    popupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    popupContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    popupTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    popupDescription: {
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#ff0000",
        marginBottom: 16,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        color: "#888",
    },
    popupExactTime: {
        fontSize: 12,
        color: "#888",
        marginTop: 5,
    },
});

export default styles;