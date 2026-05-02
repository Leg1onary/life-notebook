import { useEffect, useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, Pressable, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEmotionStore, NewEmotionLog } from "../../lib/store/emotionStore";
import { EMOTIONS, CATEGORY_META, EmotionCategory } from "../../lib/emotions";

type Step = "list" | "pick" | "form";

const QUICK_EMOTIONS = ["Тревога", "Раздражение", "Обида", "Злость", "Печаль", "Стыд", "Радость", "Спокойствие"];

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default function PsychologyScreen() {
    const { logs, loadLogs, addLog, deleteLog } = useEmotionStore();
    const [step, setStep] = useState<Step>("list");
    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<EmotionCategory>("other" as EmotionCategory);
    const [situation, setSituation] = useState("");
    const [bodyReaction, setBodyReaction] = useState("");
    const [thought, setThought] = useState("");
    const [desiredAction, setDesiredAction] = useState("");
    const [contextTag, setContextTag] = useState("");
    const [filterCat, setFilterCat] = useState<EmotionCategory | "all">("all");

    useEffect(() => { loadLogs(); }, []);

    const pickEmotion = (name: string) => {
        const found = EMOTIONS.find((e) => e.name === name);
        setSelectedEmotion(name);
        setSelectedCategory(found?.category ?? "other" as EmotionCategory);
        setStep("form");
    };

    const handleSave = async () => {
        if (!situation.trim()) {
            Alert.alert("Укажи ситуацию", "Опиши что произошло — это самое важное поле.");
            return;
        }
        const data: NewEmotionLog = {
            emotion: selectedEmotion,
            emotionCategory: selectedCategory,
            situation: situation.trim(),
            bodyReaction: bodyReaction.trim() || undefined,
            thought: thought.trim() || undefined,
            desiredAction: desiredAction.trim() || undefined,
            contextTag: contextTag.trim() || undefined,
        };
        await addLog(data);
        setSituation(""); setBodyReaction(""); setThought("");
        setDesiredAction(""); setContextTag(""); setSelectedEmotion("");
        setStep("list");
    };

    const handleDelete = (id: string) => {
        Alert.alert("Удалить запись?", "", [
            { text: "Отмена", style: "cancel" },
            { text: "Удалить", style: "destructive", onPress: () => deleteLog(id) },
        ]);
    };

    const filteredLogs = filterCat === "all"
        ? logs
        : logs.filter((l) => l.emotionCategory === filterCat);

    // Экран выбора эмоции
    if (step === "pick") {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 12 }}>
                    <TouchableOpacity onPress={() => setStep("list")}>
                        <Text style={{ color: "#57a9ad", fontSize: 16 }}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={{ color: "#ece6dc", fontSize: 20, fontWeight: "700" }}>Выбери эмоцию</Text>
                </View>
                <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                    {(Object.keys(CATEGORY_META) as EmotionCategory[]).map((cat) => {
                        const meta = CATEGORY_META[cat];
                        const catEmotions = EMOTIONS.filter((e) => e.category === cat);
                        return (
                            <View key={cat} style={{ marginBottom: 20 }}>
                                <Text style={{ color: meta.color, fontWeight: "700", fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                                    {meta.label}
                                </Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                    {catEmotions.map((e) => (
                                        <TouchableOpacity key={e.name} onPress={() => pickEmotion(e.name)}>
                                            <View style={{
                                                paddingHorizontal: 14, paddingVertical: 8,
                                                borderRadius: 999,
                                                backgroundColor: meta.bg,
                                                borderWidth: 1, borderColor: meta.color + "44",
                                            }}>
                                                <Text style={{ color: meta.color, fontWeight: "600", fontSize: 14 }}>{e.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Экран формы записи
    if (step === "form") {
        const meta = CATEGORY_META[selectedCategory as EmotionCategory] ?? CATEGORY_META.calm;
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 16, gap: 12, marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => setStep("pick")}>
                                <Text style={{ color: "#57a9ad", fontSize: 16 }}>← Назад</Text>
                            </TouchableOpacity>
                            <View style={{
                                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
                                backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + "66",
                            }}>
                                <Text style={{ color: meta.color, fontWeight: "700" }}>{selectedEmotion}</Text>
                            </View>
                        </View>

                        {[
                            { label: "Ситуация *", value: situation, set: setSituation, placeholder: "Что произошло? Опиши коротко.", required: true },
                            { label: "Реакция тела", value: bodyReaction, set: setBodyReaction, placeholder: "Что почувствовал физически? Сжатие, тепло, дрожь..." },
                            { label: "Мысль", value: thought, set: setThought, placeholder: "Что подумал в этот момент?" },
                            { label: "Как хочу отреагировать", value: desiredAction, set: setDesiredAction, placeholder: "Что было бы лучшей реакцией?" },
                        ].map((field) => (
                            <View key={field.label} style={{ marginBottom: 16 }}>
                                <Text style={{ color: "#b2aa9f", fontSize: 13, fontWeight: "600", marginBottom: 6 }}>{field.label}</Text>
                                <TextInput
                                    multiline
                                    value={field.value}
                                    onChangeText={field.set}
                                    placeholder={field.placeholder}
                                    placeholderTextColor="#7d766d"
                                    style={{
                                        backgroundColor: "#1d1c19", borderRadius: 12,
                                        borderWidth: 1, borderColor: "#38342e",
                                        color: "#ece6dc", fontSize: 15, padding: 12,
                                        minHeight: 80, textAlignVertical: "top",
                                    }}
                                />
                            </View>
                        ))}

                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: "#b2aa9f", fontSize: 13, fontWeight: "600", marginBottom: 6 }}>Тег контекста</Text>
                            <TextInput
                                value={contextTag}
                                onChangeText={setContextTag}
                                placeholder="напр. контакт с кем-то, работа, бытовое"
                                placeholderTextColor="#7d766d"
                                style={{
                                    backgroundColor: "#1d1c19", borderRadius: 12,
                                    borderWidth: 1, borderColor: "#38342e",
                                    color: "#ece6dc", fontSize: 15, padding: 12,
                                }}
                            />
                        </View>

                        <TouchableOpacity onPress={handleSave} style={{
                            backgroundColor: "#57a9ad", borderRadius: 12,
                            paddingVertical: 14, alignItems: "center", marginBottom: 40,
                        }}>
                            <Text style={{ color: "#171614", fontWeight: "700", fontSize: 16 }}>Сохранить запись</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Главный экран — список + быстрые кнопки
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                <Text style={{ color: "#7d766d", fontSize: 13, marginTop: 16 }}>наблюдения и рефлексия</Text>
                <Text style={{ color: "#ece6dc", fontSize: 28, fontWeight: "700", marginTop: 4, marginBottom: 16 }}>Психолог</Text>

                {/* Быстрые эмоции */}
                <View style={{
                    backgroundColor: "#1d1c19", borderRadius: 16,
                    borderWidth: 1, borderColor: "#2a3838",
                    padding: 14, marginBottom: 16,
                }}>
                    <Text style={{ color: "#7d766d", fontSize: 12, marginBottom: 10 }}>что сейчас?</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {QUICK_EMOTIONS.map((name) => {
                            const found = EMOTIONS.find((e) => e.name === name);
                            const meta = found ? CATEGORY_META[found.category] : CATEGORY_META.calm;
                            return (
                                <TouchableOpacity key={name} onPress={() => pickEmotion(name)}>
                                    <View style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                                        backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + "44",
                                    }}>
                                        <Text style={{ color: meta.color, fontWeight: "600", fontSize: 14 }}>{name}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity onPress={() => setStep("pick")}>
                            <View style={{
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                                backgroundColor: "#24221f", borderWidth: 1, borderColor: "#38342e",
                            }}>
                                <Text style={{ color: "#b2aa9f", fontWeight: "600", fontSize: 14 }}>Все эмоции →</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Фильтры журнала */}
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: "#b2aa9f", fontWeight: "700", fontSize: 15, marginBottom: 10 }}>Журнал</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            {[{ label: "Все", value: "all" }, ...(Object.keys(CATEGORY_META) as EmotionCategory[]).map((k) => ({ label: CATEGORY_META[k].label, value: k }))].map((f) => (
                                <TouchableOpacity key={f.value} onPress={() => setFilterCat(f.value as EmotionCategory | "all")}>
                                    <View style={{
                                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                                        backgroundColor: filterCat === f.value ? "#57a9ad" : "#1d1c19",
                                        borderWidth: 1, borderColor: filterCat === f.value ? "#57a9ad" : "#38342e",
                                    }}>
                                        <Text style={{ color: filterCat === f.value ? "#171614" : "#b2aa9f", fontWeight: "600", fontSize: 12 }}>
                                            {f.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Список записей */}
                <View style={{ gap: 10 }}>
                    {filteredLogs.length === 0 && (
                        <View style={{ padding: 32, alignItems: "center" }}>
                            <Text style={{ color: "#7d766d", fontSize: 15 }}>Записей пока нет</Text>
                        </View>
                    )}
                    {filteredLogs.map((log) => {
                        const meta = CATEGORY_META[log.emotionCategory as EmotionCategory] ?? CATEGORY_META.calm;
                        return (
                            <View key={log.id} style={{
                                backgroundColor: "#1d1c19", borderRadius: 14,
                                borderWidth: 1, borderColor: "#38342e", padding: 14, gap: 8,
                            }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <View style={{
                                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
                                        backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + "44",
                                    }}>
                                        <Text style={{ color: meta.color, fontWeight: "700", fontSize: 13 }}>{log.emotion}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(log.id)}>
                                        <Text style={{ color: "#7d766d", fontSize: 18 }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ color: "#ece6dc", fontSize: 15 }}>{log.situation}</Text>
                                {log.bodyReaction ? <Text style={{ color: "#b2aa9f", fontSize: 13 }}>🫀 {log.bodyReaction}</Text> : null}
                                {log.contextTag ? (
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={{ backgroundColor: "#24221f", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                                            <Text style={{ color: "#7d766d", fontSize: 12 }}>{log.contextTag}</Text>
                                        </View>
                                    </View>
                                ) : null}
                                <Text style={{ color: "#7d766d", fontSize: 12 }}>{formatDate(log.createdAt)}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <Pressable
                onPress={() => setStep("pick")}
                style={{
                    position: "absolute", right: 20, bottom: 20,
                    width: 56, height: 56, borderRadius: 18,
                    backgroundColor: "#57a9ad",
                    alignItems: "center", justifyContent: "center",
                    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
                }}
            >
                <Text style={{ color: "#171614", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
            </Pressable>
        </SafeAreaView>
    );
}