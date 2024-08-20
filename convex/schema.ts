import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// type union image, csv, pdf
export const fileTypes = v.union(
  v.literal("image"),
  v.literal("csv"),
  v.literal("pdf")
);

// membuat schema database dan table(files)
export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    orgId: v.string(),
    fileId: v.id("_storage"),
  }).index("by_orgId", ["orgId"]),

  // membuat schema database dan table(favorites)
  favorites: defineTable({
    fileId: v.id("files"),
    orgId: v.string(),
    userId: v.id("users"),
  }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),

  // membuat schema database dan table(users)
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
