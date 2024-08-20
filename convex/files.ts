import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

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
async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  // jika berhasil, ambil user berdasarkan tokenIdentifier(user yg login)
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();
  // jika user dengan tokenIdentifier(user yg login) tidak ada, maka return null
  if (!user) {
    return null;
  }
  // variable hasAccess mengecek apakah user yg berhasil di query terdapat orgId dan tokenIdentifier yang sama dengan yg dikirim dari client
  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
  if (!hasAccess) {
    return null;
  }
  return { user };
}

// helper untuk mengecek akses ke file
async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  // ambil file
  const file = await ctx.db.get(fileId);
  if (!file) {
    return null;
  }
  // jalankan fungsi hasAccessToOrg
  const hasAccess = await hasAccessToOrg(ctx, file.orgId);
  // jika gagal, artinya kita tidak punya akses
  if (!hasAccess) {
    return null;
  }
  // jika semua proses berhasil, kembalikan user dan file
  return {
    user: hasAccess.user,
    file,
  };
}

// cara membuat atau create file baru dengan convex (menggunakan mutation)
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    // melakukan identifikasi untuk user yg telah login, sehingga hanya user yang terdaftar / terautentikasi yang dapat membuat file
    const identity = await ctx.auth.getUserIdentity();
    // pengecekan apakah user yg login terdaftar / terautentikasi
    if (!identity) {
      throw new ConvexError("You must be logged in to upload a file");
    }
    // jalankan fungsi hasAccessToOrg
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    // jika hasil dari fungsi hasAccess bernilai false
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization");
    }
    // jika berhasil, maka proses insert kedalam database (dengan nama tabelnya adalah files, kolom name, value args.name)
    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
    });
  },
});

// cara mengambil semua file yang ada di database (menggunakan query)
export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    // jalankan fungsi hasAccessToOrg
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    // jika hasil dari fungsi hasAccess bernilai false, artinya kita tidak punya akses
    if (!hasAccess) {
      return [];
    }
    // proses melakukan query dan collect dari database (dengan melakukan indexing menggunakan orgId)
    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const query = args.query;
    if (query) {
      files = files.filter((file) =>
        file.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (args.favorites) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }

    return files;
  },
});

// fungsi untuk menghapus file
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    // jalankan fungsi hasAccessToFile
    const access = await hasAccessToFile(ctx, args.fileId);
    // jika access bernilai false, artinya user tidak punya akses ke file
    if (!access) {
      throw new ConvexError("You do not have access to this file");
    }
    // jika berhasil, jalankan proses delete file
    await ctx.db.delete(args.fileId);
  },
});

// fungsi untuk toggle favorite item
export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    // jalankan fungsi hasAccessToFile
    const access = await hasAccessToFile(ctx, args.fileId);
    // jika access bernilai false, artinya user tidak punya akses ke file
    if (!access) {
      throw new ConvexError("You do not have access to this file");
    }

    // jika ada, ambil data favorite didalam table favorites
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id)
      )
      .first();

    if (!favorite) {
      // jika favorite tidak ada, maka insert ke table favorites
      await ctx.db.insert("favorites", {
        fileId: access.file._id,
        userId: access.user._id,
        orgId: access.file.orgId,
      });
    } else {
      // jika sudah ada, hapus data favorite
      await ctx.db.delete(favorite._id);
    }
  },
});

// fungsi untuk mendapatkankan semua data favorite berdasarkan orgId
export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    // jalankan fungsi hasAccessToFile
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    // jika access bernilai false, artinya user tidak punya akses ke file
    if (!hasAccess) {
      return [];
    }
    // jika ada, ambil data favorite didalam table favorites
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
      )
      .collect();

    return favorites;
  },
});
