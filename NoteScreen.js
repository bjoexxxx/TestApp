import{app, database, storage} from './Firebase'
import { collection, addDoc, Firestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, Image, ActionSheetIOS, Modal } from 'react-native';
import HomeScreen from './HomeScreen';
import * as ImagePicker from 'expo-image-picker'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function NoteScreen({navigation}) {
 const [text, setText] = useState('')
 const [alias, setAlias] = useState('')
 const [imagePath, setImagePath] = useState(null);
 const [imageURL, setImageURL] = useState(null);
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

async function AddNote(){
  try{
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
    await addDoc(collection(database, "Notes"), noteData);
  }
  catch(err){
    console.log("Error in DB " + err)
  }
}


return (
  <ScrollView style={styles.container}>
    <Text>New Note:</Text>
    <Modal style={styles.modal} visible={isModalOpen} onRequestClose={closeModal}>
     <TextInput
       style={styles.input}
       onChangeText={(txt) => setImageURL(txt)}
       placeholder='Enter Download Filename'
     />
     <Button title='Download Image' onPress={() => handleDownload(setImagePath, imageURL, closeModal)}/>
    </Modal>
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
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 10,
    marginBottom: 10, // Add a little space at the bottom too
    maxHeight: '80%', // Adjust as needed to control the height within the modal
    width: '60%', // Make it a bit narrower than the modal itself
    alignSelf: 'center', // Center it within the modal
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  modalContainer: {
    position: 'absolute',
    top: '25%',  // Adjust this value to move the container up or down
    left: '10%',  // Adjust this value to move the container left or right
    width: '80%', // Width of the container
    height: '50%', // Height of the container
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    
  },
  modalInput: {
    
  }
});

