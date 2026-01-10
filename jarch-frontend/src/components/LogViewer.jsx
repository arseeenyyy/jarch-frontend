import React, { useRef, useEffect } from 'react';

const LogViewer = ({ logs }) => {
    const logContainerRef = useRef(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <>
            <h3 style={{ marginTop: '30px' }}>Логи генерации:</h3>
            <div ref={logContainerRef} className="log-container">
                {logs.map((log, index) => (
                    <div key={index} className={`log-${log.level.toLowerCase()}`}>
                        [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                    </div>
                ))}
            </div>
        </>
    );
};

export default LogViewer;