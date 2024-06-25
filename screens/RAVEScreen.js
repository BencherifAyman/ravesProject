import React, { useState } from 'react';
import { View, Button, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons'; // Import des icônes Ionicons depuis Expo



export default function RAVEScreen() {
  const [loading, setLoading] = useState(false);
  const [transformedFile, setTransformedFile] = useState(null);
  const recordings = useSelector(state => state.app.recordings);

  const sendToServer = async (recording) => {
    setLoading(true);
    const fileUri = FileSystem.documentDirectory + 'recordings/' + recording;
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: recording,
      type: 'audio/wav',
    });

    try {
      const response = await axios.post('http://192.168.0.2:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Gérer la réponse du serveur après l'upload
      const transformedUri = response.data.uri; // Exemple hypothétique
      setTransformedFile(transformedUri);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const playRecording = async (recording) => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + recording });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.recordingItem}>
            <Text style={styles.recordingName}>{item}</Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playRecording(item)}
              disabled={loading} // Vous pouvez utiliser loading ici pour désactiver le bouton si nécessaire
            >
              <Ionicons
              name="play"
              size={24}
              color="black"
              onPress={() => playRecording(item)}

            />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  recordingName: {
    fontSize: 16,
  },

  playButtonText: {
    color: 'white',
    marginLeft: 5,
  },
});