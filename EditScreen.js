import{app, database} from './Firebase'
import { collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView } from 'react-native';
import {useCollection} from 'react-firebase-hooks/firestore'

export default function EditScreen({ route, navigation }) {
    const { id, text: initialText } = route.params;
    const [text, setText] = useState(initialText);

    useEffect(() => {
        async function fetchNote() {
            try {
                const noteRef = doc(database, "Notes", id);
                const noteSnapshot = await getDoc(noteRef);
                
                if (noteSnapshot.exists()) {
                    setText(noteSnapshot.data().text);
                } else {
                    console.log("No such note!");
                }
            } catch (error) {
                console.log("Error fetching note:", error);
            }
        }
    
        fetchNote();
    }, [id]);
    
  
    async function editNote() {
      try {
        const noteRef = doc(database, "Notes", id);
        await updateDoc(noteRef, { text: text });
        navigation.navigate('Home'); // Optionally navigate back after saving
      } catch (err) {
        console.log("Error updating note:", err);
      }
    }
  
    return (
      <View style={styles.container}>
        <Text>Edit Note:</Text>
        <TextInput 
          style={styles.input} 
          multiline={true}
          value={text}
          onChangeText={(txt) => setText(txt)}
        />
        <Button title="Finish Edit" onPress={editNote} />
        <Button title="Go Home" onPress={() => navigation.navigate('Home')} />
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
  input: {
      width: '80%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginTop: 10,
      padding: 10,
  }
});
