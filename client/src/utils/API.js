import axios from "axios";

const headers = {
    "Content-Type": "application/json"
};
const burl = "http://localhost:9000";

// eslint-disable-next-line
export default {
    search: function (params) {
        return axios.get(`${burl}/search`, {params: params});
    },
    login: function (email, password) {
        return axios.post(
            `${burl}/user/login`,
            {
                email,
                password
            },
            {
                headers: headers
            }
        );
    },
    signup: function (send) {
        return axios.post(`${burl}/user/signup`, send, {headers: headers});
    },

    isAuth: function () {
        return localStorage.getItem("token") !== null;
    },
    logout: function () {
        localStorage.clear();
    }
};