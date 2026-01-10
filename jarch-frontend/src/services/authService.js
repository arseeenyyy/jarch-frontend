import { authenticate, register, logout as apiLogout, getToken, setToken } from './api';

export const authService = {
    async login(username, password) {
        return await authenticate(username, password);
    },

    async register(username, password, email) {
        return await register(username, password, email);
    },

    logout() {
        apiLogout();
    },

    isAuthenticated() {
        return !!getToken();
    },

    getToken() {
        return getToken();
    },

    setToken(token) {
        setToken(token);
    }
};