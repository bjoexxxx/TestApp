import {app, database, storage} from './Firebase';
import {collection, doc } from 'firebase/firestore';
import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { useCollection } from 'react-firebase-hooks/firestore';
import { ref, getDownloadURL } from 'firebase/storage';


export default function ViewScreen({navigation, route}){
    const { id, text: initialText } = route.params;
    const [text, setText] = useState(initialText);
    const [noteName, setNoteName] = useState("");

    useEffect(() => {
        async function fetchNote() {
            try {
                const noteRef = doc(database, "Notes", id);
                const noteSnapshot = await noteRef.get();
                
                if (noteSnapshot.exists()) {
                    const noteData = noteSnapshot.data();
                    setText(noteData.text);
                    const orderNumber = noteData.orderNumber; 
                    setNoteName(`Note${orderNumber}`);
                } else {
                    console.log("No such note!");
                }
            } catch (error) {
                console.log("Error fetching note:", error);
            }
        }
    
        fetchNote();
    }, [id]);

 return(
    <View style={styles.container}>
        <Text>{noteName}</Text>
        <Text>
            {text}
        </Text>

    </View>
 );


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