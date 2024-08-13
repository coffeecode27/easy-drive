"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  // cek apakah modul clerk organization dan modul clerk user sudah di-load
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.files.createFile);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {files?.map((file) => <p key={file._id}>{file.name}</p>)}
      <Button
        onClick={() => {
          if (!orgId) return;
          createFile({ name: "hello world", orgId });
        }}
      >
        Click Me
      </Button>
    </main>
  );
}
