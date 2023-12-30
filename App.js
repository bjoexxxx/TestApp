import{app, database} from './Firebase'
import { collection, addDoc } from 'firebase/firestore';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen'
import NoteScreen from './NoteScreen'
import EditScreen from './EditScreen';
import ViewScreen from './ViewScreen';

const Stack = createStackNavigator();

export default function App() {

return (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="View" component={ViewScreen}/>
      <Stack.Screen name="Notes" component={NoteScreen} />
      <Stack.Screen name="Edit" component={EditScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


