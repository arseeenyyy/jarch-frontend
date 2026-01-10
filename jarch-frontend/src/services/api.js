const API_BASE = 'http://localhost:8080';

let token = localStorage.getItem('jwtToken') || '';

export const setToken = (newToken) => {
    token = newToken;
    localStorage.setItem('jwtToken', newToken);
};

export const getToken = () => token;

export const getHeaders = (contentType = 'application/json') => {
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    if (contentType !== 'multipart/form-data') {
        headers['Content-Type'] = contentType;
    }
    
    return headers;
};

export const request = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    
    try {
        const response = await fetch(url, options);
        
        if (response.headers.get('content-type')?.includes('application/zip') ||
            response.headers.get('content-type')?.includes('application/octet-stream')) {
            return response;
        }
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Если не удалось распарсить JSON, используем стандартное сообщение
            }
            throw new Error(errorMessage);
        }
        
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

export const authenticate = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка аутентификации');
        }
        
        const data = await response.json();
        if (data.token) {
            setToken(data.token);
            return data.token;
        }
        throw new Error('Токен не получен');
    } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
    }
};

export const register = async (username, password, email) => {
    try {
        const response = await fetch(`${API_BASE}/auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Ошибка регистрации');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const logout = () => {
    token = '';
    localStorage.removeItem('jwtToken');
};

export const isAuthenticated = () => {
    return !!token;
};