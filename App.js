import { useState } from 'react';
import { View, Button, StyleSheet, Text, Image, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import bwipjs from 'bwip-js';
import ImagePickerExample from './components/imgPicker';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { TimePicker } from './components/timePicker';
import { CheckBox } from '@rneui/themed';

export default function App() {
  //#region string State
  const [id, setID] = useState('0'.repeat(16));
  const [signature, setSignature] = useState('0'.repeat(10));
  const [zeros, setZeros] = useState('6601' + '0'.repeat(32));
  const [time, setTime] = useState(getReverseTimeHex(new Date()));
  const [isRecalcTimeChecked, setRecalcTimeChecked] = useState(false);
  const [quarter, setQuarter] = useState('0'.repeat(12));
  const [checksum, setChecksum] = useState('0'.repeat(118));

  //#endregion

  const [img, setImg] = useState(null);

  const handleImgSelect = (value) => {
    setImg(value);
    // setTime(getReverseTimeHex(new Date()));
  };

  const handleTimeChangeFromPicker = (date) => {
    setTime(getReverseTimeHex(date));
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <ImagePickerExample onImageSelect={handleImgSelect} />
        <Button
          onPress={async (e) => {
            let _time = time;
            if (isRecalcTimeChecked) {
              _time = getReverseTimeHex(new Date());
              setTime(_time);
            }

            const aztec = await bwipjs.toDataURL({
              bcid: 'azteccode',
              text: [id, signature, zeros, _time, quarter, checksum].join(''),
            });
            setImg(aztec.uri);
          }}
          title="write"
        />
        <TimePicker onTimeChange={handleTimeChangeFromPicker} />
        <CheckBox
          title={'Recalc Time?'}
          checked={isRecalcTimeChecked}
          onPress={() => setRecalcTimeChecked(!isRecalcTimeChecked)}
        />
      </View>

      <View style={styles.inputContainer}>
        <FloatingLabelInput
          label={'ID'}
          value={id}
          onChangeText={(value) => setID(value)}
        />
        <FloatingLabelInput
          label={'Firma'}
          value={signature}
          onChangeText={(value) => setSignature(value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <FloatingLabelInput
          label="Reverse time"
          value={time}
          editable={false}
        />
        <FloatingLabelInput
          label="Quarter"
          value={quarter}
          onChangeText={(value) => setQuarter(value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <FloatingLabelInput
          label={'Checksum'}
          value={checksum}
          onChangeText={(value) => setChecksum(value)}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Button
            title="Reset checksum"
            onPress={() => setChecksum('0'.repeat(118))}
          />
        </View>
      </View>

      {(img && <Image source={{ uri: img }} style={styles.image} />) || (
        <Image style={styles.image} />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    margin: 30,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: 80,
    margin: 10,
    flexWrap: 'wrap'
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    margin: 5,
  },
});

function getReverseTimeHex(date) {
  const currTime = Math.floor(date.getTime() / 1000).toString(16);
  const reversed = currTime.match(/.{2}/g).reverse().join('');
  return reversed.toUpperCase();
}

function getHexSections(str) {
  return [
    str.slice(0, 16), // ID
    str.slice(16, 26), // (Daily?) Signature
    str.slice(26, 62), // year-byte and 0's
    str.slice(62, 70), // time
    str.slice(70, 82), // quarter?
    str.slice(82), // noise / checksum
  ];
}
