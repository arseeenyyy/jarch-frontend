import { request, getHeaders, getToken } from './api';

export const projectService = {
    async createProject(projectData) {
        return request('/project/save', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(projectData)
        });
    },

    async getUserProjects() {
        return request('/project/all', {
            headers: getHeaders()
        });
    },

    async getProject(id) {
        return request(`/project?projectId=${id}`, {
            headers: getHeaders()
        });
    },

    async updateProject(id, projectData) {
        console.warn('Update project endpoint not implemented');
        throw new Error('Update project endpoint not implemented');
    },

    async deleteProject(id) {
        console.warn('Delete project endpoint not implemented');
        throw new Error('Delete project endpoint not implemented');
    },

    async generateProject(formData) {
        return request('/jarch/generate-project', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
    },

    async downloadProject(id) {
        return request(`/jarch/generate-project/download/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
    },

    startGenerationStream(id, onLog, onZipReady) {
        const eventSource = new EventSource(`http://localhost:8080/jarch/generate-project/stream/${id}?token=${encodeURIComponent(getToken())}`);

        eventSource.addEventListener("log", event => {
            const data = JSON.parse(event.data);
            if (onLog) onLog(data.level, data.message);
        });

        eventSource.addEventListener("zipReady", () => {
            if (onZipReady) onZipReady();
            eventSource.close();
        });

        eventSource.addEventListener("error", () => {
            if (onLog) onLog("ERROR", "Ошибка соединения с SSE потоком");
            eventSource.close();
        });

        return eventSource;
    }
};