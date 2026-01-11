import React, { useRef, useEffect } from 'react';

const LogViewer = ({ logs }) => {
    const logContainerRef = useRef(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div>
            <h3>Логи генерации</h3>
            <div ref={logContainerRef}>
                {logs.map((log, index) => (
                    <div key={index}>
                        [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogViewer;