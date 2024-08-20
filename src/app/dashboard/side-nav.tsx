"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { FileIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const pathname = usePathname();
  return (
    <div className=" flex flex-col gap-4 w-40">
      <Link href="/dashboard/files">
        <Button
          variant="link"
          className={clsx(
            "flex items-center gap-2 text-base",
            pathname === "/dashboard/files" && "text-[#3171c5]"
          )}
        >
          <FileIcon className="w-5 h-5" /> All FIles
        </Button>
      </Link>

      <Link href="/dashboard/favorites">
        <Button
          variant="link"
          className={clsx(
            "flex items-center gap-2 text-base",
            pathname === "/dashboard/favorites" && "text-[#3171c5]"
          )}
        >
          <StarIcon className="w-5 h-5" /> Favorites
        </Button>
      </Link>
    </div>
  );
}
