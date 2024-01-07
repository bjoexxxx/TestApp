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
            if (buttonIndex === 1) navigation.navigate('View', {id: item.id, text: item.text, alias: item.alias, image: item.image});
            else if (buttonIndex === 2) navigation.navigate('Edit', { id: item.id, text: item.text, alias: item.alias, image: item.image });
            else if (buttonIndex === 3) deleteItem(item.id);
          },
    );
 }

    return (
        <View style={styles.container}>
            <Text>These are your notes!</Text>
            
            <FlatList 
              data={data}
              renderItem={({ item }) => renderItem({ item, noteActionSheet })}
              keyExtractor={item => item.id}
            />
            <Button style={styles.button} title="Add New Note" onPress={() => navigation.navigate('Notes')} />
            </View>
    );
}

/*const data = [
    { id: '1', text: 'Item 1', age: 29 },
    { id: '2', text: 'Item 2', age: 20 },
    { id: '3', text: 'Item 3', age: 11 },
];*/

const renderItem = ({ item, noteActionSheet }) => {
    return (
      <View style={styles.listItemContainer}>
        <Button title={item.alias} onPress={() => noteActionSheet(item)}/>
      </View>
    );
  };

async function deleteItem(id) {

    await deleteDoc(doc(database, "Notes", id));
};

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
    button:{
      marginBottom: 100,
      justifyContent: 'center',
      paddingBottom: 20,
    }
});

