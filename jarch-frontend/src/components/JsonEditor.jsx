import React, { useState } from 'react';

export const JSONEditor = ({ json, onChange, height = 300 }) => {
    const [text, setText] = useState(JSON.stringify(json, null, 2));
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        
        try {
            const parsed = JSON.parse(newText);
            setError(null);
            onChange(parsed);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatJSON = () => {
        try {
            const formatted = JSON.stringify(JSON.parse(text), null, 2);
            setText(formatted);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="json-editor">
            <div className="json-editor-header">
                <div className="json-editor-actions">
                    <button onClick={formatJSON} className="format-btn">
                        Форматировать
                    </button>
                    <button onClick={copyToClipboard} className="copy-btn">
                        📋 Копировать
                    </button>
                </div>
                {error && (
                    <div className="json-error">
                        ❌ Ошибка JSON: {error}
                    </div>
                )}
            </div>
            
            <textarea
                value={text}
                onChange={handleChange}
                style={{ height: `${height}px` }}
                className="json-textarea"
                spellCheck="false"
            />
        </div>
    );
};