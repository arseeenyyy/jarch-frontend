import React from 'react';

const SaveItem = ({ save, onSelect, onDelete }) => {
    return (
        <div className="save-item" onClick={() => onSelect(save)}>
            <span>{save}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(save); }} className="secondary">
                🗑️
            </button>
        </div>
    );
};

export default SaveItem;