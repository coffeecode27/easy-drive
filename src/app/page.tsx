"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import CustomtButton from "@/components/CustomButton";

const formSchema = z.object({
  title: z.string().min(1).max(100),
  file: z
    .custom<FileList>((val) => val instanceof FileList, {
      message: "File is required",
    })
    .refine((files) => files.length > 0, { message: "File is required" }),
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) {
      setIsLoading(false);
      return;
    }
    const postUrl = await generateUploadUrl();
    setIsLoading(true);
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    try {
      await createFile({ name: values.title, fileId: storageId, orgId });
      form.reset();
      setIsLoading(false);
      setIsFileDialogOpen(false);
      toast({
        variant: "success",
        title: "File uploaded successfully",
        description: "Now everyone can see your file",
      });
    } catch (error) {
      form.reset();
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Failed to upload file",
        description: "Your file could not be uploaded, please try again later",
      });
    }
  }

  // cek apakah modul clerk organization dan modul clerk user sudah di-load
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.files.createFile);
  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Files</h1>

        <Dialog
          open={isFileDialogOpen}
          onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen);
            form.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {}}>Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">Upload Your File Here</DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <FormLabel>File</FormLabel>
                          <FormControl>
                            <Input type="file" {...fileRef} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <CustomtButton isLoading={isLoading}>
                      <p>Upload</p>
                    </CustomtButton>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {files?.map((file) => <p key={file._id}>{file.name}</p>)}
    </main>
  );
}
