import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Сбрасываем ошибку при изменении
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let token;
            if (isLogin) {
                token = await authService.login(formData.email, formData.password);
            } else {
                token = await authService.register(formData.username, formData.password, formData.email);
            }
            
            if (token) {
                authService.setToken(token);
                // Принудительно обновляем состояние авторизации
                window.dispatchEvent(new Event('authChange'));
                // Перенаправляем на главную
                navigate('/');
            } else {
                throw new Error('Не удалось получить токен');
            }
        } catch (err) {
            setError(err.message || 'Произошла ошибка');
            console.error('Auth error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="brackets">{isLogin ? 'вход в систему' : 'регистрация'}</h2>
                
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>имя пользователя</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="введите имя пользователя"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="введите email"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="введите пароль"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="primary"
                        disabled={loading}
                    >
                        {loading ? 'загрузка...' : (isLogin ? 'войти' : 'зарегистрироваться')}
                    </button>
                </form>
                
                <div className="auth-switch-container text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        disabled={loading}
                    >
                        {isLogin ? 'нет аккаунта? зарегистрироваться' : 'уже есть аккаунт? войти'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;