import { sql } from "drizzle-orm";
import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    isDone: int("is_done", { mode: "boolean" }).notNull().default(false),
    doneAt: text("done_at"),
    dueDate: text("due_date"),
    category: text("category", {
        enum: ["shopping", "home", "car", "work", "personal"],
    }).notNull().default("personal"),
    position: int("position").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
    deletedAt: text("deleted_at"),
    isSynced: int("is_synced", { mode: "boolean" }).notNull().default(false),
});

export const notes = sqliteTable("notes", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    sectionId: text("section_id"),
    isPinned: int("is_pinned", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
    deletedAt: text("deleted_at"),
    isSynced: int("is_synced", { mode: "boolean" }).notNull().default(false),
});

export const sections = sqliteTable("sections", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("📁"),
    color: text("color").notNull().default("#57a9ad"),
    description: text("description"),
    parentId: text("parent_id"),
    position: int("position").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
    deletedAt: text("deleted_at"),
    isSynced: int("is_synced", { mode: "boolean" }).notNull().default(false),
});

export const emotionLogs = sqliteTable("emotion_logs", {
    id: text("id").primaryKey(),
    emotion: text("emotion").notNull(),
    emotionCategory: text("emotion_category", {
        enum: ["joy", "anger", "sadness", "fear", "shame", "calm", "other"],
    }).notNull().default("other"),
    situation: text("situation").notNull(),
    bodyReaction: text("body_reaction"),
    thought: text("thought"),
    desiredAction: text("desired_action"),
    contextTag: text("context_tag"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
    deletedAt: text("deleted_at"),
    isSynced: int("is_synced", { mode: "boolean" }).notNull().default(false),
});