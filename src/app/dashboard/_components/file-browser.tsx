"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadDialog } from "./upload-dialog";
import { FileCard } from "./file-card";
import Image from "next/image";
import { Shell } from "lucide-react";
import { SearchBar } from "@/app/dashboard/_components/search-bar";
import { useState } from "react";

function Placeholder() {
  return (
    <div className="flex flex-col items-center w-full mt-12">
      <div
        className="flex flex-col gap-5 justify-center items-center"
        style={{ marginRight: "85px" }}
      >
        <Image
          src="/img/empty2.svg"
          alt="empty image"
          width={300}
          height={300}
        />
        <div className="text-1xl font-semibold">
          You have no files, just upload one now!
        </div>
        <UploadDialog />
      </div>
    </div>
  );
}

export default function FileBrowser({
  title,
  favoritesOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  // cek apakah modul clerk organization dan modul clerk user sudah di-load
  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favorites: favoritesOnly } : "skip"
  );
  return (
    <div>
      {files === undefined && (
        <div className="flex flex-col h-[500px] gap-5 justify-center  items-center ">
          <div className="flex flex-col gap-5 " style={{ marginRight: "85px" }}>
            <Shell className="w-28 h-28 animate-spin text-darkBorder" />
            <div className="text-1xl font-semibold">Load your files...</div>
          </div>
        </div>
      )}

      {files && (
        <>
          <div className="flex justify-between items-center mb-10 ">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadDialog />
          </div>

          {files.length === 0 && <Placeholder />}

          <div className="grid lg:grid-cols-4 gap-4">
            {files?.map((file) => (
              <FileCard
                favorites={favorites ?? []}
                file={file}
                key={file._id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
