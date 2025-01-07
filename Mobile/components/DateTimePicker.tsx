import React from 'react';
import { Modal, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../app/styles/HomePageStyles';

interface DateTimePickerComponentProps {
    visible: boolean;
    date: Date;
    mode: 'date' | 'time' | 'datetime';
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({ visible, mode, date, onConfirm, onCancel }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <DateTimePickerModal
                    isVisible={true}
                    mode={mode}
                    date={date}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            </View>
        </Modal>
    );
};

export default DateTimePickerComponent;
