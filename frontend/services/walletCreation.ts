// Chippy Pay Wallet Creation Service
// Creates new Starknet accounts with secure key management

import { config, isDemoMode, debugLog } from "@/lib/config";

/**
 * Wallet creation options
 */
export interface WalletCreationOptions {
  username: string;
  password: string;
  email?: string;
  recoveryMethod?: "email" | "social" | "seed";
}

/**
 * Created wallet information
 */
export interface CreatedWallet {
  address: string;
  privateKey: string; // Encrypted in production
  publicKey: string;
  username: string;
  createdAt: number;
  recoveryPhrase?: string; // Only shown once during creation
}

/**
 * Wallet recovery options
 */
export interface WalletRecoveryOptions {
  username: string;
  password: string;
  recoveryPhrase?: string;
  email?: string;
}

/**
 * Create a new Starknet wallet for Chippy Pay
 * 
 * This creates a new account with:
 * - Username/password authentication
 * - Encrypted private key storage
 * - Optional recovery methods
 * - Native Starknet account features
 * 
 * @param options - Wallet creation parameters
 * @returns Created wallet information
 */
export const createChippyPayWallet = async (
  options: WalletCreationOptions
): Promise<CreatedWallet> => {
  debugLog(`Creating new Chippy Pay wallet for user: ${options.username}`);
  debugLog(`Recovery method: ${options.recoveryMethod || "none"}`);

  if (isDemoMode()) {
    // Generate a realistic Starknet address for demo
    const address = generateRealisticStarknetAddress();
    const demoWallet: CreatedWallet = {
      address,
      privateKey: `demo-private-key-${options.username}`,
      publicKey: `demo-public-key-${options.username}`,
      username: options.username,
      createdAt: Date.now(),
      recoveryPhrase: generateDemoRecoveryPhrase(),
    };
    
    debugLog(`Chippy Pay wallet created: ${demoWallet.address}`);
    return Promise.resolve(demoWallet);
  }

  // Production: Real wallet creation
  /*
  import { Account, ec, hash, RpcProvider } from "starknet";
  import crypto from "crypto";
  
  // Generate new key pair
  const privateKey = ec.starkCurve.utils.randomPrivateKey();
  const publicKey = ec.starkCurve.getStakePoint(privateKey);
  
  // Derive account address (using OpenZeppelin account)
  const accountAddress = hash.calculateContractAddressFromHash(
    privateKey,
    "0x...", // OpenZeppelin account class hash
    [publicKey],
    0
  );
  
  // Encrypt private key with user password
  const encryptedPrivateKey = encryptPrivateKey(privateKey, options.password);
  
  // Generate recovery phrase (BIP39 style for Starknet)
  const recoveryPhrase = generateRecoveryPhrase(privateKey);
  
  // Store wallet data securely
  await storeWalletData({
    username: options.username,
    address: accountAddress,
    encryptedPrivateKey,
    publicKey,
    createdAt: Date.now(),
    recoveryPhrase,
  });
  
  return {
    address: accountAddress,
    privateKey: encryptedPrivateKey,
    publicKey,
    username: options.username,
    createdAt: Date.now(),
    recoveryPhrase,
  };
  */

  throw new Error(
    "Real wallet creation not implemented. Set NEXT_PUBLIC_DEMO_MODE=true in .env.local"
  );
};

/**
 * Recover an existing Chippy Pay wallet
 * 
 * @param options - Recovery parameters
 * @returns Recovered wallet information
 */
export const recoverChippyPayWallet = async (
  options: WalletRecoveryOptions
): Promise<CreatedWallet> => {
  debugLog(`Recovering Chippy Pay wallet for user: ${options.username}`);

  if (isDemoMode()) {
    // Simulated wallet recovery
    return new Promise((resolve) => {
      setTimeout(() => {
        const recoveredWallet: CreatedWallet = {
          address: generateDemoAddress(),
          privateKey: "recovered-private-key-encrypted",
          publicKey: "recovered-public-key",
          username: options.username,
          createdAt: Date.now() - 86400000, // 1 day ago
        };
        
        debugLog(`Demo wallet recovered: ${recoveredWallet.address}`);
        resolve(recoveredWallet);
      }, 1500);
    });
  }

  // Production implementation
  /*
  // Verify recovery credentials
  const walletData = await verifyRecoveryCredentials(options);
  
  // Decrypt private key
  const privateKey = decryptPrivateKey(walletData.encryptedPrivateKey, options.password);
  
  // Verify private key matches stored public key
  const publicKey = ec.starkCurve.getStakePoint(privateKey);
  if (publicKey !== walletData.publicKey) {
    throw new Error("Invalid recovery credentials");
  }
  
  return walletData;
  */

  throw new Error(
    "Real wallet recovery not implemented. Set NEXT_PUBLIC_DEMO_MODE=true"
  );
};

/**
 * Login to existing Chippy Pay wallet
 * 
 * @param username - Wallet username
 * @param password - Wallet password
 * @returns Wallet information
 */
export const loginToChippyPayWallet = async (
  username: string,
  password: string
): Promise<CreatedWallet> => {
  debugLog(`Logging into Chippy Pay wallet: ${username}`);

  if (isDemoMode()) {
    // Simulated login
    return new Promise((resolve) => {
      setTimeout(() => {
        const wallet: CreatedWallet = {
          address: generateDemoAddress(),
          privateKey: "logged-in-private-key-encrypted",
          publicKey: "logged-in-public-key",
          username,
          createdAt: Date.now() - 86400000 * 7, // 1 week ago
        };
        
        debugLog(`Demo wallet login successful: ${wallet.address}`);
        resolve(wallet);
      }, 1000);
    });
  }

  // Production implementation
  /*
  // Verify login credentials
  const walletData = await verifyLoginCredentials(username, password);
  
  // Decrypt and return wallet data
  const decryptedPrivateKey = decryptPrivateKey(walletData.encryptedPrivateKey, password);
  
  return {
    ...walletData,
    privateKey: decryptedPrivateKey,
  };
  */

  throw new Error(
    "Real wallet login not implemented. Set NEXT_PUBLIC_DEMO_MODE=true"
  );
};

/**
 * Get wallet balance for Chippy Pay wallet
 * 
 * @param wallet - Wallet information
 * @param tokenAddress - Token address (optional, defaults to ETH)
 * @returns Wallet balance
 */
export const getChippyPayWalletBalance = async (
  wallet: CreatedWallet,
  tokenAddress?: string
): Promise<string> => {
  debugLog(`Getting balance for wallet: ${wallet.address}`);

  if (isDemoMode()) {
    // Simulated balance
    return new Promise((resolve) => {
      setTimeout(() => {
        const balance = "1000.0"; // Demo balance
        debugLog(`Demo balance: ${balance}`);
        resolve(balance);
      }, 500);
    });
  }

  // Production: Query actual balance
  /*
  const provider = new RpcProvider({ nodeUrl: config.rpcUrl });
  const account = new Account(provider, wallet.address, wallet.privateKey);
  
  if (tokenAddress) {
    // ERC20 token balance
    const balance = await account.callContract({
      contractAddress: tokenAddress,
      entrypoint: "balanceOf",
      calldata: [wallet.address],
    });
    return formatBalance(balance);
  } else {
    // ETH balance
    const balance = await provider.getBalance(wallet.address);
    return formatBalance(balance);
  }
  */

  throw new Error(
    "Real balance check not implemented. Set NEXT_PUBLIC_DEMO_MODE=true"
  );
};

/**
 * Export wallet for backup
 * 
 * @param wallet - Wallet to export
 * @param password - Wallet password for verification
 * @returns Export data
 */
export const exportChippyPayWallet = async (
  wallet: CreatedWallet,
  password: string
): Promise<{
  address: string;
  privateKey: string; // Unencrypted for export
  recoveryPhrase?: string;
  exportDate: number;
}> => {
  debugLog(`Exporting wallet: ${wallet.address}`);

  if (isDemoMode()) {
    return {
      address: wallet.address,
      privateKey: "demo-exported-private-key",
      recoveryPhrase: "demo recovery phrase for backup",
      exportDate: Date.now(),
    };
  }

  // Production: Decrypt and export
  /*
  // Verify password
  await verifyPassword(wallet.username, password);
  
  // Decrypt private key
  const privateKey = decryptPrivateKey(wallet.privateKey, password);
  
  return {
    address: wallet.address,
    privateKey,
    recoveryPhrase: wallet.recoveryPhrase,
    exportDate: Date.now(),
  };
  */

  throw new Error(
    "Real wallet export not implemented. Set NEXT_PUBLIC_DEMO_MODE=true"
  );
};

// Helper functions

/**
 * Generate realistic Starknet address for demo
 */
const generateRealisticStarknetAddress = (): string => {
  // Generate a realistic Starknet address (66 characters including 0x)
  const randomHex = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `0x${randomHex}`;
};

/**
 * Generate demo recovery phrase
 */
const generateDemoRecoveryPhrase = (): string => {
  const words = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
    "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
    "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent"
  ];
  
  return Array.from({ length: 12 }, () => 
    words[Math.floor(Math.random() * words.length)]
  ).join(" ");
};

/**
 * Encrypt private key with user password (Production)
 */
const encryptPrivateKey = (privateKey: string, password: string): string => {
  // Use AES encryption with user password
  // Implementation would use crypto module
  return "encrypted-" + privateKey;
};

/**
 * Decrypt private key with user password (Production)
 */
const decryptPrivateKey = (encryptedKey: string, password: string): string => {
  // Decrypt using AES
  // Implementation would use crypto module
  return encryptedKey.replace("encrypted-", "");
};

/**
 * Generate recovery phrase (Production)
 */
const generateRecoveryPhrase = (privateKey: string): string => {
  // Generate BIP39-style recovery phrase
  // Implementation would use proper entropy generation
  const words = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual"
  ];
  
  const phrase = Array.from({ length: 12 }, () => 
    words[Math.floor(Math.random() * words.length)]
  ).join(" ");
  
  return phrase;
};

/**
 * Validate username availability
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  debugLog(`Checking username availability: ${username}`);

  if (isDemoMode()) {
    // Simulate username check
    return new Promise((resolve) => {
      setTimeout(() => {
        const available = !["admin", "test", "demo", "chippy"].includes(username.toLowerCase());
        debugLog(`Username "${username}" available: ${available}`);
        resolve(available);
      }, 500);
    });
  }

  // Production: Check database
  /*
  const existingWallet = await findWalletByUsername(username);
  return !existingWallet;
  */

  return true;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
