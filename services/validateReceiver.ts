/**
 * Receiver Address Validation Service
 * Validates receiver wallet addresses before transfers
 */

export interface ReceiverValidationResult {
  isValid: boolean;
  address: string;
  hasBalance: boolean;
  isDeployed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate receiver address
 */
export async function validateReceiverAddress(
  address: string,
  validationType: "Format Only" | "Format + Balance Check" | "Full Validation" = "Format + Balance Check"
): Promise<ReceiverValidationResult> {
  console.log(`🔍 Validating receiver address`);
  console.log(`   Address: ${address}`);
  console.log(`   Type: ${validationType}`);

  const result: ReceiverValidationResult = {
    isValid: false,
    address: address,
    hasBalance: false,
    isDeployed: false,
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Validate address format
    if (!isValidStarknetAddress(address)) {
      result.errors.push("Invalid Starknet address format");
      return result;
    }
    result.isValid = true;

    // Step 2: Format Only - just verify address is valid
    if (validationType === "Format Only") {
      console.log(`✅ Address format is valid`);
      return result;
    }

    // Step 3: Check if address has balance (Format + Balance Check)
    if (validationType === "Format + Balance Check" || validationType === "Full Validation") {
      const hasBalance = await checkAddressBalance(address);
      result.hasBalance = hasBalance;

      if (!hasBalance) {
        result.warnings.push("Receiver address has no balance (may be a new wallet)");
      }
    }

    // Step 4: Full validation - check if account is deployed
    if (validationType === "Full Validation") {
      const isDeployed = await checkAccountDeployment(address);
      result.isDeployed = isDeployed;

      if (!isDeployed) {
        result.warnings.push("Account not yet deployed on-chain (counterfactual address)");
      }
    }

    console.log(`✅ Receiver validation complete`);
    return result;
  } catch (error) {
    result.errors.push(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return result;
  }
}

/**
 * Validate Starknet address format
 */
function isValidStarknetAddress(address: string): boolean {
  // Starknet addresses are hex strings starting with 0x
  // They should be 66 characters long (0x + 64 hex chars) or shorter
  const regex = /^0x[0-9a-fA-F]{1,64}$/;
  return regex.test(address);
}

/**
 * Check if address has any balance
 */
async function checkAddressBalance(address: string): Promise<boolean> {
  try {
    const rpcUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8")
      : "https://starknet-mainnet.public.blastapi.io/rpc/v0_8";

    // Check ETH balance
    const ethContract = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const balanceOfSelector = "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e";

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "starknet_call",
        params: {
          request: {
            contract_address: ethContract,
            entry_point_selector: balanceOfSelector,
            calldata: [address],
          },
          block_id: "latest",
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to check balance, assuming no balance");
      return false;
    }

    const data = await response.json();
    
    if (data.error) {
      console.warn("RPC error checking balance:", data.error);
      return false;
    }

    const balance = BigInt(data.result?.[0] || "0x0");
    return balance > 0n;
  } catch (error) {
    console.warn("Error checking balance:", error);
    return false;
  }
}

/**
 * Check if account is deployed on-chain
 */
async function checkAccountDeployment(address: string): Promise<boolean> {
  try {
    const rpcUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8")
      : "https://starknet-mainnet.public.blastapi.io/rpc/v0_8";

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "starknet_getClassHashAt",
        params: {
          block_id: "latest",
          contract_address: address,
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    // If there's an error or no class hash, account is not deployed
    if (data.error || !data.result) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Error checking deployment:", error);
    return false;
  }
}

/**
 * Format validation result for display
 */
export function formatReceiverValidationResult(result: ReceiverValidationResult): string {
  let output = "🔍 Receiver Address Validation\n";
  output += "═".repeat(50) + "\n\n";

  output += `✅ Valid Address: ${result.isValid ? "Yes" : "No"}\n`;
  output += `📍 Address: ${result.address}\n`;
  output += `💰 Has Balance: ${result.hasBalance ? "Yes" : "No"}\n`;
  output += `🚀 Deployed: ${result.isDeployed ? "Yes" : "No (Counterfactual)"}\n\n`;

  if (result.errors.length > 0) {
    output += `❌ Errors:\n`;
    result.errors.forEach(error => {
      output += `   • ${error}\n`;
    });
    output += "\n";
  }

  if (result.warnings.length > 0) {
    output += `⚠️  Warnings:\n`;
    result.warnings.forEach(warning => {
      output += `   • ${warning}\n`;
    });
  }

  return output;
}

