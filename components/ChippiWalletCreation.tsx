"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Wallet, CheckCircle } from "lucide-react";

interface ChippiWalletCreationProps {
  onWalletConnected: (wallet: { address: string; type: string }) => void;
}

export default function ChippiWalletCreation({ onWalletConnected }: ChippiWalletCreationProps) {
  const { getToken, userId } = useAuth();
  
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [existingWallet, setExistingWallet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showEncryptionInput, setShowEncryptionInput] = useState(false);

  // Check for existing wallet on mount
  useEffect(() => {
    checkExistingWallet();
  }, [userId]);

  const checkExistingWallet = async () => {
    if (!userId) {
      setIsCheckingWallet(false);
      return;
    }

    try {
      console.log("🔍 Checking for existing Chippi Pay wallet...");
      const token = await getToken();
      
      if (!token) {
        console.log("ℹ️ No auth token available yet");
        setIsCheckingWallet(false);
        return;
      }

      // Call our backend API route instead of using the SDK directly
      const response = await fetch("/api/chipi-wallet/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bearerToken: token }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("ℹ️ No existing wallet found");
          setIsCheckingWallet(false);
          return;
        }
        throw new Error("Failed to fetch wallet");
      }

      const data = await response.json();
      const wallet = data.wallet;
      
      if (wallet) {
        console.log("✅ Found existing wallet:", wallet);
        setExistingWallet(wallet);
        
        // For existing wallet, prompt for encryption key
        setShowEncryptionInput(true);
      } else {
        console.log("ℹ️ No existing wallet found");
      }
    } catch (err: any) {
      // Silently handle expected errors (wallet not found, network issues)
      console.log("ℹ️ No existing wallet found or unable to check");
      // Only set error for unexpected issues
      if (err.message && !err.message.includes("404") && !err.message.includes("Failed to fetch")) {
        console.error("Unexpected error:", err);
      }
    } finally {
      setIsCheckingWallet(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!encryptionKey || encryptionKey.length < 8) {
      setError("Encryption key must be at least 8 characters long");
      return;
    }

    setError(null);
    setIsCreating(true);
    
    try {
      console.log("🚀 Creating Chippi Pay wallet...");
      const token = await getToken();
      
      if (!token) {
        throw new Error("No authentication token available. Please sign in again.");
      }

      // Call our backend API route instead of using the SDK directly
      const response = await fetch("/api/chipi-wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bearerToken: token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create wallet");
      }

      const data = await response.json();
      const wallet = data.wallet;
      
      console.log("✅ Wallet created successfully:", wallet);
      setExistingWallet(wallet);
      
      // Store encryption key in localStorage for transfers
      localStorage.setItem("wallet_private_key", encryptionKey);
      
      const walletData = {
        address: wallet.address,
        type: "Chippi Pay",
      };
      
      onWalletConnected(walletData);
    } catch (err: any) {
      console.error("❌ Failed to create wallet:", err);
      setError(err.message || "Failed to create wallet. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExistingWallet = () => {
    if (!encryptionKey || encryptionKey.length < 8) {
      setError("Please enter your encryption key (minimum 8 characters)");
      return;
    }

    if (!existingWallet) {
      setError("No wallet found");
      return;
    }

    // Store encryption key in localStorage for transfers
    localStorage.setItem("wallet_private_key", encryptionKey);
    
    const walletData = {
      address: existingWallet.address,
      type: "Chippi Pay",
    };
    
    console.log("✅ Connected existing wallet with encryption key");
    onWalletConnected(walletData);
  };

  if (isCheckingWallet) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Checking for existing wallet...</p>
      </div>
    );
  }

  if (existingWallet && !showEncryptionInput) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Wallet Connected!</h3>
        </div>
        <p className="text-sm text-green-800 mb-2">
          Your Chippi Pay wallet is ready to use.
        </p>
          <p className="text-xs text-green-700 font-mono break-all">
          {existingWallet.address}
        </p>
      </div>
    );
  }

  if (existingWallet && showEncryptionInput) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Existing Wallet Found</h3>
        </div>
        
        <p className="text-sm text-blue-800 mb-4">
          We found your Chippi Pay wallet. Please enter your encryption key to connect.
        </p>
        
        <p className="text-xs text-blue-700 font-mono break-all mb-4 p-2 bg-blue-100 rounded">
          {existingWallet.address}
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Encryption Key
        </label>
        <input
          type="password"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          placeholder="Enter your encryption key"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />

        <button
          onClick={handleConnectExistingWallet}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            🔑 <strong>Encryption Key:</strong> This is the password you set when creating your Chippi Pay wallet. It's needed to sign transactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Wallet className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Create Chippi Pay Wallet</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Create a new Chippi Pay wallet to use with the workflow builder. Your wallet will be secured by your Clerk account and an encryption key.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Set Encryption Key (Password)
      </label>
      <input
        type="password"
        value={encryptionKey}
        onChange={(e) => setEncryptionKey(e.target.value)}
        placeholder="Enter a secure password (min 8 characters)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        disabled={isCreating}
      />

      <button
        onClick={handleCreateWallet}
        disabled={isCreating || !encryptionKey || encryptionKey.length < 8}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Wallet...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Create Wallet
          </>
        )}
      </button>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          🔑 <strong>Important:</strong> Remember this encryption key! You'll need it to sign transactions. It's like a password for your wallet.
        </p>
      </div>

      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          ℹ️ <strong>Note:</strong> The Chippi Pay SDK currently only supports mainnet. Wallets created will be on Starknet mainnet, not Sepolia testnet.
        </p>
      </div>
    </div>
  );
}

