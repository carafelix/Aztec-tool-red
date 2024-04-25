import { useState } from 'react';
import { View, Button, StyleSheet, Text, Image, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-zlib-js';
import bwipjs from 'bwip-js';
import ImagePickerExample from './components/imgPicker';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { TimePicker } from './components/timePicker';

export default function App() {
  //#region string State
  const [id, setID] = useState('0'.repeat(16));
  const [signature, setSignature] = useState('0'.repeat(10));
  const [zeros, setZeros] = useState('6601' + '0'.repeat(32));
  const [time, setTime] = useState(getReverseTimeHex(new Date()));
  const [quarter, setQuarter] = useState('0'.repeat(12));
  const [noise, setNoise] = useState('0'.repeat(118));

  //#endregion

  const [img, setImg] = useState(null);

  const handleImgSelect = (value) => {
    setImg(value);
    setTime(getReverseTimeHex(new Date()));
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
            setTime(getReverseTimeHex(new Date()))
            const aztec = await bwipjs.toDataURL({
              bcid: 'azteccode',
              text: [id, signature, zeros, time, quarter, noise].join(''),
            });
            setImg(aztec.uri);
          }}
          title="write"
        />
        <TimePicker onTimeChange={handleTimeChangeFromPicker} />
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
          label={'Noise'}
          value={noise}
          onChangeText={(value) => setNoise(value)}
        />
      </View>

      {(img && <Image source={{ uri: img }} style={styles.image} />) || <Image style={styles.image}/>}

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
    margin: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    margin: 10,
  },
  inputContainer: {
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
