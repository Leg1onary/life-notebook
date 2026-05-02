import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "../lib/db/client";
import { tasks, emotionLogs, notes, sections } from "../lib/db/schema";
import { isNull } from "drizzle-orm";
import { logout } from "../lib/auth";
import { sync } from "../lib/sync";
import {
    isBiometricsAvailable,
    isBiometricsEnabled,
    setBiometricsEnabled,
    authenticate,
} from "../lib/biometrics";

const VERSION = "1.0.0-mvp";

export default function SettingsScreen() {
    const router = useRouter();
    const [bioAvailable, setBioAvailable] = useState(false);
    const [bioEnabled, setBioEnabled] = useState(false);

    useEffect(() => {
        isBiometricsAvailable().then(setBioAvailable);
        isBiometricsEnabled().then(setBioEnabled);
    }, []);

    const handleToggleBio = async (value: boolean) => {
        if (value) {
            // Просим подтвердить перед включением
            const ok = await authenticate();
            if (!ok) return;
        }
        await setBiometricsEnabled(value);
        setBioEnabled(value);
    };

    const handleExport = async () => {
        const [t, e, n, s] = await Promise.all([
            db.select().from(tasks).where(isNull(tasks.deletedAt)),
            db.select().from(emotionLogs).where(isNull(emotionLogs.deletedAt)),
            db.select().from(notes).where(isNull(notes.deletedAt)),
            db.select().from(sections).where(isNull(sections.deletedAt)),
        ]);
        Alert.alert(
            "Данные собраны",
            `Задач: ${t.length}, эмоций: ${e.length}, разделов: ${s.length}\n\nЭкспорт в файл — Этап 4.`
        );
    };

    const handleSync = async () => {
        await sync();
        Alert.alert("Готово", "Синхронизация завершена");
    };

    const handleLogout = () => {
        Alert.alert(
            "Выйти из аккаунта?",
            "Токен будет удалён. Локальные данные останутся на устройстве.",
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Выйти",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: "#57a9ad", fontSize: 16 }}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={{ color: "#ece6dc", fontSize: 24, fontWeight: "700" }}>Настройки</Text>
                </View>

                {/* Данные */}
                <SectionTitle title="Данные" />
                <SettingsCard>
                    <SettingsRow icon="📤" label="Экспорт данных (JSON)" onPress={handleExport} />
                </SettingsCard>

                {/* Синхронизация */}
                <SectionTitle title="Синхронизация" />
                <SettingsCard>
                    <SettingsRow icon="☁️" label="Синхронизировать сейчас" onPress={handleSync} />
                </SettingsCard>

                {/* Безопасность */}
                <SectionTitle title="Безопасность" />
                <SettingsCard>
                    <View style={{
                        flexDirection: "row", alignItems: "center",
                        padding: 14, gap: 12,
                    }}>
                        <Text style={{ fontSize: 18 }}>🔒</Text>
                        <Text style={{
                            flex: 1,
                            color: bioAvailable ? "#ece6dc" : "#7d766d",
                            fontSize: 15,
                        }}>
                            {bioAvailable ? "Face ID / Touch ID" : "Biometrics недоступна"}
                        </Text>
                        {bioAvailable && (
                            <Switch
                                value={bioEnabled}
                                onValueChange={handleToggleBio}
                                trackColor={{ false: "#38342e", true: "#57a9ad" }}
                                thumbColor="#ece6dc"
                            />
                        )}
                    </View>
                </SettingsCard>

                {/* Аккаунт */}
                <SectionTitle title="Аккаунт" />
                <SettingsCard>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}
                    >
                        <Text style={{ fontSize: 18 }}>🚪</Text>
                        <Text style={{ flex: 1, color: "#e05c5c", fontSize: 15 }}>Выйти</Text>
                    </TouchableOpacity>
                </SettingsCard>

                {/* О приложении */}
                <SectionTitle title="О приложении" />
                <SettingsCard>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
                        <Text style={{ fontSize: 18 }}>ℹ️</Text>
                        <Text style={{ color: "#7d766d", fontSize: 15 }}>Версия {VERSION}</Text>
                    </View>
                </SettingsCard>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <Text style={{
            color: "#7d766d", fontSize: 12, fontWeight: "700",
            textTransform: "uppercase", letterSpacing: 1,
            marginBottom: 8, marginTop: 4,
        }}>
            {title}
        </Text>
    );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
    return (
        <View style={{
            backgroundColor: "#1d1c19", borderRadius: 14,
            borderWidth: 1, borderColor: "#38342e",
            overflow: "hidden", marginBottom: 20,
        }}>
            {children}
        </View>
    );
}

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}
        >
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <Text style={{ flex: 1, color: "#ece6dc", fontSize: 15 }}>{label}</Text>
            <Text style={{ color: "#7d766d" }}>›</Text>
        </TouchableOpacity>
    );
}
