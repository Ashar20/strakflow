/**
 * Wallet Extension Service
 * Handles connecting to wallet browser extensions (ArgentX, Braavos, Phantom, etc.)
 */

import { connect, disconnect } from "@starknet-io/get-starknet";

export interface WalletConnection {
  address: string;
  type: string;
  chainId?: string;
  publicKey?: string;
}

/**
 * Connect to Starknet wallet extension (ArgentX or Braavos)
 */
export async function connectStarknetWallet(
  walletId: "argentX" | "braavos"
): Promise<WalletConnection> {
  try {
    console.log(`🔌 Attempting to connect to ${walletId}...`);

    // Check if window is available
    if (typeof window === "undefined") {
      throw new Error("Window object not available");
    }

    // Use get-starknet to connect to the specific wallet
    const wallet = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "light",
      include: [walletId],
    });

    if (!wallet) {
      throw new Error(`${walletId} wallet not found or connection cancelled`);
    }

    // Enable the wallet connection
    await wallet.enable();

    // Wait a bit for the wallet to be fully ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the account address from the wallet
    const address = wallet.selectedAddress || wallet.account?.address;

    if (!address) {
      throw new Error("No address found in wallet. Please make sure your wallet is unlocked and has an account.");
    }

    console.log(`✅ Connected to ${walletId}:`, address);

    return {
      address,
      type: walletId === "argentX" ? "ArgentX" : "Braavos",
      chainId: wallet.chainId,
    };
  } catch (error: any) {
    console.error(`❌ Failed to connect to ${walletId}:`, error);
    
    // Provide more helpful error messages
    if (error.message?.includes("User abort")) {
      throw new Error("Connection cancelled by user");
    } else if (error.message?.includes("not found")) {
      throw new Error(`${walletId === "argentX" ? "ArgentX" : "Braavos"} extension not found. Please install it first.`);
    }
    
    throw error;
  }
}

/**
 * Check if a Starknet wallet extension is installed
 */
export function isStarknetWalletInstalled(
  walletId: "argentX" | "braavos"
): boolean {
  if (typeof window === "undefined") return false;

  // Check for wallet extension in window object
  const windowAny = window as any;

  if (walletId === "argentX") {
    return !!windowAny.starknet_argentX;
  } else if (walletId === "braavos") {
    return !!windowAny.starknet_braavos;
  }

  return false;
}

/**
 * Get installed Starknet wallets
 */
export function getInstalledStarknetWallets(): string[] {
  const wallets: string[] = [];

  if (isStarknetWalletInstalled("argentX")) {
    wallets.push("ArgentX");
  }

  if (isStarknetWalletInstalled("braavos")) {
    wallets.push("Braavos");
  }

  return wallets;
}

/**
 * Disconnect from Starknet wallet
 */
export async function disconnectStarknetWallet(): Promise<void> {
  try {
    await disconnect();
    console.log("✅ Disconnected from Starknet wallet");
  } catch (error) {
    console.error("❌ Failed to disconnect:", error);
  }
}

/**
 * Connect to Solana wallet extension (Phantom or Backpack)
 */
export async function connectSolanaWallet(
  walletId: "phantom" | "backpack"
): Promise<WalletConnection> {
  try {
    console.log(`🔌 Attempting to connect to ${walletId}...`);

    if (typeof window === "undefined") {
      throw new Error("Window object not available");
    }

    const windowAny = window as any;
    const solanaWallet =
      walletId === "phantom" ? windowAny.phantom?.solana : windowAny.backpack;

    if (!solanaWallet) {
      throw new Error(
        `${walletId} wallet not found. Please install the extension.`
      );
    }

    // Request connection
    const response = await solanaWallet.connect();
    const publicKey = response.publicKey.toString();

    console.log(`✅ Connected to ${walletId}:`, publicKey);

    return {
      address: publicKey,
      type: walletId === "phantom" ? "Phantom" : "Backpack",
      publicKey,
    };
  } catch (error) {
    console.error(`❌ Failed to connect to ${walletId}:`, error);
    throw error;
  }
}

/**
 * Check if a Solana wallet extension is installed
 */
export function isSolanaWalletInstalled(
  walletId: "phantom" | "backpack"
): boolean {
  if (typeof window === "undefined") return false;

  const windowAny = window as any;

  if (walletId === "phantom") {
    return !!windowAny.phantom?.solana;
  } else if (walletId === "backpack") {
    return !!windowAny.backpack;
  }

  return false;
}

/**
 * Get installed Solana wallets
 */
export function getInstalledSolanaWallets(): string[] {
  const wallets: string[] = [];

  if (isSolanaWalletInstalled("phantom")) {
    wallets.push("Phantom");
  }

  if (isSolanaWalletInstalled("backpack")) {
    wallets.push("Backpack");
  }

  return wallets;
}

/**
 * Open wallet extension install page if not installed
 */
export function openWalletInstallPage(walletType: string): void {
  const installUrls: Record<string, string> = {
    ArgentX: "https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb",
    Braavos: "https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma",
    Phantom: "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
    Backpack: "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
  };

  const url = installUrls[walletType];
  if (url) {
    window.open(url, "_blank");
  }
}

/**
 * Universal wallet connection handler
 * Opens the wallet extension modal/popup
 */
export async function connectWalletExtension(
  walletType: "ArgentX" | "Braavos" | "Phantom" | "Backpack"
): Promise<WalletConnection> {
  console.log(`🔗 Connecting to ${walletType} wallet extension...`);

  // Check if wallet is installed
  const starknetWallets = ["ArgentX", "Braavos"];
  const solanaWallets = ["Phantom", "Backpack"];

  if (starknetWallets.includes(walletType)) {
    // Map wallet type to correct ID format
    const walletIdMap: Record<string, "argentX" | "braavos"> = { 
      "ArgentX": "argentX", 
      "Braavos": "braavos" 
    };
    const mappedId = walletIdMap[walletType];

    // Check if wallet is installed before trying to connect
    if (!isStarknetWalletInstalled(mappedId)) {
      console.log(`⚠️ ${walletType} not installed, opening install page...`);
      openWalletInstallPage(walletType);
      throw new Error(
        `${walletType} is not installed. Opening installation page... Please install the extension and refresh the page.`
      );
    }

    return await connectStarknetWallet(mappedId);
  } else if (solanaWallets.includes(walletType)) {
    const walletId = walletType.toLowerCase() as "phantom" | "backpack";

    if (!isSolanaWalletInstalled(walletId)) {
      openWalletInstallPage(walletType);
      throw new Error(
        `${walletType} is not installed. Please install the extension and try again.`
      );
    }

    return await connectSolanaWallet(walletId);
  }

  throw new Error(`Unsupported wallet type: ${walletType}`);
}

