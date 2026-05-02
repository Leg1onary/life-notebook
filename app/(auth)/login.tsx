import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { login } from "../../lib/auth";
import { sync } from "../../lib/sync";

export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert("Ошибка", "Введи логин и пароль");
            return;
        }
        setLoading(true);
        try {
            await login(username.trim(), password.trim());
            sync(); // первый синк после входа
            router.replace("/(tabs)");
        } catch (e: any) {
            const msg =
                e?.response?.status === 401
                    ? "Неверный логин или пароль"
                    : "Не удалось подключиться к серверу";
            Alert.alert("Ошибка входа", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>

                    {/* Лого */}
                    <View style={{ alignItems: "center", marginBottom: 48 }}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>📓</Text>
                        <Text style={{ color: "#ece6dc", fontSize: 28, fontWeight: "700" }}>
                            Life Notebook
                        </Text>
                        <Text style={{ color: "#7d766d", fontSize: 14, marginTop: 6 }}>
                            личный дневник жизни
                        </Text>
                    </View>

                    {/* Поля */}
                    <View style={{ gap: 12, marginBottom: 24 }}>
                        <View>
                            <Text style={{ color: "#b2aa9f", fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
                                Логин
                            </Text>
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="username"
                                placeholderTextColor="#7d766d"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{
                                    backgroundColor: "#1d1c19",
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: "#38342e",
                                    color: "#ece6dc",
                                    fontSize: 16,
                                    padding: 14,
                                }}
                            />
                        </View>

                        <View>
                            <Text style={{ color: "#b2aa9f", fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
                                Пароль
                            </Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#7d766d"
                                secureTextEntry
                                autoCapitalize="none"
                                style={{
                                    backgroundColor: "#1d1c19",
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: "#38342e",
                                    color: "#ece6dc",
                                    fontSize: 16,
                                    padding: 14,
                                }}
                            />
                        </View>
                    </View>

                    {/* Кнопка */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? "#3a7a7d" : "#57a9ad",
                            borderRadius: 14,
                            paddingVertical: 16,
                            alignItems: "center",
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#171614" />
                        ) : (
                            <Text style={{ color: "#171614", fontWeight: "700", fontSize: 16 }}>
                                Войти
                            </Text>
                        )}
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
