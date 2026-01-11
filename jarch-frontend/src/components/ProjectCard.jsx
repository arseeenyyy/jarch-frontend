import React from 'react';

const ProjectCard = ({ project, onView }) => {
    return (
        <div className="project-item">
            <h4>{project.name}</h4>
            <p>{project.description || 'Без описания'}</p>
            <span className="status-badge status-active">Активен</span>
            <div>
                <button onClick={() => onView(project.id)} className="secondary">
                    Просмотр
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;