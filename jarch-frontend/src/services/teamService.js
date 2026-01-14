import { request, getHeaders } from './api';

export const teamService = {
    async addMember(projectId, memberData) {
        return request(`/team?projectId=${projectId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(memberData)
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