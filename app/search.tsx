import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { db } from "../lib/db/client";
import { tasks, emotionLogs, notes } from "../lib/db/schema";
import { isNull, like, and } from "drizzle-orm";
import { CATEGORY_META } from "../lib/emotions";
import type { EmotionCategory } from "../lib/emotions";

type ResultItem =
    | { type: "task"; id: string; title: string; isDone: boolean }
    | { type: "emotion"; id: string; emotion: string; situation: string; category: EmotionCategory; createdAt: string }
    | { type: "note"; id: string; title: string; body: string };

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ResultItem[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.trim().length < 2) { setResults([]); setSearched(false); return; }
        const q = `%${text.trim()}%`;

        const [foundTasks, foundEmotions, foundNotes] = await Promise.all([
            db.select().from(tasks).where(and(isNull(tasks.deletedAt), like(tasks.title, q))),
            db.select().from(emotionLogs).where(and(isNull(emotionLogs.deletedAt), like(emotionLogs.situation, q))),
            db.select().from(notes).where(and(isNull(notes.deletedAt), like(notes.title, q))),
        ]);

        const merged: ResultItem[] = [
            ...foundTasks.map((t) => ({ type: "task" as const, id: t.id, title: t.title, isDone: Boolean(t.isDone) })),
            ...foundEmotions.map((e) => ({ type: "emotion" as const, id: e.id, emotion: e.emotion, situation: e.situation, category: (e.emotionCategory ?? "other") as EmotionCategory, createdAt: e.createdAt })),
            ...foundNotes.map((n) => ({ type: "note" as const, id: n.id, title: n.title, body: n.body })),
        ];
        setResults(merged);
        setSearched(true);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: "#57a9ad", fontSize: 16 }}>← Назад</Text>
                    </TouchableOpacity>
                    <TextInput
                        autoFocus
                        placeholder="Поиск по всем записям..."
                        placeholderTextColor="#7d766d"
                        value={query}
                        onChangeText={handleSearch}
                        style={{
                            flex: 1, backgroundColor: "#1d1c19", borderRadius: 12,
                            borderWidth: 1, borderColor: "#38342e",
                            color: "#ece6dc", fontSize: 15, padding: 12,
                        }}
                    />
                </View>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                {!searched && (
                    <Text style={{ color: "#7d766d", fontSize: 14, textAlign: "center", marginTop: 60 }}>
                        Введи минимум 2 символа
                    </Text>
                )}
                {searched && results.length === 0 && (
                    <Text style={{ color: "#7d766d", fontSize: 14, textAlign: "center", marginTop: 60 }}>
                        Ничего не найдено по «{query}»
                    </Text>
                )}

                <View style={{ gap: 8, marginTop: 8 }}>
                    {results.map((item) => {
                        if (item.type === "task") return (
                            <View key={item.id} style={{
                                backgroundColor: "#1d1c19", borderRadius: 12,
                                borderWidth: 1, borderColor: "#38342e", padding: 12,
                                flexDirection: "row", alignItems: "center", gap: 10,
                            }}>
                                <Text style={{ fontSize: 16 }}>✅</Text>
                                <Text style={{
                                    flex: 1, color: item.isDone ? "#7d766d" : "#ece6dc", fontSize: 15,
                                    textDecorationLine: item.isDone ? "line-through" : "none",
                                }}>{item.title}</Text>
                                <Text style={{ color: "#7d766d", fontSize: 11 }}>задача</Text>
                            </View>
                        );

                        if (item.type === "emotion") {
                            const meta = CATEGORY_META[item.category] ?? CATEGORY_META.calm;
                            return (
                                <View key={item.id} style={{
                                    backgroundColor: "#1d1c19", borderRadius: 12,
                                    borderWidth: 1, borderColor: "#38342e", padding: 12, gap: 6,
                                }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <View style={{
                                            paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999,
                                            backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + "44",
                                        }}>
                                            <Text style={{ color: meta.color, fontWeight: "700", fontSize: 12 }}>{item.emotion}</Text>
                                        </View>
                                        <Text style={{ color: "#7d766d", fontSize: 11 }}>{formatDate(item.createdAt)}</Text>
                                    </View>
                                    <Text style={{ color: "#b2aa9f", fontSize: 14 }} numberOfLines={2}>{item.situation}</Text>
                                </View>
                            );
                        }

                        return (
                            <View key={item.id} style={{
                                backgroundColor: "#1d1c19", borderRadius: 12,
                                borderWidth: 1, borderColor: "#38342e", padding: 12, gap: 4,
                            }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: "#ece6dc", fontWeight: "600", fontSize: 15 }}>{item.title}</Text>
                                    <Text style={{ color: "#7d766d", fontSize: 11 }}>заметка</Text>
                                </View>
                                {item.body ? <Text style={{ color: "#b2aa9f", fontSize: 13 }} numberOfLines={2}>{item.body}</Text> : null}
                            </View>
                        );
                    })}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}