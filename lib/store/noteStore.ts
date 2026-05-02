import { create } from "zustand";
import { db } from "../db/client";
import { notes } from "../db/schema";
import { isNull, desc, eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface Note {
    id: string;
    title: string;
    body: string;
    sectionId: string | null;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isSynced: boolean;
}

interface NoteStore {
    notes: Note[];
    loadNotes: (sectionId?: string) => Promise<void>;
    addNote: (title: string, body: string, sectionId?: string) => Promise<void>;
    updateNote: (id: string, title: string, body: string) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    togglePin: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
    notes: [],

    loadNotes: async (sectionId) => {
        const condition = sectionId
            ? and(isNull(notes.deletedAt), eq(notes.sectionId, sectionId))
            : and(isNull(notes.deletedAt), isNull(notes.sectionId));
        const rows = await db.select().from(notes).where(condition).orderBy(desc(notes.isPinned), desc(notes.createdAt));
        set({ notes: rows as Note[] });
    },

    addNote: async (title, body, sectionId) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        await db.insert(notes).values({
            id, title, body,
            sectionId: sectionId ?? null,
            isPinned: false,
            createdAt: now, updatedAt: now,
            isSynced: false,
        });
        await get().loadNotes(sectionId);
    },

    updateNote: async (id, title, body) => {
        const note = get().notes.find((n) => n.id === id);
        const now = new Date().toISOString();
        await db.update(notes).set({ title, body, updatedAt: now, isSynced: false }).where(eq(notes.id, id));
        await get().loadNotes(note?.sectionId ?? undefined);
    },

    deleteNote: async (id) => {
        const note = get().notes.find((n) => n.id === id);
        const now = new Date().toISOString();
        await db.update(notes).set({ deletedAt: now, updatedAt: now, isSynced: false }).where(eq(notes.id, id));
        await get().loadNotes(note?.sectionId ?? undefined);
    },

    togglePin: async (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return;
        const now = new Date().toISOString();
        await db.update(notes).set({ isPinned: !note.isPinned, updatedAt: now, isSynced: false }).where(eq(notes.id, id));
        await get().loadNotes(note.sectionId ?? undefined);
    },
}));