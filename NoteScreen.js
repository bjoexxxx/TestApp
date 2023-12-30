import{app, database, storage} from './Firebase'
import { collection, addDoc, Firestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, Image, ActionSheetIOS } from 'react-native';
import HomeScreen from './HomeScreen';
import * as ImagePicker from 'expo-image-picker'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function NoteScreen({navigation}) {
 const [text, setText] = useState('')
 const [alias, setAlias] = useState('')
 const [imagePath, setImagePath] = useState(null);
 const showOptions = () => {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['Cancel', 'Library', 'Camera', 'Database'],
      cancelButtonIndex: 0,
    },
    buttonIndex => {
      if (buttonIndex === 1) pickImage(setImagePath);
      else if (buttonIndex === 2) makeImage(setImagePath);
      else if (buttonIndex === 3) downloadImage(setImagePath);
    },
  );
};

 async function AddNote(){
  try{
  await addDoc(collection(database, "Notes"), {
    text: text,
    alias: alias
  })}
  catch(err){
    console.log("fejl i DB " + err)
  }
}

return (
  <ScrollView style={styles.container}>
    <Text>New Note:</Text>
    <TextInput 
      style={styles.input} 
      multiline={true}
      onChangeText={(txt) => setAlias(txt)}
      placeholder='Enter Note Name Here'
    />
    <TextInput 
      style={styles.input} 
      multiline={true}
      onChangeText={(txt) => setText(txt)}
      placeholder='Enter Body Text'
    />
    {imagePath && (
       <Image 
         source={{ uri: imagePath }}
         style={styles.image} // Define this style in your StyleSheet
       />
     )}
     <Button title="Add Image" onPress={() => showOptions()}/>
    <Button title="Save Image" onPress={() => uploadImage(imagePath)}/>
    <Button title="Save Note" onPress={() => AddNote()}/>
    <Button title="Go Home" onPress={() => navigation.navigate('Home')}/>
  </ScrollView>
);
}

async function makeImage(setImagePath){

  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if(permissionResult.granted){
    const result = await ImagePicker.launchCameraAsync()
    if (!result.canceled && result.assets) {
      setImagePath(result.assets[0].uri);
    }
  } else {
    alert("Did not get permission")
    return
  }

}

async function pickImage(setImagePath){
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
      alert("Media Library Access Not Provided");
      return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true });
  if (!result.canceled) {
      setImagePath(result.assets[0].uri);
  }
}

async function uploadImage(imagePath){
  const res = await fetch(imagePath)
  const blob = await res.blob()
  const storageRef = ref(storage, "myImage.jpg")
  uploadBytes(storageRef, blob).then((snapshot) => {
      alert("Image Uploaded")
  })
}

async function downloadImage(setImagePath){
  getDownloadURL(ref(storage, "noteImage.jpg")).then((url) => {
      setImagePath(url)
  })
  .catch((error) => 
  alert("fejl i image download" + error))
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 10,
  },
  image: {
    width: '100%', // Set the width
    height: 200, // Set the height or make it dynamic
    marginTop: 10, // Optional: Margin to separate from other elements
  },
});
