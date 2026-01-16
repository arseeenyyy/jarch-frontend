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

    async downloadProjectEntity(projectName) {
        console.log('Скачиваю entity для проекта:', projectName);
        const fileName = `${projectName}_entity.json`;
        return request(`/jarch/download-project-entity/${projectName}`, {
            headers: getHeaders()
        });
    },

    async downloadProjectApp(projectName) {
        console.log('Скачиваю app для проекта:', projectName);
        const fileName = `${projectName}_app.json`;
        return request(`/jarch/download-project-app/${projectName}`, {
            headers: getHeaders()
        });
    }
};