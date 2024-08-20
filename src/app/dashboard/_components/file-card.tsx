"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { FileTextIcon, GanttChartIcon, ImageIcon } from "lucide-react";
import { ReactNode } from "react";
import Image from "next/image";
import { FileCardAction } from "../../file-card-action";
import { FavoritesButton } from "@/components/favorites-button";
export function FileCard({
  file,
  favorites,
}: {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}) {
  const typeForIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

  return (
    <Card className="border-2 borderk-darkBorder relative">
      <CardHeader>
        <CardTitle className="flex gap-2">
          <div className="mt-5 flex justify-center items-center w-full gap-2">
            <div className="flex justify-center">{typeForIcons[file.type]}</div>
            <div className="text-lg">{file.name}</div>
          </div>

          <div className="absolute top-2 right-1">
            <FileCardAction isFavorited={isFavorited} file={file} />
          </div>
          {isFavorited && (
            <div className="absolute top-2 left-1">
              <FavoritesButton />
            </div>
          )}
        </CardTitle>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {/* {file.type === "image" && file.url && (
          <Image alt={file.name} width="200" height="100" src={file.url} />
        )} */}

        {file.type === "image" && <ImageIcon className="w-20 h-20" />}
        {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
        {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          variant="neutral"
          onClick={() => {
            window.open("https://www.google.com", "_blank");
          }}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
