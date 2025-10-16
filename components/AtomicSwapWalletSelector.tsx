"use client";

import { useState } from "react";
import { Wallet, ExternalLink, AlertCircle } from "lucide-react";
import { connectWalletExtension, getInstalledStarknetWallets, getInstalledSolanaWallets } from "@/services/walletExtension";

interface AtomicSwapWalletSelectorProps {
  onWalletConnected: (wallet: { address: string; type: string }) => void;
}

export default function AtomicSwapWalletSelector({
  onWalletConnected,
}: AtomicSwapWalletSelectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<"Starknet" | "Solana">("Starknet");

  const handleWalletConnect = async (walletType: "ArgentX" | "Braavos" | "Phantom" | "Backpack") => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log(`🔌 Connecting to ${walletType} extension...`);
      
      const wallet = await connectWalletExtension(walletType);
      
      console.log(`✅ Successfully connected to ${walletType}:`, wallet.address);
      
      onWalletConnected({
        address: wallet.address,
        type: `${walletType} (Atomic Swap - Testnet)`,
      });
    } catch (err: any) {
      console.error(`❌ Failed to connect to ${walletType}:`, err);
      setError(err.message || `Failed to connect to ${walletType}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const installedStarknetWallets = getInstalledStarknetWallets();
  const installedSolanaWallets = getInstalledSolanaWallets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect Wallet for Atomic Swap
          </h1>
          <p className="text-gray-600">
            Choose your wallet to start cross-chain swaps on <span className="font-semibold text-blue-600">Testnet</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Testnet Only: Sepolia, Bitcoin Testnet, Solana Devnet
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Connection Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Chain Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Chain
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedChain("Starknet")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedChain === "Starknet"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-900">Starknet</div>
              <div className="text-xs text-gray-500 mt-1">Sepolia Testnet</div>
            </button>
            <button
              onClick={() => setSelectedChain("Solana")}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedChain === "Solana"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-900">Solana</div>
              <div className="text-xs text-gray-500 mt-1">Devnet</div>
            </button>
          </div>
        </div>

        {/* Starknet Wallets */}
        {selectedChain === "Starknet" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Starknet Wallets
            </label>
            
            <button
              onClick={() => handleWalletConnect("ArgentX")}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">ArgentX</div>
                  <div className="text-xs text-gray-500">
                    {installedStarknetWallets.includes("ArgentX") 
                      ? "✓ Installed" 
                      : "Not installed - Click to install"}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
            </button>

            <button
              onClick={() => handleWalletConnect("Braavos")}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Braavos</div>
                  <div className="text-xs text-gray-500">
                    {installedStarknetWallets.includes("Braavos") 
                      ? "✓ Installed" 
                      : "Not installed - Click to install"}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
            </button>
          </div>
        )}

        {/* Solana Wallets */}
        {selectedChain === "Solana" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Solana Wallets
            </label>
            
            <button
              onClick={() => handleWalletConnect("Phantom")}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  P
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Phantom</div>
                  <div className="text-xs text-gray-500">
                    {installedSolanaWallets.includes("Phantom") 
                      ? "✓ Installed" 
                      : "Not installed - Click to install"}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
            </button>

            <button
              onClick={() => handleWalletConnect("Backpack")}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Backpack</div>
                  <div className="text-xs text-gray-500">
                    {installedSolanaWallets.includes("Backpack") 
                      ? "✓ Installed" 
                      : "Not installed - Click to install"}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="mt-6 flex items-center justify-center gap-2 text-purple-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span className="text-sm font-medium">Connecting to wallet...</span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your keys, your crypto. We never store your private keys.
            <br />
            Using testnet networks only for atomic swaps.
          </p>
        </div>
      </div>
    </div>
  );
}

