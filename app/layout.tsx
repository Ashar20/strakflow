import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ChipiProvider } from "@chipi-stack/nextjs/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chippi Pay Workflow Builder",
  description: "Build and execute payment workflows on Starknet with Chippi Pay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ChipiProvider 
        config={{
          apiPublicKey: process.env.NEXT_PUBLIC_CHIPI_API_KEY!,
          environment: "production",
          nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
        }}
      >
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <header className="border-b border-gray-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                      Chippi Pay Workflow Builder
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <a 
                        href="/workflow"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Go to Workflow
                      </a>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8"
                          }
                        }}
                        afterSignOutUrl="/"
                      />
                    </SignedIn>
                  </div>
                </div>
              </div>
            </header>
            <main>
              {children}
            </main>
          </body>
        </html>
      </ChipiProvider>
    </ClerkProvider>
  );
}
