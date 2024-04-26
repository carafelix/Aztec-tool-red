import { useState, useRef } from 'react';
import { View, Button, StyleSheet, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import bwipjs from 'bwip-js';
import ImagePicker from './components/imgPicker';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { TimePicker } from './components/timePicker';
import { CheckBox } from '@rneui/themed';

export default function App() {
  //#region string State
  const [id, setID] = useState('0'.repeat(16));
  const [signature, setSignature] = useState('0'.repeat(10));
  const [zeros, setZeros] = useState('6601' + '0'.repeat(32));
  const [time, setTime] = useState(getReverseTimeHex(new Date()));
  const [quarter, setQuarter] = useState('0'.repeat(12));
  const [checksum, setChecksum] = useState('0'.repeat(118));

  const [fullString, setFull] = useState(
    [id, signature, zeros, time, quarter, checksum].join('')
  );

  const [isRecalcTimeChecked, setRecalcTimeChecked] = useState(false);

  //#endregion

  const [img, setImg] = useState(null);

  const handleImgSelect = async (value) => {
    setImg(value);
  };

  const handleTimeChangeFromPicker = (date) => {
    setTime(getReverseTimeHex(date));
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <ImagePicker onImageSelect={handleImgSelect} />
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
        <InputWrapper label={'ID'} value={id} setValue={setID} />

        <InputWrapper
          label={'Firma'}
          value={signature}
          setValue={setSignature}
        />
      </View>

      <View style={styles.inputContainer}>
        <FloatingLabelInput
          label="Reverse time"
          value={time}
          editable={false}
        />
        <InputWrapper label={'Quarter'} value={quarter} setValue={setQuarter} />
      </View>

      <View style={styles.inputContainer}>
        <InputWrapper
          label={'Checksum'}
          value={checksum}
          setValue={setChecksum}
        />
      </View>

      <View style={styles.inputContainer}>
        <InputWrapper label={'Full'} value={fullString} setValue={setFull} />
        <View style = {styles.buttonContainer}>
          <Button
            title="Input from Full"
            onPress={() => {
              try {
                if(fullString.length !== 200){
                  throw new Error('Miss Input:\nString length must be exactly 200.')
                }

                const full = getHexSections(fullString);
                setID(full[0]);
                setSignature(full[1]);
                setZeros(full[2]);
                setTime(full[3]);
                setQuarter(full[4]);
                setChecksum(full[5]);
              } catch (err){
                Alert.alert(err.message)
              }
            }}
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

function InputWrapper({ label, value, setValue }) {
  const timerRef = useRef(null);

  const handlePressIn = () => {
    timerRef.current = setTimeout(() => {
      handleLongPress();
    }, 2000);
  };

  const handlePressOut = () => {
    clearTimeout(timerRef.current);
  };

  const handleLongPress = () => {
    setValue('0'.repeat(value.length));
  };

  return (
    <>
      <FloatingLabelInput
        label={label}
        value={value}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onChangeText={(v) => setValue(v)}
      />
    </>
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
    flexWrap: 'wrap',
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
  return reverseStringBytes(currTime)
}

function reverseStringBytes(str){
  return str.match(/.{2}/g).reverse().join('').toUpperCase();
}

function getHexSections(str) {
  return [
    str.slice(0, 16), // ID
    str.slice(16, 26), // (Daily?) Signature
    str.slice(26, 62), // year-byte and 0's
    reverseStringBytes(str.slice(62, 70)), // time
    str.slice(70, 82), // quarter?
    str.slice(82), // noise / checksum
  ];
}
