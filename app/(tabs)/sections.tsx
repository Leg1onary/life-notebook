import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, Pressable, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSectionStore } from "../../lib/store/sectionStore";

const ICONS = ["📁", "🏠", "🚗", "💼", "🗂️", "❤️", "💪", "🌱", "📚", "🎯", "💡", "🔧", "✈️", "🎮", "💰", "🍎"];
const COLORS = ["#57a9ad", "#7fb159", "#db9a47", "#d777a0", "#a07ad8", "#d77070", "#7aabd8", "#d4a012"];

export default function SectionsScreen() {
    const router = useRouter();
    const { sections, loadSections, addSection, deleteSection } = useSectionStore();
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("📁");
    const [color, setColor] = useState("#57a9ad");

    useEffect(() => { loadSections(); }, []);

    const handleAdd = async () => {
        if (!name.trim()) return;
        await addSection(name.trim(), icon, color);
        setName(""); setIcon("📁"); setColor("#57a9ad");
        setAdding(false);
    };

    const handleDelete = (id: string, sectionName: string) => {
        Alert.alert(`Удалить «${sectionName}»?`, "Раздел будет удалён.", [
            { text: "Отмена", style: "cancel" },
            { text: "Удалить", style: "destructive", onPress: () => deleteSection(id) },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                <Text style={{ color: "#7d766d", fontSize: 13, marginTop: 16 }}>всё по полочкам</Text>
                <Text style={{ color: "#ece6dc", fontSize: 28, fontWeight: "700", marginTop: 4, marginBottom: 20 }}>Разделы</Text>

                {/* Сетка разделов */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {sections.map((s) => (
                        <TouchableOpacity
                            key={s.id}
                            onPress={() => router.push(`/section/${s.id}` as any)}
                            onLongPress={() => handleDelete(s.id, s.name)}
                            style={{
                                width: "47%",
                                backgroundColor: "#1d1c19",
                                borderRadius: 16, borderWidth: 1, borderColor: "#38342e",
                                padding: 16, gap: 8,
                            }}
                        >
                            <View style={{
                                width: 44, height: 44, borderRadius: 12,
                                backgroundColor: s.color + "22",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                            </View>
                            <Text style={{ color: "#ece6dc", fontWeight: "600", fontSize: 15 }}>{s.name}</Text>
                            <View style={{ width: 24, height: 3, borderRadius: 2, backgroundColor: s.color }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Форма добавления */}
                {adding && (
                    <View style={{
                        backgroundColor: "#1d1c19", borderRadius: 16,
                        borderWidth: 1, borderColor: "#57a9ad",
                        padding: 16, marginTop: 16, gap: 12,
                    }}>
                        <Text style={{ color: "#b2aa9f", fontWeight: "700" }}>Новый раздел</Text>

                        <TextInput
                            autoFocus
                            placeholder="Название"
                            placeholderTextColor="#7d766d"
                            value={name}
                            onChangeText={setName}
                            style={{
                                backgroundColor: "#24221f", borderRadius: 10,
                                borderWidth: 1, borderColor: "#38342e",
                                color: "#ece6dc", fontSize: 15, padding: 12,
                            }}
                        />

                        <Text style={{ color: "#7d766d", fontSize: 12 }}>Иконка</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {ICONS.map((ic) => (
                                <TouchableOpacity key={ic} onPress={() => setIcon(ic)}>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        backgroundColor: icon === ic ? "#2a3838" : "#24221f",
                                        borderWidth: 1, borderColor: icon === ic ? "#57a9ad" : "#38342e",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Text style={{ fontSize: 20 }}>{ic}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ color: "#7d766d", fontSize: 12 }}>Цвет</Text>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            {COLORS.map((c) => (
                                <TouchableOpacity key={c} onPress={() => setColor(c)}>
                                    <View style={{
                                        width: 32, height: 32, borderRadius: 10,
                                        backgroundColor: c,
                                        borderWidth: 2, borderColor: color === c ? "#ece6dc" : "transparent",
                                    }} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <TouchableOpacity onPress={handleAdd} style={{
                                flex: 1, backgroundColor: "#57a9ad", borderRadius: 10,
                                paddingVertical: 12, alignItems: "center",
                            }}>
                                <Text style={{ color: "#171614", fontWeight: "700" }}>Создать</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setAdding(false)} style={{
                                backgroundColor: "#24221f", borderRadius: 10,
                                paddingVertical: 12, paddingHorizontal: 16, alignItems: "center",
                            }}>
                                <Text style={{ color: "#b2aa9f" }}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Text style={{ color: "#7d766d", fontSize: 12, marginTop: 16, textAlign: "center" }}>
                    Удержи карточку чтобы удалить раздел
                </Text>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            {!adding && (
                <Pressable
                    onPress={() => setAdding(true)}
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
            )}
        </SafeAreaView>
    );
}