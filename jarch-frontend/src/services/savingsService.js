import { request, getHeaders } from './api';

export const savingsService = {
    async getProjectSavings(projectId) {
        return request(`/saving/project/${projectId}`, {
            headers: getHeaders()
        });
    },

    async getSaving(id) {
        return request(`/saving/${id}`, {
            headers: getHeaders()
        });
    }
};