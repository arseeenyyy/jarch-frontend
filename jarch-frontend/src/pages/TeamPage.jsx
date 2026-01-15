import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';

const TeamPage = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [members, setMembers] = useState([]);
    const [memberUsername, setMemberUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadTeamMembers();
        }
    }, [selectedProject]);

    const loadProjects = async () => {
        try {
            setError('');
            const userProjects = await projectService.getUserProjects();
            setProjects(userProjects);
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
            setError('Ошибка загрузки проектов');
        }
    };

    const loadTeamMembers = async () => {
        if (!selectedProject) return;
        
        try {
            setError('');
            const teamMembers = await teamService.getTeamMembers(selectedProject);
            setMembers(teamMembers);
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
            setError('Ошибка загрузки участников команды');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }

        if (!memberUsername.trim()) {
            setError('Введите имя пользователя');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await teamService.addMember(selectedProject, {
                username: memberUsername
            });
            
            setMemberUsername('');
            loadTeamMembers();
        } catch (error) {
            console.error('Ошибка добавления участника:', error);
            setError('Ошибка добавления участника');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (username) => {
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }

        if (!window.confirm(`Удалить участника "${username}" из проекта?`)) return;

        try {
            await teamService.removeMember(selectedProject, username);
            loadTeamMembers();
        } catch (error) {
            console.error('Ошибка удаления участника:', error);
            setError('Ошибка удаления участника');
        }
    };

    return (
        <div className="team-page">
            <h2>Управление командой</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="team-content">
                <div className="add-member-section">
                    <h3>Добавить участника</h3>
                    <form onSubmit={handleSubmit} className="member-form">
                        <div className="form-group">
                            <label>Проект:</label>
                            <select 
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                required
                                disabled={loading}
                                className="project-select"
                            >
                                <option value="">Выберите проект</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name} (ID: {project.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Имя пользователя:</label>
                            <input 
                                type="text" 
                                value={memberUsername}
                                onChange={(e) => setMemberUsername(e.target.value)}
                                placeholder="Введите username" 
                                required 
                                disabled={loading}
                            />
                            <div className="form-hint">
                                Участник будет добавлен с правами VIEWER
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !selectedProject}
                            className="submit-button"
                        >
                            {loading ? '[Добавление...]' : '[Добавить в команду]'}
                        </button>
                    </form>
                </div>

                <div className="members-list-section">
                    <h3>Участники команды</h3>
                    <div className="form-group">
                        <label>Выберите проект:</label>
                        <select 
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            disabled={loading}
                            className="project-select"
                        >
                            <option value="">Выберите проект</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name} (ID: {project.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedProject ? (
                        <>
                            <div className="members-list">
                                {members.length === 0 ? (
                                    <p className="no-members">Нет участников в этом проекте</p>
                                ) : (
                                    members.map(member => (
                                        <div key={member.id || member.username} className="member-item">
                                            <div className="member-info">
                                                <div className="member-username">{member.username}</div>
                                                <div className="member-role">Роль: {member.root || 'VIEWER'}</div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveMember(member.username)}
                                                disabled={loading}
                                                className="remove-button"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button 
                                onClick={loadTeamMembers} 
                                disabled={loading}
                                className="refresh-button"
                            >
                                [Обновить список]
                            </button>
                        </>
                    ) : (
                        <p className="select-project-hint">Выберите проект чтобы увидеть участников</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamPage;