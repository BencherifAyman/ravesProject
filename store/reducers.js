// reducers.js

import { combineReducers } from 'redux';
import { ADD_RECORDING, REMOVE_RECORDING, SET_SERVER_INFO } from './actions';

const initialState = {
  recordings: [],
  serverInfo: null,
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_RECORDING:
      return {
        ...state,
        recordings: [...state.recordings, action.payload],
      };
    case REMOVE_RECORDING:
      return {
        ...state,
        recordings: state.recordings.filter(recording => recording !== action.payload),
      };
    case SET_SERVER_INFO:
      return {
        ...state,
        serverInfo: action.payload,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  app: appReducer,
});

export default rootReducer;
