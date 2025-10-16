"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NavigationTabs } from "@/components/NavigationTabs";
import AtomicSwapWalletSelector from "@/components/AtomicSwapWalletSelector";
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
    console.log("🎯 Atomic Swap - handleWalletConnected called with:", walletData);
    setWallet(walletData);
    // Save to localStorage (shared with main workflow)
    localStorage.setItem("connectedWallet", JSON.stringify(walletData));
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("connectedWallet");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show atomic swap wallet selector if no wallet connected
  if (!wallet) {
    return <AtomicSwapWalletSelector onWalletConnected={handleWalletConnected} />;
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

