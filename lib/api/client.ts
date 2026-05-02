import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://mylifebook.ru";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export async function saveTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }
        original._retry = true;

        if (isRefreshing) {
            return new Promise((resolve) => {
                refreshQueue.push((token: string) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;
        try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                refresh_token: refreshToken,
            });
            const newAccess: string = data.access_token;
            await saveTokens(newAccess, refreshToken);

            refreshQueue.forEach((cb) => cb(newAccess));
            refreshQueue = [];

            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
        } catch (e) {
            refreshQueue = [];
            await clearTokens();
            return Promise.reject(e);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
