"use client";

import { useState } from "react";
import { Wallet, Upload } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "chippipay",
    name: "Chippi Pay",
    description: "Create or connect Chippi Pay wallet",
    icon: "💳",
  },
  {
    id: "argentx",
    name: "ArgentX",
    description: "Connect your ArgentX wallet",
    icon: "🦊",
  },
  {
    id: "braavos",
    name: "Braavos",
    description: "Connect your Braavos wallet",
    icon: "🛡️",
  },
  {
    id: "privatekey",
    name: "Load with Private Key",
    description: "Import existing wallet using private key",
    icon: "🔑",
  },
  {
    id: "manual",
    name: "Load Existing Address",
    description: "Enter a production wallet address",
    icon: "📝",
  },
];

interface WalletSelectorProps {
  onWalletConnected: (wallet: { address: string; type: string }) => void;
}

export default function WalletSelector({ onWalletConnected }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setError(null);

    if (walletId === "manual" || walletId === "chippipay" || walletId === "privatekey") {
      // Manual address entry, Chippi Pay, or private key - don't auto-connect
      return;
    }

    setIsConnecting(true);

    try {
      // Check if wallet extension is available
      const starknet = (window as any).starknet;
      
      if (!starknet) {
        throw new Error(`${walletId === "argentx" ? "ArgentX" : "Braavos"} wallet extension not found. Please install it first.`);
      }

      // Connect to the wallet
      await starknet.enable({ starknetVersion: "v5" });

      if (!starknet.selectedAddress) {
        throw new Error("No wallet address found");
      }

      const walletData = {
        address: starknet.selectedAddress,
        type: walletId === "argentx" ? "ArgentX" : "Braavos",
      };

      console.log("✅ Wallet connected:", walletData);
      onWalletConnected(walletData);
    } catch (err: any) {
      console.error("❌ Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      setIsConnecting(false);
    }
  };

  const handleManualConnect = () => {
    if (!manualAddress) {
      setError("Please enter a wallet address");
      return;
    }

    // Basic validation for Starknet address format
    if (!manualAddress.startsWith("0x") || manualAddress.length < 60) {
      setError("Invalid Starknet address format. Address should start with 0x and be at least 60 characters.");
      return;
    }

    const walletData = {
      address: manualAddress,
      type: "Manual (Production)",
    };

    console.log("✅ Manual wallet loaded:", walletData);
    onWalletConnected(walletData);
  };

  const handlePrivateKeyConnect = async () => {
    if (!privateKey) {
      setError("Please enter a private key");
      return;
    }

    // Basic validation for private key format
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
      setError("Invalid private key format. Private key should start with 0x and be 66 characters long.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Call backend API to derive wallet address from private key
      const response = await fetch("/api/wallet/derive-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privateKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to derive wallet address");
      }

      const data = await response.json();
      const { address, publicKey } = data;

      const walletData = {
        address: address,
        type: "Private Key",
        privateKey: privateKey, // Store for signing transactions
      };

      console.log("✅ Wallet loaded from private key:", { 
        address, 
        publicKey,
        type: walletData.type 
      });
      
      // Save private key to localStorage securely (in production, use better encryption)
      localStorage.setItem("wallet_private_key", privateKey);
      
      onWalletConnected(walletData);
    } catch (err: any) {
      console.error("❌ Failed to load wallet from private key:", err);
      setError(err.message || "Failed to load wallet from private key");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Choose a wallet to continue to the workflow builder
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {walletOptions.map((wallet) => (
            <div key={wallet.id}>
              <button
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isConnecting && selectedWallet !== "manual"}
                className={`w-full p-6 border-2 rounded-xl transition-all ${
                  selectedWallet === wallet.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                } ${
                  isConnecting && selectedWallet !== "manual"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {wallet.name}
                    </h3>
                    <p className="text-sm text-gray-600">{wallet.description}</p>
                  </div>
                  {isConnecting && selectedWallet === wallet.id && wallet.id !== "manual" && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </button>

              {/* Chippi Pay Selection */}
              {selectedWallet === "chippipay" && wallet.id === "chippipay" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    Create or connect your Chippi Pay wallet with Clerk authentication.
                  </p>
                  <button
                    onClick={() => onWalletConnected({ address: "", type: "chippipay" })}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Continue to Chippi Pay
                  </button>
                </div>
              )}

              {/* Private Key Input */}
              {selectedWallet === "privatekey" && wallet.id === "privatekey" && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Private Key
                  </label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 font-mono text-sm"
                  />
                  <button
                    onClick={handlePrivateKeyConnect}
                    disabled={isConnecting}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Load Wallet
                      </>
                    )}
                  </button>
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Security Warning:</strong> Never share your private key. It will be stored locally in your browser.
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Address Input */}
              {selectedWallet === "manual" && wallet.id === "manual" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starknet Wallet Address
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 font-mono text-sm"
                  />
                  <button
                    onClick={handleManualConnect}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Load Wallet
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    💡 Tip: This is for production addresses. Paste your existing Starknet wallet address.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            🔒 Your wallet connection is secure and local to your browser
          </p>
        </div>
      </div>
    </div>
  );
}
