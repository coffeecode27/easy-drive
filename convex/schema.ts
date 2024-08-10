import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// membuat schema database dan table
export default defineSchema({
  files: defineTable({ name: v.string() }),
});
