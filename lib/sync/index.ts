import { db } from "../db/client";
import { tasks, notes, sections, emotionLogs } from "../db/schema";
import { eq, or, isNotNull } from "drizzle-orm";
import api from "../api/client";
import * as SecureStore from "expo-secure-store";

const LAST_SYNC_KEY = "last_sync_at";
const DEVICE_ID_KEY = "device_id";

async function getDeviceId(): Promise<string> {
    let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!id) {
        // Simple UUID-like ID without external dependency
        id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
    }
    return id;
}

async function getLastSyncAt(): Promise<string | null> {
    return SecureStore.getItemAsync(LAST_SYNC_KEY);
}

async function setLastSyncAt(value: string) {
    await SecureStore.setItemAsync(LAST_SYNC_KEY, value);
}

// ── Helpers to map camelCase ↔ snake_case for API ────────────────────────

function taskToPayload(t: any) {
    return {
        id: t.id,
        title: t.title,
        is_done: t.isDone,
        done_at: t.doneAt ?? null,
        due_date: t.dueDate ?? null,
        category: t.category,
        position: t.position,
        section_id: t.sectionId ?? null,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
        deleted_at: t.deletedAt ?? null,
    };
}

function noteToPayload(n: any) {
    return {
        id: n.id,
        title: n.title,
        body: n.body,
        section_id: n.sectionId ?? null,
        is_pinned: n.isPinned,
        created_at: n.createdAt,
        updated_at: n.updatedAt,
        deleted_at: n.deletedAt ?? null,
    };
}

function sectionToPayload(s: any) {
    return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        description: s.description ?? null,
        parent_id: s.parentId ?? null,
        position: s.position,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
        deleted_at: s.deletedAt ?? null,
    };
}

function emotionToPayload(e: any) {
    return {
        id: e.id,
        emotion: e.emotion,
        emotion_category: e.emotionCategory,
        situation: e.situation,
        body_reaction: e.bodyReaction ?? null,
        thought: e.thought ?? null,
        desired_action: e.desiredAction ?? null,
        context_tag: e.contextTag ?? null,
        created_at: e.createdAt,
        updated_at: e.updatedAt,
        deleted_at: e.deletedAt ?? null,
    };
}

function payloadToTask(p: any) {
    return {
        id: p.id,
        title: p.title,
        isDone: p.is_done,
        doneAt: p.done_at ?? null,
        dueDate: p.due_date ?? null,
        category: p.category,
        position: p.position,
        sectionId: p.section_id ?? null,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        deletedAt: p.deleted_at ?? null,
        isSynced: true,
    };
}

function payloadToNote(p: any) {
    return {
        id: p.id,
        title: p.title,
        body: p.body,
        sectionId: p.section_id ?? null,
        isPinned: p.is_pinned,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        deletedAt: p.deleted_at ?? null,
        isSynced: true,
    };
}

function payloadToSection(p: any) {
    return {
        id: p.id,
        name: p.name,
        icon: p.icon,
        color: p.color,
        description: p.description ?? null,
        parentId: p.parent_id ?? null,
        position: p.position,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        deletedAt: p.deleted_at ?? null,
        isSynced: true,
    };
}

function payloadToEmotion(p: any) {
    return {
        id: p.id,
        emotion: p.emotion,
        emotionCategory: p.emotion_category,
        situation: p.situation,
        bodyReaction: p.body_reaction ?? null,
        thought: p.thought ?? null,
        desiredAction: p.desired_action ?? null,
        contextTag: p.context_tag ?? null,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        deletedAt: p.deleted_at ?? null,
        isSynced: true,
    };
}

// ── Push: отправляем на сервер всё с isSynced = false ────────────────────

async function push() {
    const [pendingTasks, pendingNotes, pendingSections, pendingEmotions] =
        await Promise.all([
            db.select().from(tasks).where(eq(tasks.isSynced, false)),
            db.select().from(notes).where(eq(notes.isSynced, false)),
            db.select().from(sections).where(eq(sections.isSynced, false)),
            db.select().from(emotionLogs).where(eq(emotionLogs.isSynced, false)),
        ]);

    const hasData =
        pendingTasks.length +
        pendingNotes.length +
        pendingSections.length +
        pendingEmotions.length > 0;

    if (!hasData) return;

    await api.post("/api/sync/push", {
        tasks: pendingTasks.map(taskToPayload),
        notes: pendingNotes.map(noteToPayload),
        sections: pendingSections.map(sectionToPayload),
        emotion_logs: pendingEmotions.map(emotionToPayload),
    });

    // Помечаем как синхронизированные
    await Promise.all([
        ...pendingTasks.map((t) => db.update(tasks).set({ isSynced: true }).where(eq(tasks.id, t.id))),
        ...pendingNotes.map((n) => db.update(notes).set({ isSynced: true }).where(eq(notes.id, n.id))),
        ...pendingSections.map((s) => db.update(sections).set({ isSynced: true }).where(eq(sections.id, s.id))),
        ...pendingEmotions.map((e) => db.update(emotionLogs).set({ isSynced: true }).where(eq(emotionLogs.id, e.id))),
    ]);
}

// ── Pull: получаем с сервера новое с момента last_sync_at ─────────────────

async function pull() {
    const lastSync = await getLastSyncAt();
    const deviceId = await getDeviceId();

    const params: Record<string, string> = { device_id: deviceId };
    if (lastSync) params.since = lastSync;

    const { data } = await api.get("/api/sync/pull", { params });

    // Upsert tasks
    for (const p of data.tasks ?? []) {
        const row = payloadToTask(p);
        const existing = await db.select().from(tasks).where(eq(tasks.id, row.id));
        if (existing.length > 0) {
            if (row.updatedAt >= existing[0].updatedAt) {
                await db.update(tasks).set(row).where(eq(tasks.id, row.id));
            }
        } else {
            await db.insert(tasks).values(row);
        }
    }

    // Upsert notes
    for (const p of data.notes ?? []) {
        const row = payloadToNote(p);
        const existing = await db.select().from(notes).where(eq(notes.id, row.id));
        if (existing.length > 0) {
            if (row.updatedAt >= existing[0].updatedAt) {
                await db.update(notes).set(row).where(eq(notes.id, row.id));
            }
        } else {
            await db.insert(notes).values(row);
        }
    }

    // Upsert sections
    for (const p of data.sections ?? []) {
        const row = payloadToSection(p);
        const existing = await db.select().from(sections).where(eq(sections.id, row.id));
        if (existing.length > 0) {
            if (row.updatedAt >= existing[0].updatedAt) {
                await db.update(sections).set(row).where(eq(sections.id, row.id));
            }
        } else {
            await db.insert(sections).values(row);
        }
    }

    // Upsert emotion logs
    for (const p of data.emotion_logs ?? []) {
        const row = payloadToEmotion(p);
        const existing = await db.select().from(emotionLogs).where(eq(emotionLogs.id, row.id));
        if (existing.length > 0) {
            if (row.updatedAt >= existing[0].updatedAt) {
                await db.update(emotionLogs).set(row).where(eq(emotionLogs.id, row.id));
            }
        } else {
            await db.insert(emotionLogs).values(row);
        }
    }

    if (data.server_time) {
        await setLastSyncAt(data.server_time);
    }
}

// ── Публичный API ─────────────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function sync(): Promise<void> {
    try {
        await push();
        await pull();
    } catch (e) {
        // Молча проглатываем ошибки сети — приложение работает офлайн
        console.warn("[sync] failed:", e);
    }
}

// Вызывай после каждого изменения данных (debounce 5 сек по ТЗ)
export function scheduleSync() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        sync();
    }, 5000);
}
