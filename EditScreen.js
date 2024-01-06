import{app, database, storage} from './Firebase'
import { collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Image, ActionSheetIOS, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import {useCollection} from 'react-firebase-hooks/firestore'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker'

export default function EditScreen({ route, navigation }) {
  const { id, text: initialText, alias: initialAlias, image: initialImage } = route.params;
  const [text, setText] = useState(initialText);
  const [alias, setAlias] = useState(initialAlias)
  const [imageURL, setImageURL] = useState(initialImage)
  const [imagePath, setImagePath] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const showOptions = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Library', 'Camera', 'Database'],
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex === 1) pickImage(setImagePath);
        else if (buttonIndex === 2) makeImage(setImagePath);
        else if (buttonIndex === 3) openModal();
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
        let newImageURL = null;
      if(imagePath != null && alias) {
        newImageURL = 'images/' + alias + '.jpg';
        await uploadImage(imagePath, newImageURL);
      }
    
    
      const noteData = {
        text: text,
        alias: alias
      };
      if (newImageURL) {
       noteData.image = newImageURL;
      }
      setText(noteData.text)
      setAlias(noteData.alias)
        const noteRef = doc(database, "Notes", id);
        await updateDoc(noteRef, { text: text, alias: alias, image: newImageURL });
        navigation.navigate('Home');
      } catch (err) {
        console.log("Error updating note:", err);
      }
    }
  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Modal style={styles.modal} visible={isModalOpen} onRequestClose={closeModal}>
          <TextInput
            style={styles.modalInput}
            onChangeText={(txt) => setImageURL(txt)}
            placeholder='Enter Download Filename'
            />
          <Button title='Download Image' onPress={() => handleDownload(setImagePath, imageURL, closeModal)}/>
          <Button title='Cancel' onPress={() => closeModal()}/>
        </Modal>
        <TextInput
          style={styles.alias}
          multiline={true}
          value={alias}
          onChangeText={(txt) => setAlias(txt)}
        />
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
      </TouchableWithoutFeedback>
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

async function downloadImage(setImagePath, imageURL){
  getDownloadURL(ref(storage, imageURL)).then((url) => {
      setImagePath(url)
  })
  .catch((error) => 
  alert("fejl i image download" + error))
}

async function handleDownload(setImagePath, imageURL, closeModal){
  console.log(imageURL);
  if (imageURL && imageURL.trim() !== '') {
    try {
      await downloadImage(setImagePath, imageURL);
      closeModal();
    } catch (error) {
      console.error("Error downloading image: ", error);
      alert("Error downloading image: " + error);
    }
  } else {
    alert("Please enter a valid image URL");
  }
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
  },
  alias: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'gray',
      padding: 10
  },
  input: {
    borderWidth: 1, // Add a border with a defined width
    borderColor: '#ccc', // Set the color of the border
    padding: 10, // Add some padding inside the text input
    margin: 10, // Add some margin outside the text input
    borderRadius: 5, // Optional: round the corners
    width: '60%', // Set a specific width
    alignSelf: 'center', // Center the input horizontally
    backgroundColor: '#fff', // Set a background color
  },
  modal: {
    top: 0,
    left: 0,
    width: '60%',
    height: '30%',
    display: 'flex',
    alignitems: 'center',
    justifycontent: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 100,
    marginBottom: 10, // Add a little space at the bottom too
    maxHeight: '20%', // Adjust as needed to control the height within the modal
    width: '60%', // Make it a bit narrower than the modal itself
    alignSelf: 'center',
  }
});
