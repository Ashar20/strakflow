/**
 * Contract Builder Service using Agentic Stark
 * Generates smart contract code based on natural language instructions
 */

const BASE_URL = "http://192.168.29.25:5000";

export interface ContractBuilderRequest {
  instructions: string;
  contractType?: "Cairo" | "Solidity" | "Auto-detect";
  contractName?: string;
}

export interface ContractBuilderResponse {
  success: boolean;
  contractCode?: string;
  contractName?: string;
  contractType?: string;
  explanation?: string;
  error?: string;
}

/**
 * Build contract with Agentic Stark
 */
export async function buildContractWithAgenticStark(
  request: ContractBuilderRequest
): Promise<ContractBuilderResponse> {
  try {
    console.log("🤖 Building contract with Agentic Stark:", request);

    const response = await fetch(`${BASE_URL}/build-contract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instructions: request.instructions,
        contractType: request.contractType || "Cairo",
        contractName: request.contractName || "GeneratedContract",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("✅ Contract built successfully:", data);

    return {
      success: true,
      contractCode: data.contractCode,
      contractName: data.contractName || request.contractName,
      contractType: data.contractType || request.contractType,
      explanation: data.explanation,
    };
  } catch (error) {
    console.error("❌ Failed to build contract:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to build contract",
    };
  }
}

/**
 * Validate contract instructions
 */
export function validateContractInstructions(instructions: string): {
  valid: boolean;
  error?: string;
} {
  if (!instructions || instructions.trim().length === 0) {
    return {
      valid: false,
      error: "Contract instructions are required",
    };
  }

  if (instructions.length < 10) {
    return {
      valid: false,
      error: "Contract instructions must be at least 10 characters long",
    };
  }

  if (instructions.length > 2000) {
    return {
      valid: false,
      error: "Contract instructions must be less than 2000 characters",
    };
  }

  return { valid: true };
}

/**
 * Get contract type suggestions based on instructions
 */
export function getContractTypeSuggestions(instructions: string): string[] {
  const lowerInstructions = instructions.toLowerCase();
  
  if (lowerInstructions.includes("starknet") || lowerInstructions.includes("cairo")) {
    return ["Cairo"];
  }
  
  if (lowerInstructions.includes("ethereum") || lowerInstructions.includes("solidity")) {
    return ["Solidity"];
  }
  
  if (lowerInstructions.includes("counter") || lowerInstructions.includes("simple")) {
    return ["Cairo", "Solidity"];
  }
  
  return ["Auto-detect"];
}

/**
 * Format contract code for display
 */
export function formatContractCode(code: string, contractType: string): string {
  if (!code) return "";
  
  // Add syntax highlighting hints based on contract type
  if (contractType === "Cairo") {
    return `// Cairo Contract\n${code}`;
  }
  
  if (contractType === "Solidity") {
    return `// Solidity Contract\n${code}`;
  }
  
  return code;
}

/**
 * Get example instructions for different contract types
 */
export const EXAMPLE_INSTRUCTIONS = {
  counter: "Create a minimal counter-like contract with increment/decrement and a getter.",
  token: "Create an ERC20 token contract with mint, burn, and transfer functions.",
  nft: "Create an ERC721 NFT contract with minting and metadata support.",
  voting: "Create a simple voting contract where users can vote on proposals.",
  auction: "Create an auction contract where users can bid on items.",
  multisig: "Create a multi-signature wallet contract requiring multiple approvals.",
  staking: "Create a staking contract where users can stake tokens and earn rewards.",
  dao: "Create a DAO governance contract with proposal and voting mechanisms.",
};
