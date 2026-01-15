import { request, createEventSource, getHeaders, getToken } from './api';

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

    async getJoinedProjects() {
        return request('/project/joined', {
            headers: getHeaders()
        });
    },

    async getProject(projectName) {
        return request(`/project?projectName=${encodeURIComponent(projectName)}`, {
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
        const eventSource = createEventSource(`/jarch/generate-project/stream/${id}`);

        eventSource.addEventListener("log", event => {
            try {
                const data = JSON.parse(event.data);
                if (onLog) onLog(data.level, data.message);
            } catch (e) {
                if (onLog) onLog("ERROR", `Ошибка парсинга лога: ${e.message}`);
            }
        });

        eventSource.addEventListener("zipReady", () => {
            if (onZipReady) onZipReady();
            eventSource.close();
        });

        eventSource.addEventListener("error", (event) => {
            console.error('SSE error:', event);
            if (onLog) onLog("ERROR", "Ошибка соединения с SSE потоком");
            eventSource.close();
        });

        eventSource.onopen = () => {
            if (onLog) onLog("INFO", "Подключен к потоку генерации");
        };

        return eventSource;
    }
};