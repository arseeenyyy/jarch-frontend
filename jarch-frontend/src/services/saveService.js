import { request, getHeaders, getToken } from './api';

export const saveService = {
    async createSave(formData) {
        return request('/jarch/make-save', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
    },

    async saveToProject(formData) {
        return request('/jarch/save-to-project', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
    },

    async getProjectSaves(projectName) {
        return request(`/jarch/get-project-saves/${projectName}`, {
            headers: getHeaders()
        });
    },

    async hasProjectSaves(projectName) {
        return request(`/jarch/has-project-saves/${projectName}`, {
            headers: getHeaders()
        });
    },

    async downloadConfigByProject(projectName, saveName) {
        return request(`/jarch/download-config-file/${projectName}/${saveName}`, {
            headers: getHeaders()
        });
    },

    async downloadEntityByProject(projectName, saveName) {
        return request(`/jarch/download-entity-file/${projectName}/${saveName}`, {
            headers: getHeaders()
        });
    }
};