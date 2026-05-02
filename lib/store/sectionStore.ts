import { create } from "zustand";
import { db } from "../db/client";
import { sections } from "../db/schema";
import { isNull, asc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface Section {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string | null;
    parentId: string | null;
    position: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isSynced: boolean;
}

interface SectionStore {
    sections: Section[];
    loadSections: () => Promise<void>;
    addSection: (name: string, icon: string, color: string) => Promise<void>;
    deleteSection: (id: string) => Promise<void>;
    seedDefaults: () => Promise<void>;
}

const DEFAULT_SECTIONS = [
    { name: "Дом", icon: "🏠", color: "#7fb159" },
    { name: "Автомобиль", icon: "🚗", color: "#db9a47" },
    { name: "Работа", icon: "💼", color: "#57a9ad" },
    { name: "На потом", icon: "🗂️", color: "#a07ad8" },
];

export const useSectionStore = create<SectionStore>((set, get) => ({
    sections: [],

    loadSections: async () => {
        const rows = await db
            .select()
            .from(sections)
            .where(isNull(sections.deletedAt))
            .orderBy(asc(sections.position));
        set({ sections: rows as Section[] });
    },

    addSection: async (name, icon, color) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        await db.insert(sections).values({
            id, name, icon, color,
            position: get().sections.length,
            createdAt: now, updatedAt: now,
            isSynced: false,
        });
        await get().loadSections();
    },

    deleteSection: async (id) => {
        const now = new Date().toISOString();
        await db
            .update(sections)
            .set({ deletedAt: now, updatedAt: now, isSynced: false })
            .where(eq(sections.id, id));
        await get().loadSections();
    },

    seedDefaults: async () => {
        const existing = await db.select().from(sections).where(isNull(sections.deletedAt));
        if (existing.length > 0) return;
        const now = new Date().toISOString();
        for (let i = 0; i < DEFAULT_SECTIONS.length; i++) {
            const s = DEFAULT_SECTIONS[i];
            await db.insert(sections).values({
                id: uuidv4(), name: s.name, icon: s.icon, color: s.color,
                position: i, createdAt: now, updatedAt: now, isSynced: false,
            });
        }
        await get().loadSections();
    },
}));