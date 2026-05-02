import { useEffect, useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, Pressable, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSectionStore } from "../../lib/store/sectionStore";
import { useNoteStore } from "../../lib/store/noteStore";
import { useTaskStore } from "../../lib/store/taskStore";

type Tab = "notes" | "tasks";
type Mode = "view" | "add-note" | "edit-note" | "add-task";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SectionScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { sections } = useSectionStore();
    const { notes, loadNotes, addNote, updateNote, deleteNote, togglePin } = useNoteStore();
    const { tasks, loadTasks, addTask, toggleTask, deleteTask } = useTaskStore();

    const section = sections.find((s) => s.id === id);
    const sectionTasks = tasks.filter((t) => t.sectionId === id || !t.sectionId).slice(0, 0); // только задачи раздела

    const [tab, setTab] = useState<Tab>("notes");
    const [mode, setMode] = useState<Mode>("view");
    const [noteTitle, setNoteTitle] = useState("");
    const [noteBody, setNoteBody] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [taskTitle, setTaskTitle] = useState("");

    useEffect(() => {
        if (id) {
            loadNotes(id);
            loadTasks();
        }
    }, [id]);

    const sectionTaskList = tasks.filter((t) => !t.isDone);

    const handleAddNote = async () => {
        if (!noteTitle.trim()) return;
        if (editingId) {
            await updateNote(editingId, noteTitle.trim(), noteBody.trim());
        } else {
            await addNote(noteTitle.trim(), noteBody.trim(), id);
        }
        setNoteTitle(""); setNoteBody(""); setEditingId(null); setMode("view");
    };

    const handleEditNote = (note: typeof notes[0]) => {
        setNoteTitle(note.title);
        setNoteBody(note.body);
        setEditingId(note.id);
        setMode("edit-note");
    };

    const handleDeleteNote = (noteId: string) => {
        Alert.alert("Удалить заметку?", "", [
            { text: "Отмена", style: "cancel" },
            { text: "Удалить", style: "destructive", onPress: () => deleteNote(noteId) },
        ]);
    };

    const handleAddTask = async () => {
        if (!taskTitle.trim()) return;
        await addTask(taskTitle.trim(), "personal");
        setTaskTitle(""); setMode("view");
    };

    if (!section) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
                    <Text style={{ color: "#57a9ad" }}>← Назад</Text>
                </TouchableOpacity>
                <Text style={{ color: "#7d766d", textAlign: "center", marginTop: 40 }}>Раздел не найден</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#171614" }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

                {/* Шапка */}
                <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
                        <Text style={{ color: "#57a9ad", fontSize: 15 }}>← Разделы</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{
                            width: 44, height: 44, borderRadius: 12,
                            backgroundColor: section.color + "22",
                            alignItems: "center", justifyContent: "center",
                        }}>
                            <Text style={{ fontSize: 22 }}>{section.icon}</Text>
                        </View>
                        <View>
                            <Text style={{ color: "#ece6dc", fontSize: 22, fontWeight: "700" }}>{section.name}</Text>
                            <Text style={{ color: "#7d766d", fontSize: 12 }}>
                                {notes.length} заметок
                            </Text>
                        </View>
                    </View>

                    {/* Табы */}
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
                        {(["notes", "tasks"] as Tab[]).map((t) => (
                            <TouchableOpacity key={t} onPress={() => { setTab(t); setMode("view"); }}>
                                <View style={{
                                    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
                                    backgroundColor: tab === t ? section.color : "#1d1c19",
                                    borderWidth: 1, borderColor: tab === t ? section.color : "#38342e",
                                }}>
                                    <Text style={{ color: tab === t ? "#171614" : "#b2aa9f", fontWeight: "600", fontSize: 13 }}>
                                        {t === "notes" ? "Заметки" : "Задачи"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Контент */}
                <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>

                    {/* Форма заметки */}
                    {(mode === "add-note" || mode === "edit-note") && (
                        <View style={{
                            backgroundColor: "#1d1c19", borderRadius: 14,
                            borderWidth: 1, borderColor: section.color,
                            padding: 14, marginBottom: 12, gap: 10,
                        }}>
                            <TextInput
                                autoFocus
                                placeholder="Заголовок"
                                placeholderTextColor="#7d766d"
                                value={noteTitle}
                                onChangeText={setNoteTitle}
                                style={{ color: "#ece6dc", fontSize: 16, fontWeight: "600" }}
                            />
                            <View style={{ height: 1, backgroundColor: "#38342e" }} />
                            <TextInput
                                multiline
                                placeholder="Текст заметки..."
                                placeholderTextColor="#7d766d"
                                value={noteBody}
                                onChangeText={setNoteBody}
                                style={{ color: "#b2aa9f", fontSize: 14, minHeight: 80, textAlignVertical: "top" }}
                            />
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <TouchableOpacity onPress={handleAddNote} style={{
                                    flex: 1, backgroundColor: section.color,
                                    borderRadius: 10, paddingVertical: 11, alignItems: "center",
                                }}>
                                    <Text style={{ color: "#171614", fontWeight: "700" }}>
                                        {mode === "edit-note" ? "Сохранить" : "Добавить"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { setMode("view"); setNoteTitle(""); setNoteBody(""); setEditingId(null); }}
                                    style={{ backgroundColor: "#24221f", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16 }}
                                >
                                    <Text style={{ color: "#b2aa9f" }}>Отмена</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Форма задачи */}
                    {mode === "add-task" && (
                        <View style={{
                            backgroundColor: "#1d1c19", borderRadius: 14,
                            borderWidth: 1, borderColor: section.color,
                            padding: 14, marginBottom: 12, gap: 10,
                        }}>
                            <TextInput
                                autoFocus
                                placeholder="Новая задача..."
                                placeholderTextColor="#7d766d"
                                value={taskTitle}
                                onChangeText={setTaskTitle}
                                onSubmitEditing={handleAddTask}
                                style={{ color: "#ece6dc", fontSize: 15 }}
                            />
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <TouchableOpacity onPress={handleAddTask} style={{
                                    flex: 1, backgroundColor: section.color,
                                    borderRadius: 10, paddingVertical: 11, alignItems: "center",
                                }}>
                                    <Text style={{ color: "#171614", fontWeight: "700" }}>Добавить</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { setMode("view"); setTaskTitle(""); }}
                                    style={{ backgroundColor: "#24221f", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16 }}
                                >
                                    <Text style={{ color: "#b2aa9f" }}>Отмена</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Список заметок */}
                    {tab === "notes" && (
                        <View style={{ gap: 10 }}>
                            {notes.length === 0 && mode === "view" && (
                                <View style={{ padding: 40, alignItems: "center" }}>
                                    <Text style={{ color: "#7d766d", fontSize: 15 }}>Заметок пока нет</Text>
                                    <Text style={{ color: "#7d766d", fontSize: 13, marginTop: 4 }}>Нажми + чтобы добавить</Text>
                                </View>
                            )}
                            {notes.map((note) => (
                                <TouchableOpacity key={note.id} onPress={() => handleEditNote(note)} onLongPress={() => handleDeleteNote(note.id)}>
                                    <View style={{
                                        backgroundColor: "#1d1c19", borderRadius: 14,
                                        borderWidth: 1, borderColor: note.isPinned ? section.color + "66" : "#38342e",
                                        padding: 14, gap: 6,
                                    }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <Text style={{ color: "#ece6dc", fontWeight: "600", fontSize: 15, flex: 1 }}>{note.title}</Text>
                                            <TouchableOpacity onPress={() => togglePin(note.id)} style={{ paddingLeft: 8 }}>
                                                <Text style={{ fontSize: 14 }}>{note.isPinned ? "📌" : "·"}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {note.body ? (
                                            <Text style={{ color: "#b2aa9f", fontSize: 13 }} numberOfLines={3}>{note.body}</Text>
                                        ) : null}
                                        <Text style={{ color: "#7d766d", fontSize: 11 }}>{formatDate(note.updatedAt)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Список задач */}
                    {tab === "tasks" && (
                        <View style={{ gap: 8 }}>
                            {sectionTaskList.length === 0 && mode === "view" && (
                                <View style={{ padding: 40, alignItems: "center" }}>
                                    <Text style={{ color: "#7d766d", fontSize: 15 }}>Задач пока нет</Text>
                                </View>
                            )}
                            {sectionTaskList.map((task) => (
                                <View key={task.id} style={{
                                    backgroundColor: "#1d1c19", borderRadius: 12,
                                    borderWidth: 1, borderColor: "#38342e",
                                    padding: 12, flexDirection: "row", alignItems: "center", gap: 10,
                                }}>
                                    <TouchableOpacity onPress={() => toggleTask(task.id)}>
                                        <View style={{
                                            width: 24, height: 24, borderRadius: 7,
                                            borderWidth: 2,
                                            borderColor: task.isDone ? "#7fb159" : "#38342e",
                                            backgroundColor: task.isDone ? "#7fb159" : "transparent",
                                            alignItems: "center", justifyContent: "center",
                                        }}>
                                            {task.isDone && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={{
                                        flex: 1, color: task.isDone ? "#7d766d" : "#ece6dc", fontSize: 15,
                                        textDecorationLine: task.isDone ? "line-through" : "none",
                                    }}>{task.title}</Text>
                                    <TouchableOpacity onPress={() => deleteTask(task.id)}>
                                        <Text style={{ color: "#7d766d", fontSize: 18 }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* FAB */}
                {mode === "view" && (
                    <Pressable
                        onPress={() => setMode(tab === "notes" ? "add-note" : "add-task")}
                        style={{
                            position: "absolute", right: 20, bottom: 20,
                            width: 56, height: 56, borderRadius: 18,
                            backgroundColor: section.color,
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