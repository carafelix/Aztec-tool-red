import { useState } from 'react';
import { Button, Text, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const TimePicker = ({ onTimeChange }) => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(false);
    setDate(selectedDate);
    onTimeChange(selectedDate)
  };

  return (
    <SafeAreaView>
      <Button onPress={() => setShow(true)} title="Custom Time" />
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="time"
          is24Hour={true}
          onChange={onChange}
        />
      )}
    </SafeAreaView>
  );
};
