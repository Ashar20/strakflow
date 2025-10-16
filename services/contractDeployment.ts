/**
 * Contract Deployment Service
 * Handles deployment of tokens, contracts, and NFTs on Starknet
 */

const BASE_URL = "http://192.168.29.25:5000";

export interface CreateTokenParams {
  name: string;
  symbol: string;
  max_token: number;
  decimals: number;
}

export interface DeployContractParams {
  cairoCode: string;
  contractName?: string;
}

export interface DeployNFTParams {
  name: string;
  symbol: string;
  base_uri: string;
}

export interface MintNFTParams {
  contract_address: string;
  recipient: string;
  uri: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
  details?: any;
}

/**
 * Create a new ERC20 token
 */
export async function createToken(
  params: CreateTokenParams
): Promise<DeploymentResult> {
  try {
    console.log("🪙 Creating token:", params);

    const response = await fetch(`${BASE_URL}/create-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Token created successfully:", data);

    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ Token creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token creation failed",
    };
  }
}

/**
 * Deploy a custom Cairo smart contract
 */
export async function deployContract(
  params: DeployContractParams
): Promise<DeploymentResult> {
  try {
    console.log("📄 Deploying contract...");

    const response = await fetch(`${BASE_URL}/deploy-contract`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: params.cairoCode,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Contract deployed successfully:", data);

    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ Contract deployment failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Contract deployment failed",
    };
  }
}

/**
 * Deploy an ERC721 NFT collection
 */
export async function deployNFT(
  params: DeployNFTParams
): Promise<DeploymentResult> {
  try {
    console.log("🖼️ Deploying NFT collection:", params);

    const response = await fetch(`${BASE_URL}/deploy-nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ NFT collection deployed successfully:", data);

    return {
      success: true,
      contractAddress: data.contract_address || data.contractAddress,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ NFT deployment failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "NFT deployment failed",
    };
  }
}

/**
 * Mint an NFT from a deployed collection
 */
export async function mintNFT(
  params: MintNFTParams
): Promise<DeploymentResult> {
  try {
    console.log("🎨 Minting NFT:", params);

    const response = await fetch(`${BASE_URL}/mint-nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ NFT minted successfully:", data);

    return {
      success: true,
      transactionHash: data.transaction_hash || data.transactionHash,
      details: data,
    };
  } catch (error) {
    console.error("❌ NFT minting failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "NFT minting failed",
    };
  }
}

/**
 * Get contract deployment status
 */
export async function getDeploymentStatus(
  transactionHash: string
): Promise<{ status: string; details?: any }> {
  try {
    // This endpoint might need to be added to your backend
    const response = await fetch(
      `${BASE_URL}/tx-status/${transactionHash}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      return { status: "unknown" };
    }

    const data = await response.json();
    return { status: data.status, details: data };
  } catch (error) {
    console.error("❌ Failed to get deployment status:", error);
    return { status: "error" };
  }
}

