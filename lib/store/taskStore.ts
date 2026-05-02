import { create } from "zustand";
import { db } from "../db/client";
import { tasks } from "../db/schema";
import { eq, isNull, asc } from "drizzle-orm";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { scheduleSync } from "../sync";

export type TaskCategory = "shopping" | "home" | "car" | "work" | "personal";

export interface Task {
    id: string;
    title: string;
    isDone: boolean;
    doneAt: string | null;
    dueDate: string | null;
    category: TaskCategory;
    position: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isSynced: boolean;
}

interface TaskStore {
    tasks: Task[];
    loadTasks: () => Promise<void>;
    addTask: (title: string, category?: TaskCategory) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],

    loadTasks: async () => {
        const rows = await db
            .select()
            .from(tasks)
            .where(isNull(tasks.deletedAt))
            .orderBy(asc(tasks.position));
        set({ tasks: rows as Task[] });
    },

    addTask: async (title, category = "personal") => {
        const id = uuidv4();
        const now = new Date().toISOString();
        await db.insert(tasks).values({
            id,
            title,
            category,
            isDone: false,
            position: get().tasks.length,
            createdAt: now,
            updatedAt: now,
            isSynced: false,
        });
        await get().loadTasks();
        scheduleSync();
    },

    toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const now = new Date().toISOString();
        await db
            .update(tasks)
            .set({
                isDone: !task.isDone,
                doneAt: !task.isDone ? now : null,
                updatedAt: now,
                isSynced: false,
            })
            .where(eq(tasks.id, id));
        await get().loadTasks();
        scheduleSync();
    },

    deleteTask: async (id) => {
        const now = new Date().toISOString();
        await db
            .update(tasks)
            .set({ deletedAt: now, updatedAt: now, isSynced: false })
            .where(eq(tasks.id, id));
        await get().loadTasks();
        scheduleSync();
    },
}));
