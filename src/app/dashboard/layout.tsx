// import { Button } from "@/components/ui/button";
// import { FileIcon, StarIcon } from "lucide-react";
// import Link from "next/link";
import SideNav from "./side-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-white">
      <div className="container pt-12 mx-16">
        <div className="flex gap-8">
          <SideNav />
          <div className="w-full ">{children}</div>
        </div>
      </div>
    </main>
  );
}
