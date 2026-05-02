import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTaskStore } from "../../lib/store/taskStore";
import { useEmotionStore } from "../../lib/store/emotionStore";
import { useSectionStore } from "../../lib/store/sectionStore";

function getTodayGreeting() {
    const h = new Date().getHours();
    if (h < 6) return "Доброй ночи";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
}

function formatToday() {
    return new Date().toLocaleDateString("ru-RU", {
        weekday: "long", day: "numeric", month: "long",
    });
}

export default function HomeScreen() {
    const router = useRouter();
    const { tasks, loadTasks } = useTaskStore();
    const { logs, loadLogs } = useEmotionStore();
    const { sections, loadSections } = useSectionStore();

    useEffect(() => {
        loadTasks();
        loadLogs();
        loadSections();
    }, []);

    const activeTasks = tasks.filter((t) => !t.isDone);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter((l) => new Date(l.createdAt) >= todayStart);
    const recentTasks = activeTasks.slice(0, 4);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>

                {/* Заголовок */}
                <Text style={{ color: "#7d766d", fontSize: 13, marginTop: 16 }}>
                    {formatToday()}
                </Text>
                <Text style={{ color: "#ece6dc", fontSize: 28, fontWeight: "700", marginTop: 2, marginBottom: 16 }}>
                    {getTodayGreeting()} 👋
                </Text>

                {/* Поиск + Настройки */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => router.push("/search")}
                        style={{
                            flex: 1, backgroundColor: "#1d1c19",
                            borderRadius: 12, borderWidth: 1, borderColor: "#38342e",
                            padding: 12, flexDirection: "row", alignItems: "center", gap: 8,
                        }}
                    >
                        <Text style={{ fontSize: 16 }}>🔍</Text>
                        <Text style={{ color: "#7d766d", fontSize: 14 }}>Поиск по записям...</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/settings")}
                        style={{
                            backgroundColor: "#1d1c19", borderRadius: 12,
                            borderWidth: 1, borderColor: "#38342e",
                            padding: 12, alignItems: "center", justifyContent: "center", width: 46,
                        }}
                    >
                        <Text style={{ fontSize: 18 }}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Счётчики */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                    {[
                        { value: activeTasks.length, label: "задач", color: "#57a9ad" },
                        { value: todayLogs.length, label: "эмоций сегодня", color: "#d777a0" },
                        { value: sections.length, label: "разделов", color: "#a07ad8" },
                    ].map((s) => (
                        <View key={s.label} style={{
                            flex: 1, backgroundColor: "#1d1c19",
                            borderRadius: 14, borderWidth: 1, borderColor: "#38342e",
                            padding: 12, alignItems: "center", gap: 2,
                        }}>
                            <Text style={{ color: s.color, fontSize: 26, fontWeight: "700" }}>{s.value}</Text>
                            <Text style={{ color: "#7d766d", fontSize: 11, textAlign: "center" }}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Быстрые действия */}
                <Text style={{ color: "#b2aa9f", fontWeight: "700", fontSize: 15, marginBottom: 10 }}>
                    Быстрые действия
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                    {[
                        { label: "Задача", icon: "✅", tab: "/(tabs)/todo" },
                        { label: "Эмоция", icon: "🧠", tab: "/(tabs)/psychology" },
                        { label: "Раздел", icon: "📂", tab: "/(tabs)/sections" },
                    ].map((a) => (
                        <TouchableOpacity
                            key={a.label}
                            onPress={() => router.push(a.tab as any)}
                            style={{
                                flex: 1, backgroundColor: "#1d1c19",
                                borderRadius: 14, borderWidth: 1, borderColor: "#38342e",
                                padding: 14, alignItems: "center", gap: 6,
                            }}
                        >
                            <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                            <Text style={{ color: "#b2aa9f", fontSize: 13, fontWeight: "600" }}>{a.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Ближайшие задачи */}
                {recentTasks.length > 0 && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <Text style={{ color: "#b2aa9f", fontWeight: "700", fontSize: 15 }}>Активные задачи</Text>
                            <TouchableOpacity onPress={() => router.push("/(tabs)/todo" as any)}>
                                <Text style={{ color: "#57a9ad", fontSize: 13 }}>Все →</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ gap: 8, marginBottom: 20 }}>
                            {recentTasks.map((task) => (
                                <View key={task.id} style={{
                                    backgroundColor: "#1d1c19", borderRadius: 12,
                                    borderWidth: 1, borderColor: "#38342e",
                                    padding: 12, flexDirection: "row", alignItems: "center", gap: 10,
                                }}>
                                    <View style={{
                                        width: 20, height: 20, borderRadius: 6,
                                        borderWidth: 2, borderColor: "#38342e",
                                    }} />
                                    <Text style={{ color: "#ece6dc", fontSize: 15, flex: 1 }}>{task.title}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Разделы */}
                {sections.length > 0 && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <Text style={{ color: "#b2aa9f", fontWeight: "700", fontSize: 15 }}>Разделы</Text>
                            <TouchableOpacity onPress={() => router.push("/(tabs)/sections" as any)}>
                                <Text style={{ color: "#57a9ad", fontSize: 13 }}>Все →</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                {sections.map((s) => (
                                    <TouchableOpacity
                                        key={s.id}
                                        onPress={() => router.push(`/section/${s.id}` as any)}
                                        style={{
                                            backgroundColor: "#1d1c19", borderRadius: 14,
                                            borderWidth: 1, borderColor: "#38342e",
                                            padding: 14, alignItems: "center", gap: 6, minWidth: 80,
                                        }}
                                    >
                                        <Text style={{ fontSize: 24 }}>{s.icon}</Text>
                                        <Text style={{ color: "#b2aa9f", fontSize: 12, fontWeight: "600" }}>{s.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}