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

    async getSaves() {
        return request('/jarch/get-saves', {
            headers: getHeaders()
        });
    },

    async getSaveByName(saveName) {
        return request(`/jarch/save/${saveName}`, {
            headers: getHeaders()
        });
    },

    async updateSave(saveName, formData) {
        return request(`/jarch/save/${saveName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
    },

    async deleteSave(saveName) {
        return request(`/jarch/delete-save/${saveName}`, {
            method: 'DELETE',
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