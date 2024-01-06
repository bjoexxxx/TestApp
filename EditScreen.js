import{app, database, storage} from './Firebase'
import { collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, Image, ActionSheetIOS } from 'react-native';
import {useCollection} from 'react-firebase-hooks/firestore'
import { ref, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker'

export default function EditScreen({ route, navigation }) {
  const { id, text: initialText, alias: initialAlias, image: initialImage } = route.params;
  const [text, setText] = useState(initialText);
  const [alias, setAlias] = useState(initialAlias)
  const [imageURL, setImageURL] = useState(initialImage)
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

    useEffect(() => {
      async function fetchNote() {
          try {
              const noteRef = doc(database, "Notes", id);
              const noteSnapshot = await getDoc(noteRef);
              
              if (noteSnapshot.exists()) {
                  const noteData = noteSnapshot.data();
                  setText(noteData.text);
                  setAlias(noteData.alias)
                  setImageURL(noteData.image)
              } else {
                  console.log("No such note!");
              }
              if(initialImage != null){
                  fetchImage(imageURL, setImagePath)
              }
          } catch (error) {
              console.log("Error fetching note:", error);
          }
      }
  
      fetchNote();
  }, [id, initialText, initialAlias, initialImage, setImagePath]);
    
  
    async function editNote() {
      try {
        const noteRef = doc(database, "Notes", id);
        await updateDoc(noteRef, { text: text });
        navigation.navigate('Home');
      } catch (err) {
        console.log("Error updating note:", err);
      }
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.alias}>{alias}</Text>
        <TextInput 
          style={styles.input} 
          multiline={true}
          value={text}
          onChangeText={(txt) => setText(txt)}
        />
        <Image style={{width:200, height:200}} source={{uri: imagePath}} />
        <Button title="Change Image" onPress={() => showOptions()} />
        <Button title="Finish Edit" onPress={editNote} />
      </View>
    );
    
}

function fetchImage(initialImage, setImagePath){
  getDownloadURL(ref(storage, initialImage)).then((url) => {
      setImagePath(url)
  })
  .catch((error) => 
  alert("fejl i image download" + error))
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

async function uploadImage(imagePath, imageURL){
  const res = await fetch(imagePath)
  const blob = await res.blob()
  const storageRef = ref(storage, imageURL)
  uploadBytes(storageRef, blob).then((snapshot) => {
      alert("Image Uploaded")
  })
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
  },
  listItemContainer: {
      flexDirection: 'row',  // to display item and button next to each other
      alignItems: 'center',  // vertically align items in the middle
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      justifyContent: 'space-between'  // distribute space evenly between item and button
  },
  item: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
  },alias: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 10, 
  }
});
