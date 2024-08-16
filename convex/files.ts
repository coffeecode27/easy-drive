import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";

// handle file upload (yg akan dipanggil dari client)
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  // pengecekan apakah user yg login terdaftar / terautentikasi
  if (!identity) {
    throw new ConvexError("You must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

// helper function untuk pengecekan orgId dan tokenIdentifier dari user
async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  // pengecekan identifier user dengan menajalankan fungsi getUser (dari file users.ts)
  const user = await getUser(ctx, tokenIdentifier);
  // variable hasAccess mengecek apakah user yg berhasil di query terdapat orgId dan tokenIdentifier yang sama dengan yg dikirim dari client
  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
  if (!hasAccess) {
    throw new ConvexError("You do not have access to this organization");
  }
  return hasAccess;
}

// cara membuat atau create file baru dengan convex (menggunakan mutation)
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    // melakukan identifikasi untuk user yg telah login, sehingga hanya user yang terdaftar / terautentikasi yang dapat membuat file
    const identity = await ctx.auth.getUserIdentity();
    // pengecekan apakah user yg login terdaftar / terautentikasi
    if (!identity) {
      throw new ConvexError("You must be logged in to upload a file");
    }
    // jalankan fungsi hasAccessToOrg
    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );
    // jika hasil dari fungsi hasAccess bernilai false
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization");
    }
    // jika berhasil, maka proses insert kedalam database (dengan nama tabelnya adalah files, kolom name, value args.name)
    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
    });
  },
});

// cara mengambil semua file yang ada di database (menggunakan query)
export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    // identifikasi untuk user yg telah login, sehingga hanya user yang terdaftar / terautentikasi yang dapat melihat file
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    // jalankan fungsi hasAccessToOrg
    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );
    // jika hasil dari fungsi hasAccess bernilai false, artinya kita tidak punya akses
    if (!hasAccess) {
      [];
    }
    // proses melakukan query dan collect dari database (dengan melakukan indexing menggunakan orgId)
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
