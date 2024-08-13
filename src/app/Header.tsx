import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="border-b py-2 bg-gray-50 sticky top-0 z-10">
      <div className="container  flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/logo/document.png"
              alt="EasyDrive Logo"
              width={50}
              height={50}
            />
            <span className="font-bold">EasyDrive</span>
          </div>
        </Link>

        <SignedIn>
          <Button variant={"outline"}>
            <Link href="/dashboard/files">Your Files</Link>
          </Button>
        </SignedIn>

        <div className="flex gap-2">
          <OrganizationSwitcher />
          <div
            style={{ padding: "2px" }}
            className=" border-double border-2 border-gray-800 rounded-full flex justify-center items-center"
          >
            <UserButton />
          </div>
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Header;
