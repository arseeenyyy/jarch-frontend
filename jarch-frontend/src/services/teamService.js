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

    async updateMember(projectId, memberId, memberData) {
        return request(`/team/${memberId}?projectId=${projectId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(memberData)
        });
    },

    async removeMember(projectId, memberId) {
        return request(`/team/${memberId}?projectId=${projectId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    }
};