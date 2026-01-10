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
        return request(`/project/${id}`, {
            headers: getHeaders()
        });
    },

    async updateProject(id, projectData) {
        return request(`/project/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(projectData)
        });
    },

    async deleteProject(id) {
        return request(`/project/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
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