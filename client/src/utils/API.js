import axios from 'axios';

const headers = {
  'Content-Type': 'application/json',
};
const burl = process.env.REACT_APP_END_POINT;

// eslint-disable-next-line
export default {
  search: function (body) {
    return axios.post(`${burl}/search`, body);
  },
  login: function (email, password) {
    return axios.post(
      `${burl}/user/login`,
      {
        email,
        password,
      },
      {
        headers: headers,
      }
    );
  },
  signup: function (send) {
    return axios.post(`${burl}/user/signup`, send, { headers: headers });
  },
  isAuth: function () {
    return localStorage.getItem('token') !== null;
  },
  logout: function () {
    localStorage.clear();
  },
};
