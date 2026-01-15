const API_BASE = 'http://localhost:8080';

let token = localStorage.getItem('jwtToken') || '';

export const setToken = (newToken) => {
    token = newToken;
    localStorage.setItem('jwtToken', newToken);
    console.log('Токен установлен:', newToken ? 'да' : 'нет');
};

export const getToken = () => {
    console.log('Получение токена:', token ? 'есть' : 'нет');
    return token;
};

export const getHeaders = (contentType = 'application/json') => {
    const headers = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Добавляем Authorization header');
    }
    
    if (contentType !== 'multipart/form-data') {
        headers['Content-Type'] = contentType;
    }
    
    console.log('Заголовки запроса:', headers);
    return headers;
};

export const request = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    
    console.log('Отправка запроса:', {
        url,
        method: options.method || 'GET',
        headers: options.headers
    });
    
    // Добавляем авторизацию если нет в заголовках
    if (!options.headers || !options.headers['Authorization']) {
        const headers = options.headers || {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        options.headers = headers;
    }
    
    try {
        const response = await fetch(url, options);
        
        console.log('Ответ сервера:', {
            url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.headers.get('content-type')?.includes('application/zip') ||
            response.headers.get('content-type')?.includes('application/octet-stream')) {
            return response;
        }
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            // Пробуем получить детали ошибки
            try {
                const errorText = await response.text();
                console.error('Текст ошибки:', errorText);
                
                if (errorText) {
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                }
            } catch (e) {
                console.error('Не удалось прочитать текст ошибки:', e);
            }
            
            throw new Error(errorMessage);
        }
        
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            console.log('Пустой ответ (204)');
            return null;
        }
        
        const result = await response.json();
        console.log('Успешный ответ:', result);
        return result;
        
    } catch (error) {
        console.error('API request failed:', {
            url,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

export const createEventSource = (endpoint) => {
    const url = `${API_BASE}${endpoint}`;
    console.log('Создание EventSource:', url);
    return new EventSource(url, {
        withCredentials: true
    });
};

export const register = async (username, password, email) => {
    try {
        const response = await fetch(`${API_BASE}/auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка регистрации');
        }
        
        const token = await response.text();
        if (token) {
            setToken(token);
            console.log('Токен получен при регистрации');
            return token;
        }
        throw new Error('Токен не получен');
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const authenticate = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка аутентификации');
        }
        
        const token = await response.text();
        if (token) {
            setToken(token);
            console.log('Токен получен при входе');
            return token;
        }
        throw new Error('Токен не получен');
    } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
    }
};

export const logout = () => {
    console.log('Выход из системы');
    token = '';
    localStorage.removeItem('jwtToken');
};

export const isAuthenticated = () => {
    const authenticated = !!token;
    console.log('Проверка аутентификации:', authenticated);
    return authenticated;
};