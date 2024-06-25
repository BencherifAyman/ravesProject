import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useDispatch, useSelector } from 'react-redux';
import { addRecording, removeRecording } from '../store/actions';
import { Ionicons } from '@expo/vector-icons'; // Import des icônes Ionicons depuis Expo
import axios from 'axios';

const RECORDING_DIRECTORY = FileSystem.documentDirectory + 'recordings/';
const SERVER_ADDRESS = 'http://192.168.0.2:8000'; // Remplacer par l'adresse de votre serveur

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(RECORDING_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECORDING_DIRECTORY, { intermediates: true });
  }
};

const sendFile = async (fileUri) => {
  const resp = await FileSystem.uploadAsync(`${SERVER_ADDRESS}/upload`, fileUri, {
    fieldName: 'file',
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    headers: { filename: fileUri }
  });
  console.log(resp.body);
  return resp.body;
};

export default function RecordScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [name, setName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const recordings = useSelector(state => state.app.recordings);
  const dispatch = useDispatch();

  useEffect(() => {
    ensureDirExists();
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    await ensureDirExists();
    const savedRecordings = await FileSystem.readDirectoryAsync(RECORDING_DIRECTORY);
    savedRecordings.forEach(recording => {
      dispatch(addRecording(recording));
    });
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!name) {
      Alert.alert('Error', 'Please provide a name for your recording.');
      return;
    }

    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const fileName = `${name}.wav`;
    await FileSystem.moveAsync({
      from: uri,
      to: RECORDING_DIRECTORY + fileName,
    });
    dispatch(addRecording(fileName));
    setName('');
  };

  const playRecording = async (recording) => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync({ uri: RECORDING_DIRECTORY + recording });
      await sound.playAsync();
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  const deleteRecording = async (recording) => {
    await FileSystem.deleteAsync(RECORDING_DIRECTORY + recording);
    dispatch(removeRecording(recording));
  };

  const handleSendRecording = async (recording) => {
    const uri = `${RECORDING_DIRECTORY}${recording}`;
    const response = await sendFile(uri);
    Alert.alert('Response', response);
  };

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      <TextInput
        style={styles.input}
        placeholder="Name your recording"
        onChangeText={setName}
        value={name}
      />
      <FlatList
        data={recordings}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.recordingContainer}>
            <Text>{item}</Text>
            <View style={styles.buttonGroup}>
              <Ionicons
                name="play"
                size={24}
                color="black"
                onPress={() => playRecording(item)}
                disabled={isPlaying}
              />
              <Ionicons
                name="trash"
                size={24}
                color="black"
                onPress={() => deleteRecording(item)}
              />
              <View style={styles.sendButtonContainer}>
                <Ionicons
                  name="send"
                  size={24}
                  color="black"
                  onPress={() => handleSendRecording(item)}
                />
                <Text style={styles.sendButtonText}>Transform</Text>
              </View>
            </View>
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  buttonGroup: {
    flexDirection: 'column',
  },
  sendButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7, // Opacité pour la séparation visuelle
    padding: 5,
  },
  sendButtonText: {
    marginLeft: 5,
  },
});
