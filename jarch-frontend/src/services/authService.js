import { authenticate, register, logout as apiLogout, getToken, setToken } from './api';

export const authService = {
    async login(email, password) {
        const token = await authenticate(email, password);
        this.setToken(token);
        return token;
    },

    async register(username, password, email) {
        const token = await register(username, password, email);
        this.setToken(token);
        return token;
    },

    logout() {
        apiLogout();
        window.dispatchEvent(new Event('authChange'));
    },

    isAuthenticated() {
        return !!getToken();
    },

    getToken() {
        return getToken();
    },

    setToken(token) {
        setToken(token);
        window.dispatchEvent(new Event('authChange'));
    }
};