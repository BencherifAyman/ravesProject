// actions.js

export const ADD_RECORDING = 'ADD_RECORDING';
export const REMOVE_RECORDING = 'REMOVE_RECORDING';
export const SET_SERVER_INFO = 'SET_SERVER_INFO';

export const addRecording = (recording) => ({
  type: ADD_RECORDING,
  payload: recording,
});

export const removeRecording = (recording) => ({
  type: REMOVE_RECORDING,
  payload: recording,
});

export const setServerInfo = (ip, port) => ({
  type: SET_SERVER_INFO,
  payload: { ip, port },
});
