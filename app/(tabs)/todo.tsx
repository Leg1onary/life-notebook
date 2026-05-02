import { useEffect, useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaskStore, TaskCategory } from "../../lib/store/taskStore";

const CATEGORIES: { label: string; value: TaskCategory }[] = [
    { label: "Все", value: "personal" },
    { label: "Покупки", value: "shopping" },
    { label: "Дом", value: "home" },
    { label: "Авто", value: "car" },
    { label: "Работа", value: "work" },
];

export default function TodoScreen() {
    const { tasks, loadTasks, addTask, toggleTask, deleteTask } = useTaskStore();
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState<TaskCategory>("personal");
    const [filter, setFilter] = useState<TaskCategory | "all">("all");
    const [adding, setAdding] = useState(false);

    useEffect(() => { loadTasks(); }, []);

    const filtered = filter === "all"
        ? tasks
        : tasks.filter((t) => t.category === filter);

    const handleAdd = async () => {
        if (!newTitle.trim()) return;
        await addTask(newTitle.trim(), newCategory);
        setNewTitle("");
        setAdding(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                    <Text style={{ color: "#7d766d", fontSize: 13, marginTop: 16 }}>планы и покупки</Text>
                    <Text style={{ color: "#ece6dc", fontSize: 28, fontWeight: "700", marginTop: 4 }}>To-do</Text>

                    {/* Фильтры */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginBottom: 8 }}>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            {[{ label: "Все", value: "all" }, ...CATEGORIES].map((c) => (
                                <TouchableOpacity
                                    key={c.value}
                                    onPress={() => setFilter(c.value as TaskCategory | "all")}
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 7,
                                        borderRadius: 999,
                                        backgroundColor: filter === c.value ? "#57a9ad" : "#1d1c19",
                                        borderWidth: 1,
                                        borderColor: filter === c.value ? "#57a9ad" : "#38342e",
                                    }}
                                >
                                    <Text style={{ color: filter === c.value ? "#171614" : "#b2aa9f", fontWeight: "600", fontSize: 13 }}>
                                        {c.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Список задач */}
                    <View style={{ gap: 8, marginTop: 8 }}>
                        {filtered.length === 0 && (
                            <View style={{ padding: 32, alignItems: "center" }}>
                                <Text style={{ color: "#7d766d", fontSize: 15 }}>Задач нет — добавь первую ↓</Text>
                            </View>
                        )}
                        {filtered.map((task) => (
                            <View key={task.id} style={{
                                backgroundColor: "#1d1c19", borderRadius: 14,
                                borderWidth: 1, borderColor: "#38342e",
                                padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
                            }}>
                                <TouchableOpacity onPress={() => toggleTask(task.id)}>
                                    <View style={{
                                        width: 24, height: 24, borderRadius: 7,
                                        borderWidth: 2,
                                        borderColor: task.isDone ? "#7fb159" : "#38342e",
                                        backgroundColor: task.isDone ? "#7fb159" : "transparent",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        {task.isDone && <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                                <Text style={{
                                    flex: 1, color: task.isDone ? "#7d766d" : "#ece6dc",
                                    fontSize: 16, textDecorationLine: task.isDone ? "line-through" : "none",
                                }}>
                                    {task.title}
                                </Text>
                                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                                    <Text style={{ color: "#7d766d", fontSize: 18 }}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Форма добавления */}
                    {adding && (
                        <View style={{
                            backgroundColor: "#1d1c19", borderRadius: 14,
                            borderWidth: 1, borderColor: "#57a9ad",
                            padding: 14, marginTop: 8, gap: 10,
                        }}>
                            <TextInput
                                autoFocus
                                placeholder="Что нужно сделать?"
                                placeholderTextColor="#7d766d"
                                value={newTitle}
                                onChangeText={setNewTitle}
                                style={{ color: "#ece6dc", fontSize: 16 }}
                                onSubmitEditing={handleAdd}
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    {CATEGORIES.map((c) => (
                                        <TouchableOpacity key={c.value} onPress={() => setNewCategory(c.value)}>
                                            <View style={{
                                                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                                                backgroundColor: newCategory === c.value ? "#57a9ad" : "#24221f",
                                                borderWidth: 1, borderColor: newCategory === c.value ? "#57a9ad" : "#38342e",
                                            }}>
                                                <Text style={{ color: newCategory === c.value ? "#171614" : "#b2aa9f", fontSize: 12, fontWeight: "600" }}>
                                                    {c.label}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <TouchableOpacity onPress={handleAdd} style={{
                                    flex: 1, backgroundColor: "#57a9ad", borderRadius: 10,
                                    paddingVertical: 12, alignItems: "center",
                                }}>
                                    <Text style={{ color: "#171614", fontWeight: "700" }}>Добавить</Text>
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}