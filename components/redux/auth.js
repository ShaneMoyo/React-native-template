import axios from 'axios';
import {SecureStore} from 'expo';
import store from '../store';

import IP from '../../IP';

/* -----------------    ACTION TYPES    ------------------ */

const SET_CURRENT_USER = 'SET_CURRENT_USER';
const REMOVE_CURRENT_USER = 'REMOVE_CURRENT_USER';
const GET_MY_RESOURCES = 'GET_MY_RESOURCES';

/* ------------     ACTION CREATORS      ------------------ */

const setCurrentUser = user => ({ type: SET_CURRENT_USER, user });
export const removeCurrentUser = () => ({ type: REMOVE_CURRENT_USER });

/* ------------          REDUCER         ------------------ */

export default function reducer (currentUser = {}, action) {
  switch (action.type) {

    case SET_CURRENT_USER:
      return action.user;

    case REMOVE_CURRENT_USER:
      return {};

    default:
      return currentUser;
  }
}


let token = '';
const storeToken = async (token) => {
  if (token) {
    console.log('setting token: ', token)
    await SecureStore.setItemAsync('token', token);
  } else {
    console.log('clearing token: ', token)
    await SecureStore.setItemAsync('token', '');
  }
};

store.subscribe(async => {
  const { token: newToken } = store.getState().currentUser;
  if(newToken !== token) {
    token = newToken;
    console.log('invoking storeToken: ', token);
    storeToken(token);
  }
});
/* ------------       THUNK CREATORS     ------------------ */

export const login = (credentials, navigation) => dispatch => {
  console.log(`POST request to: ${IP}/api/auth/signin`);
  axios.post(`${IP}/api/auth/signin`, credentials)
    .then(res => {
      console.log('SUCCESS: ', res.data)
      setUserAndRedirect(res.data, navigation, dispatch)
    })
    .catch((error) => {
      console.log('ERROR: ', error)
      navigation.navigate('SignedOut', {error: 'Login failed.'})
    });
};

export const signup = (credentials, navigation) => dispatch => {
  console.log(`POST request to: ${IP}/api/auth`);
  axios.post(`${IP}/api/auth`, credentials, { headers: { 'Authorization': token }})
    .then(res => {
      console.log('SUCCESS: ', res.data);
       setUserAndRedirect(res.data, navigation, dispatch)
    })
    .catch((error) => {
      console.log('ERROR: ', error)
      navigation.navigate('SignedOut', {error: 'Signup failed.'})
    });
};

export const getMyResources = (credentials, navigation) => dispatch => {
  const accessToken = store.getState().currentUser;
  console.log(`GET request to: ${IP}/api/resources`);
  axios.get(`${IP}/api/resources`, { headers: { 'Authorization': accessToken } })
    .then(res => {
       console.log('SUCCESS: ', res.data)
    })
    .catch((error) => {
      console.log('error: ', error);
    });
};

export const postResource = (data) => dispatch => {

  const accessToken = store.getState().currentUser;
  console.log(`POST request to: ${IP}/api/resources`);
  axios.post(`${IP}/api/resources`, data, { headers: { 'Authorization': accessToken } })
    .then(res => {
      console.log('SUCCESS: ', res.data)
    })
    .catch((error) => {
      console.log('error: ', error);
    });
};

export const logout = navigation => dispatch => {
  dispatch(removeCurrentUser());
  navigation.navigate('SignedOut', {error: 'Logout successful.'});
};

/* ------------      HELPER FUNCTIONS     ------------------ */

function setUserAndRedirect (user, navigation, dispatch) {
  dispatch(setCurrentUser(user));
  navigation.navigate('SignedIn');
}
