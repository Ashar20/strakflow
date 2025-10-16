import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChipiServerSDK } from "@chipi-stack/backend";

export async function POST(request: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the bearer token from the request
    const { bearerToken } = await request.json();
    
    if (!bearerToken) {
      return NextResponse.json(
        { error: "Bearer token is required" },
        { status: 400 }
      );
    }

    // Initialize Chippi Pay server SDK with secret key
    const chipiSDK = new ChipiServerSDK({
      apiPublicKey: process.env.NEXT_PUBLIC_CHIPI_API_KEY!,
      apiSecretKey: process.env.CHIPI_SECRET_KEY!,
      environment: (process.env.NEXT_PUBLIC_CHIPI_ENV as "development" | "production") || "production",
      nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
    });

    // Create wallet using the bearer token
    const wallet = await chipiSDK.createWallet({
      params: {
        encryptKey: `encrypt-${userId}`,
        externalUserId: userId
      },
      bearerToken
    });

    console.log("✅ Wallet created successfully:", wallet);

    return NextResponse.json({
      success: true,
      wallet: {
        address: wallet.wallet.normalizedPublicKey || wallet.wallet.publicKey,
        publicKey: wallet.wallet.publicKey,
      }
    });
  } catch (error: any) {
    console.error("❌ Error creating Chippi Pay wallet:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to create wallet",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

