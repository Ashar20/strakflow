import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChipiServerSDK } from "@chipi-stack/backend";

// Token mapping for Chippi Pay SDK
type ChainToken = "ETH" | "STRK" | "USDC" | "USDT";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Transfer API called");

    // Get Clerk authentication
    const { userId } = await auth();
    
    if (!userId) {
      console.error("❌ No user ID from Clerk");
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    console.log(`✅ Authenticated user: ${userId}`);

    // Parse request body
    const body = await request.json();
    const { token, receiverAddress, amount, encryptKey, walletAddress } = body;

    console.log(`📦 Transfer request:`, {
      token,
      receiverAddress,
      amount,
      walletAddress,
    });

    // Validate inputs
    if (!token || !receiverAddress || !amount || !encryptKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get API keys from environment
    const apiSecretKey = process.env.CHIPI_SECRET_KEY;
    const apiPublicKey = process.env.NEXT_PUBLIC_CHIPI_API_KEY;

    if (!apiSecretKey || !apiPublicKey) {
      console.error("❌ Missing Chippi Pay API keys");
      return NextResponse.json(
        { error: "Server configuration error - Missing API keys" },
        { status: 500 }
      );
    }

    console.log("🔑 Initializing Chippi Pay SDK...");

    // Initialize Chippi Pay SDK
    const chipiSDK = new ChipiServerSDK({
      apiPublicKey,
      apiSecretKey,
      nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8",
    });

    console.log("📡 Fetching wallet from Chippi Pay...");

    // Get the wallet for this user
    const wallet = await chipiSDK.getWallet({
      externalUserId: userId,
    });

    if (!wallet) {
      console.error("❌ No wallet found for user");
      return NextResponse.json(
        { error: "Wallet not found. Please create a wallet first." },
        { status: 404 }
      );
    }

    console.log(`✅ Wallet found: ${wallet.publicKey}`);
    console.log(`💸 Initiating transfer...`);
    console.log(`🔑 Using encryption key: ${encryptKey ? "✓" : "✗"}`);

    // Perform the transfer using Chippi Pay SDK
    // The SDK expects params object with nested structure
    const transferResponse = await chipiSDK.transfer({
      params: {
        encryptKey,
        wallet: {
          publicKey: wallet.publicKey,
          encryptedPrivateKey: wallet.encryptedPrivateKey,
        },
        amount: String(amount),
        token: token as ChainToken,
        recipient: receiverAddress,
      },
    });

    console.log("✅ Transfer successful:", transferResponse);

    return NextResponse.json({
      success: true,
      transactionHash: transferResponse,
      details: {
        from: wallet.publicKey,
        to: receiverAddress,
        amount,
        token,
      },
    });
  } catch (error) {
    console.error("❌ Error in transfer API:", error);

    // Check for specific errors
    const errorMessage = error instanceof Error ? error.message : "Transfer failed";
    
    // Decryption error
    if (errorMessage.includes("Decryption failed") || errorMessage.includes("Malformed UTF-8")) {
      return NextResponse.json(
        {
          error: "Incorrect encryption key. Please enter the correct encryption key you used when creating your Chippi Pay wallet.",
          details: "The encryption key you provided does not match the one used to encrypt this wallet.",
        },
        { status: 401 }
      );
    }

    // Insufficient balance error
    if (errorMessage.includes("u256_sub Overflow") || errorMessage.includes("argent/multicall-failed")) {
      return NextResponse.json(
        {
          error: `Insufficient balance. You don't have enough tokens to complete this transfer.`,
          details: `Please check your wallet balance and try transferring a smaller amount, or add more tokens to your wallet.`,
          errorType: "INSUFFICIENT_BALANCE",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

