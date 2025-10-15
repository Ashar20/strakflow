import { NextRequest, NextResponse } from "next/server";
import { Account, ec, hash, CallData, RpcProvider } from "starknet";

// ArgentX account class hash (this is the standard ArgentX account contract)
const ARGENTX_ACCOUNT_CLASS_HASH = "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

// OpenZeppelin account class hash (alternative)
const OZ_ACCOUNT_CLASS_HASH = "0x04c6d6cf894f8bc96bb9c525e6853e5483177841f7388f74a46cfda6f028c755";

export async function POST(request: NextRequest) {
  try {
    const { privateKey } = await request.json();

    if (!privateKey) {
      return NextResponse.json(
        { error: "Private key is required" },
        { status: 400 }
      );
    }

    // Validate private key format
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
      return NextResponse.json(
        { error: "Invalid private key format" },
        { status: 400 }
      );
    }

    // Get public key from private key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    console.log("🔑 Derived public key:", publicKey);

    // Initialize RPC provider
    const provider = new RpcProvider({
      nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 
               "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
    });

    // Try to derive address using ArgentX account structure
    // The address is computed from: hash(class_hash, salt, constructor_calldata)
    const constructorCalldata = CallData.compile({
      owner: publicKey,
      guardian: "0x0" // No guardian for basic accounts
    });

    // Calculate the contract address
    const salt = publicKey; // Using public key as salt
    
    const address = hash.calculateContractAddressFromHash(
      salt,
      ARGENTX_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0 // deployer address (0 for counterfactual)
    );

    console.log("✅ Derived wallet address:", address);

    // Try to check if the account exists on-chain
    try {
      const accountNonce = await provider.getNonceForAddress(address);
      console.log("✅ Account exists on-chain with nonce:", accountNonce);
    } catch (error) {
      console.log("ℹ️ Account not yet deployed (counterfactual address)");
    }

    return NextResponse.json({
      success: true,
      address: address,
      publicKey: publicKey,
      isDeployed: false, // We can enhance this later
    });
  } catch (error: any) {
    console.error("❌ Error deriving wallet address:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to derive wallet address",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

