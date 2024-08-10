import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// cara membuat atau create file baru dengan convex (menggunakan mutation)
export const createFile = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    // melakukan identifikasi untuk user yg telah login, sehingga hanya user yang terdaftar / terautentikasi yang dapat membuat file
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be logged in to upload a file");
    // proses insert kedalam database (dengan nama tabelnya adalah files, kolom name, value args.name)
    await ctx.db.insert("files", { name: args.name });
  },
});

// cara mengambil semua file yang ada di database (menggunakan query)
export const getFiles = query({
  args: {},
  async handler(ctx) {
    // identifikasi untuk user yg telah login, sehingga hanya user yang terdaftar / terautentikasi yang dapat melihat file
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    // proses melakukan query dan collect(mengumpulkan semua data) dari database
    return await ctx.db.query("files").collect();
  },
});
