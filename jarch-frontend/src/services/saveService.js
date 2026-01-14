import { request, getHeaders, getToken } from './api';

export const saveService = {
    // Работа с файлами в MinIO
    async createSave(formData) {
        return request('/jarch/make-save', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
    },

    async getSaves() {
        return request('/jarch/get-saves', {
            headers: getHeaders()
        });
    },

    async downloadConfig(saveName) {
        return request(`/jarch/download-config-file/${saveName}`, {
            headers: getHeaders()
        });
    },

    async downloadEntity(saveName) {
        return request(`/jarch/download-entity-file/${saveName}`, {
            headers: getHeaders()
        });
    }
};