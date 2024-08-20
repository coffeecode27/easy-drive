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
    <div className="border-b-2 border-black py-5  sticky top-0 z-10 bg-white">
      <div className=" flex px-16 justify-between items-center">
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
          <Button variant="link">
            <Link href="/dashboard/files">
              <div className="flex items-center">
                <Image
                  src="/icon/file-icon.svg"
                  width={35}
                  height={35}
                  alt="icon"
                />
                Your Files
              </div>
            </Link>
          </Button>
        </SignedIn>

        <div className="flex gap-2">
          <OrganizationSwitcher />
          <div
            style={{ padding: "2px" }}
            className="  flex justify-center items-center"
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
