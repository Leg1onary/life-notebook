import api, { saveTokens, clearTokens, getAccessToken } from "../api/client";

export async function login(username: string, password: string): Promise<void> {
    // OAuth2PasswordRequestForm ожидает application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const { data } = await api.post("/api/auth/login", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
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
