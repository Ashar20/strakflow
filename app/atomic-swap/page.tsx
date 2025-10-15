"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NavigationTabs } from "@/components/NavigationTabs";
import WalletSelector from "@/components/WalletSelector";
import ChippiWalletCreation from "@/components/ChippiWalletCreation";
import { SignedIn, SignedOut } from "@clerk/nextjs";

// Dynamically import WorkflowBuilder to use atomic swap blocks
const AtomicSwapBuilder = dynamic(
  () => import("@/components/WorkflowBuilder").then(mod => {
    // This will use atomic swap blocks instead of regular workflow blocks
    return mod.default;
  }),
  { ssr: false }
);

export default function AtomicSwapPage() {
  const [wallet, setWallet] = useState<{ address: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChippiCreation, setShowChippiCreation] = useState(false);

  // Load wallet from localStorage (shared with main workflow)
  useEffect(() => {
    console.log("🔄 Loading wallet for atomic swap...");
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet);
        console.log("✅ Loaded wallet from localStorage:", parsedWallet);
        setWallet(parsedWallet);
      } catch (error) {
        console.error("❌ Failed to parse saved wallet:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleWalletConnected = (walletData: { address: string; type: string }) => {
    console.log("🎯 handleWalletConnected called with:", walletData);
    setWallet(walletData);
    // Save to localStorage (shared with main workflow)
    localStorage.setItem("connectedWallet", JSON.stringify(walletData));
    setShowChippiCreation(false);
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("connectedWallet");
    localStorage.removeItem("wallet_private_key");
    setShowChippiCreation(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show Chippi Pay wallet creation if user is signed in and selected Chippi Pay
  if (showChippiCreation && !wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <SignedIn>
            <ChippiWalletCreation onWalletConnected={handleWalletConnected} />
            <button
              onClick={() => setShowChippiCreation(false)}
              className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to wallet options
            </button>
          </SignedIn>
          <SignedOut>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in using the buttons in the header to create a Chippi Pay wallet.
              </p>
              <button
                onClick={() => setShowChippiCreation(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to wallet options
              </button>
            </div>
          </SignedOut>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return <WalletSelector onWalletConnected={(wallet) => {
      if (wallet.type === "chippipay") {
        setShowChippiCreation(true);
      } else {
        handleWalletConnected(wallet);
      }
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <NavigationTabs />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atomic Swap Builder</h1>
            <p className="text-sm text-gray-600 mt-1">
              Cross-chain swaps: Starknet ⟷ Bitcoin ⟷ Solana
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Connected: <span className="font-mono">{wallet.address}</span> ({wallet.type})
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
        <AtomicSwapBuilder wallet={wallet} isAtomicSwap={true} />
      </div>
    </div>
  );
}

