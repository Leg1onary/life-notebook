import api, { saveTokens, clearTokens, getAccessToken } from "../api/client";

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
}

export async function login(username: string, password: string): Promise<void> {
    const { data } = await api.post("/api/auth/login", { username, password });
    await saveTokens(data.access_token, data.refresh_token);
}

export async function logout(): Promise<void> {
    try {
        await api.post("/api/auth/logout");
    } catch {
        // ignore network errors on logout
    } finally {
        await clearTokens();
    }
}

export async function isLoggedIn(): Promise<boolean> {
    const token = await getAccessToken();
    return !!token;
}
