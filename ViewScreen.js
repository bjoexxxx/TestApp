import {app, database, storage} from './Firebase';
import {collection, doc, getDoc } from 'firebase/firestore';
import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { useCollection } from 'react-firebase-hooks/firestore';
import { ref, getDownloadURL } from 'firebase/storage';


export default function ViewScreen({navigation, route}){
    const { id, text: initialText, alias: initialAlias, image: initialImage } = route.params;
    const [text, setText] = useState(initialText);
    const [alias, setAlias] = useState(initialAlias)
    const [imageURL, setImageURL] = useState(initialImage)
    const [imagePath, setImagePath] = useState(null);

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
    }, [id, initialImage, setImagePath]);
 return(
    <View style={styles.container}>
        <Text style={styles.alias}>{alias}</Text>
        <Text>
            {text}
        </Text>
        <Image style={{width:200, height:200}} source={{uri: imagePath}} />

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