import { Button, Image, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerExample( {onImageSelect} ) {
  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4,4],
      quality: 1,
    }); 

    if (!result.canceled) {
      await onImageSelect(result.assets[0].uri);
    }
  };

  return (
    <>
      <Button title="Pick Aztec" onPress={pickImage} />
    </>
  );
}