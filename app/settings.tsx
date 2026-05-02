import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { db } from "../lib/db/client";
import { tasks, emotionLogs, notes, sections } from "../lib/db/schema";
import { isNull } from "drizzle-orm";

const VERSION = "1.0.0-mvp";

type SettingsItem = {
    label: string;
    icon: string;
    onPress: () => void;
    muted?: boolean;
};

type SettingsGroup = {
    title: string;
    items: SettingsItem[];
};

export default function SettingsScreen() {
    const router = useRouter();

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
        console.log(JSON.stringify({ tasks: t, emotionLogs: e, notes: n, sections: s, exportedAt: new Date().toISOString() }, null, 2));
    };

    const groups: SettingsGroup[] = [
        {
            title: "Данные",
            items: [
                { label: "Экспорт данных (JSON)", icon: "📤", onPress: handleExport },
            ],
        },
        {
            title: "Синхронизация",
            items: [
                {
                    label: "Сервер не настроен",
                    icon: "☁️",
                    muted: true,
                    onPress: () => Alert.alert("Этап 3", "Синхронизация будет добавлена в Этапе 3."),
                },
            ],
        },
        {
            title: "Безопасность",
            items: [
                {
                    label: "Face ID / PIN",
                    icon: "🔒",
                    muted: true,
                    onPress: () => Alert.alert("Этап 4", "Биометрия будет добавлена в Этапе 4."),
                },
            ],
        },
        {
            title: "О приложении",
            items: [
                { label: `Версия ${VERSION}`, icon: "ℹ️", muted: true, onPress: () => {} },
            ],
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: "#57a9ad", fontSize: 16 }}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={{ color: "#ece6dc", fontSize: 24, fontWeight: "700" }}>Настройки</Text>
                </View>

                {groups.map((group) => (
                    <View key={group.title} style={{ marginBottom: 24 }}>
                        <Text style={{
                            color: "#7d766d", fontSize: 12, fontWeight: "700",
                            textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
                        }}>
                            {group.title}
                        </Text>
                        <View style={{
                            backgroundColor: "#1d1c19", borderRadius: 14,
                            borderWidth: 1, borderColor: "#38342e", overflow: "hidden",
                        }}>
                            {group.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.label}
                                    onPress={item.onPress}
                                    style={{
                                        flexDirection: "row", alignItems: "center", gap: 12,
                                        padding: 14,
                                        borderTopWidth: idx > 0 ? 1 : 0,
                                        borderTopColor: "#38342e",
                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                                    <Text style={{ flex: 1, color: item.muted ? "#7d766d" : "#ece6dc", fontSize: 15 }}>
                                        {item.label}
                                    </Text>
                                    {!item.muted && <Text style={{ color: "#7d766d" }}>›</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}