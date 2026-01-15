import { request, getHeaders } from './api';

export const teamService = {
    async addMember(projectId, memberData) {
        const teamMember = {
            username: memberData.username
        };
        
        return request(`/team?projectId=${projectId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(teamMember)
        });
    },

    async getTeamMembers(projectId) {
        return request(`/team?projectId=${projectId}`, {
            headers: getHeaders()
        });
    },

    async removeMember(projectId, username) {
        return request(`/team?teamMember=${encodeURIComponent(username)}&projectId=${projectId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    }
};