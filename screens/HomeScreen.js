import React, { useState } from 'react';
import { View, TextInput, Button, ToastAndroid, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setServerInfo } from '../store/actions'; // Assurez-vous d'importer correctement l'action
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RecordScreen from './RecordScreen';
import RAVEScreen from './RAVEScreen';
import { MaterialIcons } from '@expo/vector-icons'; // Import des icônes Material Icons

const Tab = createBottomTabNavigator();

export default function HomeScreen({ navigation }) {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [isConnected, setIsConnected] = useState(false); // État pour gérer l'affichage conditionnel des onglets
  const dispatch = useDispatch();

  const handleConnectionAttempt = async () => {
    const url = `http://${ip}:${port}/`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        // Connexion réussie
        const serverInfo = { ip, port };
        dispatch(setServerInfo(serverInfo)); // Enregistrer les informations du serveur dans Redux
        await saveServerInfo(serverInfo);
        setIsConnected(true); // Met à jour l'état de connexion
        ToastAndroid.show('Connexion réussie !', ToastAndroid.SHORT);
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      ToastAndroid.show('Connexion échouée...', ToastAndroid.SHORT);
    }
  };

  const saveServerInfo = async (serverInfo) => {
    try {
      let previousServers = await AsyncStorage.getItem('previousServers');
      previousServers = previousServers ? JSON.parse(previousServers) : [];
      const serverExists = previousServers.some(
        server => server.ip === serverInfo.ip && server.port === serverInfo.port
      );

      if (!serverExists) {
        const updatedServers = [serverInfo, ...previousServers].slice(0, 3);
        await AsyncStorage.setItem('previousServers', JSON.stringify(updatedServers));
      }
    } catch (error) {
      console.error('Failed to save server info', error);
    }
  };

  return (
    <NavigationContainer independent={true}>
      {!isConnected ? (
        <View style={styles.container}>
          <TextInput style={styles.input} placeholder="IP Address" onChangeText={setIp} value={ip} />
          <TextInput style={styles.input} placeholder="Port" onChangeText={setPort} value={port} />
          <Button title="Connect" onPress={handleConnectionAttempt} />
        </View>
      ) : (
        <Tab.Navigator>
          <Tab.Screen
            name="Record"
            component={RecordScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="mic" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="RAVE"
            component={RAVEScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="audiotrack" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
