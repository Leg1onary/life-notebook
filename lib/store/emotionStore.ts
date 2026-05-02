import { create } from "zustand";
import { db } from "../db/client";
import { emotionLogs } from "../db/schema";
import { isNull, desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { scheduleSync } from "../sync";

export type EmotionCategory = "joy" | "anger" | "sadness" | "fear" | "shame" | "calm" | "other";

export interface EmotionLog {
    id: string;
    emotion: string;
    emotionCategory: EmotionCategory;
    situation: string;
    bodyReaction: string | null;
    thought: string | null;
    desiredAction: string | null;
    contextTag: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isSynced: boolean;
}

export interface NewEmotionLog {
    emotion: string;
    emotionCategory: EmotionCategory;
    situation: string;
    bodyReaction?: string;
    thought?: string;
    desiredAction?: string;
    contextTag?: string;
}

interface EmotionStore {
    logs: EmotionLog[];
    loadLogs: () => Promise<void>;
    addLog: (data: NewEmotionLog) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
}

export const useEmotionStore = create<EmotionStore>((set, get) => ({
    logs: [],

    loadLogs: async () => {
        const rows = await db
            .select()
            .from(emotionLogs)
            .where(isNull(emotionLogs.deletedAt))
            .orderBy(desc(emotionLogs.createdAt));
        set({ logs: rows as EmotionLog[] });
    },

    addLog: async (data) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        await db.insert(emotionLogs).values({
            id,
            emotion: data.emotion,
            emotionCategory: data.emotionCategory,
            situation: data.situation,
            bodyReaction: data.bodyReaction ?? null,
            thought: data.thought ?? null,
            desiredAction: data.desiredAction ?? null,
            contextTag: data.contextTag ?? null,
            createdAt: now,
            updatedAt: now,
            isSynced: false,
        });
        await get().loadLogs();
        scheduleSync();
    },

    deleteLog: async (id) => {
        const now = new Date().toISOString();
        await db
            .update(emotionLogs)
            .set({ deletedAt: now, updatedAt: now, isSynced: false })
            .where(eq(emotionLogs.id, id));
        await get().loadLogs();
        scheduleSync();
    },
}));
