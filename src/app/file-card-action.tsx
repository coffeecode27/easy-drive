"use client";

import { Doc } from "../../convex/_generated/dataModel";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Heart, Trash2Icon } from "lucide-react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";

export function FileCardAction({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  const [isDialogAlertOpen, setIsDialogAlertOpen] = useState(false);
  return (
    <>
      <AlertDialog open={isDialogAlertOpen} onOpenChange={setIsDialogAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              file and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                toast({
                  title: "File deleted",
                  description: "Your file is now deleted from the server.",
                });
              }}
            >
              Yup, delete it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="  flex items-center gap-1 p-1 cursor-pointer"
            onClick={() => {
              toggleFavorite({ fileId: file._id });
            }}
          >
            {isFavorited ? (
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="h-5">Unfavorite</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5 text-darkBorder" />
                <span className="h-5">Add Favorite</span>
              </div>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="  flex items-center gap-1 p-1 cursor-pointer hover:bg-red-400"
            onClick={() => setIsDialogAlertOpen(true)}
          >
            <div className="flex items-center gap-1">
              <Trash2Icon className="h-5 w-5" />
              <span className="h-5">Delete</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
