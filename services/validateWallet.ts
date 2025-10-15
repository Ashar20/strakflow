/**
 * Wallet Validation Service
 * Validates wallet connectivity, balance, and available tokens
 */

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress: string;
  usdValue?: string;
}

export interface WalletValidationResult {
  isValid: boolean;
  hasBalance: boolean;
  tokens: Token[];
  totalUsdValue: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validate wallet and fetch balance/tokens
 */
export async function validateWallet(
  walletAddress: string,
  validationType: "Quick Check" | "Full Validation" | "With Token Scan" = "Full Validation",
  minimumBalanceCheck: "Skip" | "Check ETH Only" | "Check All Tokens" = "Check ETH Only"
): Promise<WalletValidationResult> {
  console.log(`🔍 Validating wallet`);
  console.log(`   Address: ${walletAddress}`);
  console.log(`   Type: ${validationType}`);
  console.log(`   Balance Check: ${minimumBalanceCheck}`);

  const result: WalletValidationResult = {
    isValid: false,
    hasBalance: false,
    tokens: [],
    totalUsdValue: "$0.00",
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Validate wallet address format
    if (!isValidStarknetAddress(walletAddress)) {
      result.errors.push("Invalid Starknet address format");
      return result;
    }
    result.isValid = true;

    // Step 2: Quick check - just verify address is valid
    if (validationType === "Quick Check") {
      result.warnings.push("Quick check only validates address format");
      return result;
    }

    // Step 3: Fetch wallet balances
    const tokens = await fetchWalletTokens(walletAddress, validationType);
    result.tokens = tokens;

    // Step 4: Check if wallet has balance
    if (minimumBalanceCheck !== "Skip") {
      const hasBalance = checkMinimumBalance(tokens, minimumBalanceCheck);
      result.hasBalance = hasBalance;

      if (!hasBalance) {
        result.warnings.push("Wallet has insufficient balance for transactions");
      }
    }

    // Step 5: Calculate total USD value
    result.totalUsdValue = calculateTotalUsdValue(tokens);

    // Step 6: Additional validations for full check
    if (validationType === "Full Validation" || validationType === "With Token Scan") {
      // Check if wallet is a contract or EOA
      const walletInfo = await checkWalletType(walletAddress);
      if (walletInfo.isContract) {
        result.warnings.push(`Wallet is a smart contract (${walletInfo.contractType})`);
      }
    }

    console.log(`✅ Validation complete: ${result.tokens.length} tokens found`);
    console.log(`   Total value: ${result.totalUsdValue}`);

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
 * Fetch wallet tokens from Starknet blockchain using RPC
 */
async function fetchWalletTokens(
  address: string,
  validationType: string
): Promise<Token[]> {
  const tokens: Token[] = [];

  // Known token contracts on Starknet Mainnet
  const knownTokens = [
    {
      symbol: "ETH",
      name: "Ethereum",
      contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      decimals: 18,
    },
    {
      symbol: "STRK",
      name: "Starknet Token",
      contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      decimals: 18,
    },
  ];

  // For "With Token Scan", add more tokens
  if (validationType === "With Token Scan") {
    knownTokens.push(
      {
        symbol: "USDC",
        name: "USD Coin",
        contractAddress: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        decimals: 6,
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        contractAddress: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
        decimals: 6,
      }
    );
  }

  // Get RPC URL from environment (use the provided Blast API endpoint)
  const rpcUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8")
    : "https://starknet-mainnet.public.blastapi.io/rpc/v0_8";

  console.log(`📡 Fetching balances from Starknet RPC: ${rpcUrl.substring(0, 50)}...`);

  // Fetch balances using direct RPC calls
  for (const tokenInfo of knownTokens) {
    try {
      console.log(`\n📊 Fetching ${tokenInfo.symbol} balance...`);
      
      // Call balanceOf function using Starknet RPC
      const balance = await callStarknetContract(
        rpcUrl,
        tokenInfo.contractAddress,
        "balanceOf",
        [address]
      );

      console.log(`   Raw balance: ${balance}`);

      // Convert balance from hex to decimal and format
      const balanceNum = BigInt(balance || "0x0");
      const formattedBalance = (Number(balanceNum) / Math.pow(10, tokenInfo.decimals)).toFixed(4);

      console.log(`   Formatted balance: ${formattedBalance} ${tokenInfo.symbol}`);

      // TODO: Fetch real USD price from oracle or API
      const usdValue = "$0.00"; // Placeholder until price feed is integrated

      tokens.push({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        balance: formattedBalance,
        decimals: tokenInfo.decimals,
        contractAddress: tokenInfo.contractAddress,
        usdValue: usdValue,
      });

      console.log(`  ✓ ${tokenInfo.symbol}: ${formattedBalance}`);
    } catch (error) {
      console.error(`  ✗ Error fetching ${tokenInfo.symbol} balance:`, error);
      // Add token with 0 balance on error
      tokens.push({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        balance: "0.0000",
        decimals: tokenInfo.decimals,
        contractAddress: tokenInfo.contractAddress,
        usdValue: "$0.00",
      });
    }
  }

  return tokens;
}

/**
 * Call Starknet contract function via RPC
 */
async function callStarknetContract(
  rpcUrl: string,
  contractAddress: string,
  functionName: string,
  calldata: string[]
): Promise<string> {
  try {
    console.log(`🔗 Calling ${functionName} on ${contractAddress.substring(0, 10)}...`);
    console.log(`   RPC: ${rpcUrl}`);
    console.log(`   Calldata:`, calldata);
    
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
            contract_address: contractAddress,
            entry_point_selector: getSelectorFromName(functionName),
            calldata: calldata,
          },
          block_id: "latest",
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`   Response:`, data);

    if (data.error) {
      console.error("❌ RPC error:", data.error);
      throw new Error(data.error.message || "RPC call failed");
    }

    // Return the first result (balance is typically in result[0])
    const balance = data.result?.[0] || "0x0";
    console.log(`   ✓ Balance: ${balance}`);
    return balance;
  } catch (error) {
    console.error("❌ RPC call error:", error);
    // Return 0x0 instead of throwing to prevent execution from stopping
    return "0x0";
  }
}

/**
 * Get selector from function name (simple hash for common functions)
 * In production, use starknet.js hash.getSelectorFromName()
 */
function getSelectorFromName(name: string): string {
  // Known selectors for ERC20 functions
  const selectors: Record<string, string> = {
    balanceOf: "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e",
    transfer: "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",
    approve: "0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
  };

  return selectors[name] || "0x0";
}

/**
 * Check if wallet has minimum balance
 */
function checkMinimumBalance(
  tokens: Token[],
  checkType: "Skip" | "Check ETH Only" | "Check All Tokens"
): boolean {
  if (checkType === "Skip") return true;

  if (checkType === "Check ETH Only") {
    const eth = tokens.find(t => t.symbol === "ETH");
    return eth ? parseFloat(eth.balance) > 0 : false;
  }

  // Check All Tokens
  return tokens.some(t => parseFloat(t.balance) > 0);
}

/**
 * Calculate total USD value
 */
function calculateTotalUsdValue(tokens: Token[]): string {
  const total = tokens.reduce((sum, token) => {
    const value = parseFloat(token.usdValue?.replace(/[$,]/g, "") || "0");
    return sum + value;
  }, 0);

  return total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/**
 * Check wallet type (contract or EOA)
 */
async function checkWalletType(address: string): Promise<{
  isContract: boolean;
  contractType?: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock - In production, check if address has deployed code
  // For Starknet, check if it's an Account contract
  return {
    isContract: true,
    contractType: "Account Contract (ArgentX/Braavos/ChippyPay)",
  };
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: WalletValidationResult): string {
  let output = "🔍 Wallet Validation Results\n";
  output += "═".repeat(50) + "\n\n";

  output += `✅ Valid Address: ${result.isValid ? "Yes" : "No"}\n`;
  output += `💰 Has Balance: ${result.hasBalance ? "Yes" : "No"}\n`;
  output += `💵 Total Value: ${result.totalUsdValue}\n\n`;

  if (result.tokens.length > 0) {
    output += `📊 Tokens Found (${result.tokens.length}):\n`;
    result.tokens.forEach(token => {
      output += `   • ${token.symbol}: ${token.balance} (${token.usdValue})\n`;
    });
    output += "\n";
  }

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

