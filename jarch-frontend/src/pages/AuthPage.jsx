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
        setError('');
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
                window.dispatchEvent(new Event('authChange'));
                navigate('/');
            } else {
                throw new Error('Не удалось получить токен');
            }
        } catch (err) {
            setError("Такого пользователя не существует");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ 
                maxWidth: '400px',
                padding: '30px 20px',
                margin: '50px auto'
            }}>
                <h2 style={{ 
                    textAlign: 'center',
                    marginBottom: '20px',
                    color: 'var(--color-text-primary)'
                }}>
                    {isLogin ? '[вход]' : '[регистрация]'}
                </h2>
                
                {error && (
                    <div style={{ 
                        backgroundColor: 'var(--color-error-bg)',
                        color: 'var(--color-error)',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '2px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                    {!isLogin && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block',
                                color: 'var(--color-label)',
                                fontSize: '0.9rem',
                                marginBottom: '5px'
                            }}>
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Введите имя пользователя"
                                required
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    fontFamily: 'var(--font-family-main)',
                                    padding: '8px 0',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ 
                            display: 'block',
                            color: 'var(--color-label)',
                            fontSize: '0.9rem',
                            marginBottom: '5px'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Введите email"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '2px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-main)',
                                padding: '8px 0',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block',
                            color: 'var(--color-label)',
                            fontSize: '0.9rem',
                            marginBottom: '5px'
                        }}>
                            Пароль
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введите пароль"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '2px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-main)',
                                padding: '8px 0',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            display: 'block',
                            margin: '0 auto',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-button)',
                            fontFamily: 'var(--font-family-main)',
                            fontSize: '1rem',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'var(--color-button-hover)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'var(--color-button)';
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        {loading ? 'Загрузка...' : (isLogin ? '[Войти]' : '[Зарегистрироваться]')}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        disabled={loading}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-family-main)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = 'var(--color-button-hover)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'var(--color-text-secondary)';
                        }}
                    >
                        {isLogin ? '[нет аккаунта? зарегистрироваться]' : '[уже есть аккаунт? войти]'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;