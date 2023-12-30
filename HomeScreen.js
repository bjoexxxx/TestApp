import{app, database, storage} from './Firebase'
//import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Image, ActionSheetIOS } from 'react-native';
import {useCollection} from 'react-firebase-hooks/firestore'
import * as ImagePicker from 'expo-image-picker'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function HomeScreen({ navigation }) {
 const [notes, setNotes] = useState([])
 const [imagePath, setImagePath] = useState(null);


 const [values, loading, error] = useCollection(collection(database, "Notes"));
 const data = values?.docs.map((doc) => ({...doc.data(), id: doc.id}));

 if (loading) {
   return <Text>Loading notes...</Text>;
 }

 if (error) {
   console.error(error);
   return <Text>Error loading notes.</Text>;
 }

 const noteActionSheet = (item) => {
    ActionSheetIOS.showActionSheetWithOptions(
        {
            options: ['Cancel', 'View', 'Edit', 'Delete'],
            cancelButtonIndex: 0,
        },
        buttonIndex => {
            if (buttonIndex === 1) navigation.navigate('View', {id: item.id, text: item.text});
            else if (buttonIndex === 2) navigation.navigate('Edit', { id: item.id, text: item.text });
            else if (buttonIndex === 3) deleteItem(item.id);
          },
    );
 }

    return (
        <View style={styles.container}>
            <Text>These are your notes!</Text>
            
            <FlatList 
        data={data}
        renderItem={({ item, index }) => renderItem({ item, index, navigation, noteActionSheet })}
        keyExtractor={item => item.id}
      />
            
            <Button title="Add New Note" onPress={() => navigation.navigate('Notes')} />
            <Image style={{width:200, height:200}} source={{uri: imagePath}} />
            <Button title="Pick image" onPress={() => launchImagePicker(setImagePath)} />
            <Button title="Upload image" onPress={() => uploadImage(imagePath)} />
            <Button title="Download image" onPress={() => downloadImage(setImagePath)} />
            <Button title="Camera" onPress={() => launchCamera(setImagePath)} />

            </View>
    );
}

/*const data = [
    { id: '1', text: 'Item 1', age: 29 },
    { id: '2', text: 'Item 2', age: 20 },
    { id: '3', text: 'Item 3', age: 11 },
];*/

const renderItem = ({ item, index, navigation, noteActionSheet }) => {
    const noteLabel = `Note${index + 1}`;
    return (
      <View style={styles.listItemContainer}>
        <Button title={noteLabel} onPress={() => noteActionSheet(item)}/>
      </View>
    );
  };

async function deleteItem(id) {

    await deleteDoc(doc(database, "Notes", id));
};

async function launchCamera(setImagePath){
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
        alert("Camera Access Not Provided");
        return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
        setImagePath(result.assets[0].uri);
    }
}

async function launchImagePicker(setImagePath){
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
    getDownloadURL(ref(storage, "myImage.jpg")).then((url) => {
        setImagePath(url)
    })
    .catch((error) => 
    alert("fejl i image download" + error))
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
    }
});

