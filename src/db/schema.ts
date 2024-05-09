import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm/sql";

export const questions = sqliteTable("questions", {
	id: integer("id").primaryKey().notNull(),
	key: text("key").notNull(),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at"),
	searchQuery: text("search_query").notNull(),
	content: text("content"),
});

export const failures = sqliteTable("failures", {
	id: integer("id").primaryKey().notNull(),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at"),
	url: text("url").notNull(),
	status: text("status").notNull(),
});

export const news = sqliteTable("news", {
	id: integer("id").primaryKey().notNull(),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at"),
	url: text("url").notNull(),
	category: text("category"),
	content: text("content"),
},
(table) => {
	return {
		urlUnique: uniqueIndex("news_url_unique").on(table.url),
	}
});