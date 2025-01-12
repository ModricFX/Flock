import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    /* ============================================= */
    /* ============  CONTAINERS & LAYOUT  ========== */
    /* ============================================= */
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
    },

    /* ============================================= */
    /* ===============  HEADER STYLES  ============= */
    /* ============================================= */
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
    },

    /* ============================================= */
    /* ===========  FLOATING ACTION BUTTON  ========= */
    /* ============================================= */
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

    /* ============================================= */
    /* ==================  CARDS  ================== */
    /* ============================================= */
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    eventsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    noEvents: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 10,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },

    /* ============================================= */
    /* =============  EVENT CARD STYLES  =========== */
    /* ============================================= */
    eventCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        flex: 1,
        flexWrap: 'wrap',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    eventDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    eventDates: {
        marginTop: 5,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 6,
    },
    participants: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    participantsText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 6,
    },
    userStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    userStatusText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 6,
    },

    /* ============================================= */
    /* =============  STATUS STYLES  =============== */
    /* ============================================= */
    statusUpcoming: {
        backgroundColor: '#4CAF50',
        color: '#fff',
        padding: 5,
        borderRadius: 4,
    },
    statusVoting: {
        backgroundColor: '#FF9800',
        color: '#fff',
        padding: 5,
        borderRadius: 4,
    },
    statusCompleted: {
        backgroundColor: '#9E9E9E',
        color: '#fff',
        padding: 5,
        borderRadius: 4,
    },
    statusInProgress: {
        backgroundColor: '#2196F3',
        color: '#fff',
        padding: 5,
        borderRadius: 4,
    },

    /* ============================================= */
    /* ============  MODAL / OVERLAY  ============== */
    /* ============================================= */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    modalEventButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
    },
    removeButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 10,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },

    /* ============================================= */
    /* ===============  INPUTS  ==================== */
    /* ============================================= */
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    iconStyle: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        padding: 5,
    },
    inviteInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#fff',
    },

    /* ============================================= */
    /* ===============  SECTIONS  ================== */
    /* ============================================= */
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 10,
    },
    sectionIcon: {
        marginRight: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    durationLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        marginBottom: 6,
    },

    /* ============================================= */
    /* ==========  DURATION SELECTION  ============= */
    /* ============================================= */
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    durationUnitContainer: {
        flex: 0.48,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepperButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperText: {
        fontSize: 16,
        width: 40,
        textAlign: 'center',
        color: '#333',
    },
    durationText: {
        fontSize: 18,
        marginHorizontal: 20,
        minWidth: 40,
        textAlign: 'center',
    },

    /* ============================================= */
    /* =============  DAYS SELECTION  ============== */
    /* ============================================= */
    noDaysText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    daysContainer: {
        marginBottom: 16,
    },
    dayItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
    },
    dayInfo: {
        flex: 1,
    },
    dayText: {
        fontSize: 16,
        color: '#333',
    },
    removeDayButton: {
        marginLeft: 12,
    },
    addDayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'center',
    },
    addDayButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },

    /* ============================================= */
    /* ============  INVITE STYLES  ================ */
    /* ============================================= */
    friendsScrollView: {
        marginBottom: 16,
    },
    inviteChip: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    inviteChipText: {
        fontSize: 14,
        color: '#333',
    },
    inviteInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    addInviteButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    invitedContainer: {
        marginTop: 10,
    },
    invitedLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    invitedList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    invitedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    invitedText: {
        fontSize: 14,
        color: '#333',
        marginRight: 6,
    },

    /* ============================================= */
    /* =============  VOTING STYLES  =============== */
    /* ============================================= */
    votingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    votingButtonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },

    /* ============================================= */
    /* ============  TIME SELECTION  =============== */
    /* ============================================= */
    fieldContainer: {
        marginBottom: 15,
    },
    pickerButtonText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    valueButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    valueText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },

    /* ============================================= */
    /* ========  VOTING MODAL & CONTENT  =========== */
    /* ============================================= */
    votingModalContainer: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    votingModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    votingModalContent: {
        paddingBottom: 20,
    },
    dayContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    availableContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availableText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#4CAF50',
    },
    selectTimeSection: {
        marginTop: 10,
    },
    responseButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    responseButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yesButton: {
        backgroundColor: '#4CAF50',
    },
    noButton: {
        backgroundColor: '#e74c3c',
    },
    responseButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    alreadySelectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    alreadySelectedText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    changeMindButton: {
        marginLeft: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFD54F',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    changeMindButtonText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },

    /* ============================================= */
    /* ========  PARTICIPANTS / DETAILS  =========== */
    /* ============================================= */
    participantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        flexShrink: 1,
        textAlign: 'right',
    },
    participantsPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    participantsPreviewText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    participantsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
    },
    participantsButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 5,
        fontWeight: 'bold',
    },
    participantsScroll: {
        marginBottom: 12,
    },
    participantName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    participantEmail: {
        fontSize: 14,
        color: '#666',
    },
    participantStatus: {
        fontSize: 13,
        color: '#333',
    },
    participantsModalContainer: {
        width: '90%',
        height: '70%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
    },
    summaryRow: {
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },

    /* ============================================= */
    /* ============  GENERAL BUTTONS  ============== */
    /* ============================================= */
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginVertical: 5,
        minWidth: '45%',
        justifyContent: 'center',
    },
    voteButton: {
        backgroundColor: '#FF9800',
        width: '95%',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    denyButton: {
        backgroundColor: '#fb4e41',
    },
    closeButton: {
        backgroundColor: '#757575',
    },

    /* ============================================= */
    /* ==========  SECTION HEADERS ETC.  =========== */
    /* ============================================= */
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: 15,
        marginBottom: 5,
    },

    /* ============================================= */
    /* ===========  MISC HELPER STYLES  ============ */
    /* ============================================= */
    statusContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    statusTextParticipation: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmedText: {
        color: '#4CAF50',
    },
    deniedText: {
        color: '#F44336',
    },
});

export default styles;