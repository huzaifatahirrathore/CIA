import axios, { AxiosRequestConfig } from "axios";
import { tokenStore } from "./tokenStore";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
    withCredentials: true,  // needed so the httpOnly refreshToken cookie is sent
});

// Attach the in-memory access token to every request
apiClient.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    pendingQueue = [];
}

// On 401: try /auth/refresh once, retry the original request, then force logout
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

        const is401 = error.response?.status === 401;
        const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
        const alreadyRetried = originalRequest._retry;
        // Only refresh if the request actually sent a token — a 401 on an
        // unauthenticated endpoint (login, register) means wrong credentials,
        // not an expired token, so refreshing would just cause a hard redirect.
        const hadAuthHeader = !!(originalRequest.headers?.Authorization || originalRequest.headers?.authorization);

        if (!is401 || isRefreshEndpoint || alreadyRetried || !hadAuthHeader) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${token}`,
                };
                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await apiClient.post('/auth/refresh');
            const newToken: string = data.accessToken;
            tokenStore.set(newToken);
            processQueue(null, newToken);
            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
            };
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            tokenStore.clear();
            tokenStore.triggerUnauthenticated();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
