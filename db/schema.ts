import {sqliteTable,text,integer} from "drizzle-orm/sqlite-core";
export const owners=sqliteTable("owners",{key:text("key").primaryKey(),userId:text("user_id").notNull(),email:text("email").notNull()});
export const guests=sqliteTable("guests",{id:text("id").primaryKey(),name:text("name").notNull(),sent:integer("sent").notNull().default(0),createdAt:text("created_at").notNull()});
export const replies=sqliteTable("replies",{id:text("id").primaryKey(),guestId:text("guest_id"),name:text("name").notNull(),attendance:text("attendance").notNull(),message:text("message").notNull().default(""),updatedAt:text("updated_at").notNull()});
export const rateLimits=sqliteTable("rate_limits",{key:text("key").primaryKey(),count:integer("count").notNull().default(0),expires:integer("expires").notNull()});
