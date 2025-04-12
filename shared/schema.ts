import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  resetToken: true,
  resetTokenExpiry: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
});

// Business Profile Schema
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  description: text("description"),
  address: text("address"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  settings: jsonb("settings"),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
});

// Product Schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  price: text("price"),
  size: text("size"),
  piecesPerBox: integer("pieces_per_box"),
  barcode: text("barcode"),
  stock: integer("stock"),
  stockDate: timestamp("stock_date"),
  images: jsonb("images").$type<string[]>(),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>(),
  variations: jsonb("variations"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Template Schema
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  layout: jsonb("layout").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

// Catalog Schema
export const catalogs = pgTable("catalogs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft"),
  templateId: integer("template_id").notNull(),
  productIds: jsonb("product_ids").$type<number[]>().notNull(),
  settings: jsonb("settings"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCatalogSchema = createInsertSchema(catalogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertCatalog = z.infer<typeof insertCatalogSchema>;
export type Catalog = typeof catalogs.$inferSelect;
