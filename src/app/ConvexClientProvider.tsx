"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs"; // Untuk menggunakan fitur autentikasi dari Clerk.
import { ConvexProvider, ConvexReactClient } from "convex/react"; // Untuk menggunakan Convex
import { ConvexProviderWithClerk } from "convex/react-clerk"; // Untuk menghubungkan Clerk dengan Convex
import { ReactNode } from "react";

//  Membuat objek convex untuk berinteraksi dengan backend Convex
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
