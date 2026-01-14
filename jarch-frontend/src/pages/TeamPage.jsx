import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';

const TeamPage = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [members, setMembers] = useState([]);
    const [memberData, setMemberData] = useState({
        username: '',
        root: 'VIEWER'
    });
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

        if (!memberData.username.trim()) {
            setError('Введите имя пользователя');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await teamService.addMember(selectedProject, memberData);
            
            setMemberData({
                username: '',
                root: 'VIEWER'
            });
            loadTeamMembers();

        } catch (error) {
            console.error('Ошибка добавления участника:', error);
            setError('Ошибка добавления участника: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMemberChange = (e) => {
        setMemberData({
            ...memberData,
            [e.target.name]: e.target.value
        });
    };

    const handleRemoveMember = async (username) => {
        if (!selectedProject) {
            setError('Выберите проект');
            return;
        }

        const confirmDelete = window.confirm(`Удалить участника "${username}" из проекта?`);
        if (!confirmDelete) return;

        try {
            await teamService.removeMember(selectedProject, username);
            loadTeamMembers();
        } catch (error) {
            console.error('Ошибка удаления участника:', error);
            setError('Ошибка удаления участника: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Управление командой</h2>

            {error && (
                <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>
                    {error}
                </div>
            )}

            <div>
                <div>
                    <h3>Добавить участника</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Проект:</label>
                            <select 
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                required
                                disabled={loading}
                            >
                                <option value="">Выберите проект</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name} (ID: {project.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Имя пользователя:</label>
                            <input 
                                type="text" 
                                name="username"
                                value={memberData.username}
                                onChange={handleMemberChange}
                                placeholder="Введите username" 
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label>Уровень доступа:</label>
                            <select 
                                name="root"
                                value={memberData.root}
                                onChange={handleMemberChange}
                                required
                                disabled={loading}
                            >
                                <option value="VIEWER">Просмотр</option>
                                <option value="EDITOR">Редактирование</option>
                                <option value="ADMIN">Администратор</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !selectedProject}
                            style={{
                                display: "block",
                                textAlign: "left",
                                paddingLeft: "5px"
                            }}
                        >
                            {loading ? '[Добавление...]' : '[Добавить в команду]'}
                        </button>
                    </form>
                </div>

                <div>
                    <h3>Участники команды</h3>
                    <div>
                        <label>Выберите проект:</label>
                        <select 
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            disabled={loading}
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
                            <div>
                                {members.length === 0 ? (
                                    <p>Нет участников в этом проекте</p>
                                ) : (
                                    members.map(member => (
                                        <div key={member.id || member.username} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderBottom: '1px solid #ccc'
                                        }}>
                                            <div>
                                                <strong>{member.username}</strong>
                                                <br />
                                                <small>Доступ: {member.root}</small>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveMember(member.username)}
                                                disabled={loading}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button onClick={loadTeamMembers} disabled={loading}>
                                [Обновить список]
                            </button>
                        </>
                    ) : (
                        <p>Выберите проект чтобы увидеть участников</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamPage;