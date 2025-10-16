/**
 * Token Transfer Service
 * Handles token transfers using Chippi Pay SDK
 */

export interface TransferResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  details?: any;
}

// Token contract addresses on Starknet Mainnet
const TOKEN_CONTRACTS = {
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
};

/**
 * Transfer tokens using Chippi Pay SDK
 * This calls the backend API which uses the Chippi Pay SDK
 */
export async function transferToken(
  token: "ETH" | "STRK" | "USDC" | "USDT",
  receiverAddress: string,
  amount: string,
  encryptKey: string,
  walletAddress: string
): Promise<TransferResult> {
  console.log(`💸 Initiating token transfer via Chippi Pay SDK`);
  console.log(`   Token: ${token}`);
  console.log(`   Receiver: ${receiverAddress}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   From: ${walletAddress}`);

  try {
    // Validate inputs
    if (!receiverAddress || !receiverAddress.startsWith("0x")) {
      throw new Error("Invalid receiver address");
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("Invalid amount");
    }

    if (!encryptKey) {
      throw new Error("Encryption key is required for transfer");
    }

    // Get token contract address
    const tokenContract = TOKEN_CONTRACTS[token];
    if (!tokenContract) {
      throw new Error(`Unsupported token: ${token}`);
    }

    console.log(`📄 Token contract: ${tokenContract}`);

    // Call backend API to handle transfer with Chippi Pay SDK
    const response = await fetch("/api/chipi-wallet/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        receiverAddress,
        amount,
        encryptKey,
        walletAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Transfer failed" }));
      throw new Error(errorData.error || `Transfer failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log(`✅ Transfer successful`);
    console.log(`   Transaction Hash: ${data.transactionHash}`);

    return {
      success: true,
      transactionHash: data.transactionHash,
      details: {
        token,
        from: walletAddress,
        to: receiverAddress,
        amount,
        tokenContract,
        ...data.details,
      },
    };
  } catch (error) {
    console.error(`❌ Transfer failed:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Transfer tokens using Chippi Pay SDK (with Clerk auth)
 */
export async function transferTokenWithChippiPay(
  token: "ETH" | "STRK" | "USDC" | "USDT",
  receiverAddress: string,
  amount: string,
  encryptKey: string,
  userId: string,
  bearerToken: string
): Promise<TransferResult> {
  console.log(`💸 Initiating Chippi Pay transfer`);
  console.log(`   Token: ${token}`);
  console.log(`   Receiver: ${receiverAddress}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   User ID: ${userId}`);

  try {
    // Call backend API to handle transfer
    const response = await fetch("/api/chipi-wallet/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        receiverAddress,
        amount,
        encryptKey,
        bearerToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Transfer failed");
    }

    const data = await response.json();

    console.log(`✅ Transfer successful via Chippi Pay`);
    console.log(`   Transaction Hash: ${data.transactionHash}`);

    return {
      success: true,
      transactionHash: data.transactionHash,
      details: data.details,
    };
  } catch (error) {
    console.error(`❌ Chippi Pay transfer failed:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get token decimals
 */
export function getTokenDecimals(token: "ETH" | "STRK" | "USDC" | "USDT"): number {
  switch (token) {
    case "ETH":
    case "STRK":
      return 18;
    case "USDC":
    case "USDT":
      return 6;
    default:
      return 18;
  }
}

/**
 * Format amount with token decimals
 */
export function formatTokenAmount(amount: string, token: "ETH" | "STRK" | "USDC" | "USDT"): string {
  const decimals = getTokenDecimals(token);
  const amountNum = parseFloat(amount);
  
  if (isNaN(amountNum)) {
    return "0";
  }

  return amountNum.toFixed(decimals);
}

/**
 * Get token contract address
 */
export function getTokenContract(token: "ETH" | "STRK" | "USDC" | "USDT"): string {
  return TOKEN_CONTRACTS[token];
}

