"use client";
import { useState } from "react";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import WalletSelector from "@/components/WalletSelector";
import Header from "@/components/Header";

export default function WorkflowPage() {
  const [wallet, setWallet] = useState<{ address: string; type: string } | null>(null);

  const handleWalletConnected = (connectedWallet: { address: string; type: string }) => {
    setWallet(connectedWallet);
  };

  if (!wallet) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-[#FFFDFA] p-8">
          <WalletSelector onWalletConnected={handleWalletConnected} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <WorkflowBuilder wallet={wallet} />
    </div>
  );
}

